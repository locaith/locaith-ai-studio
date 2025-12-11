-- FIX GROUP CREATION V3 (AGGRESSIVE & FINAL)
-- Mục tiêu: Xóa sạch mọi policy/trigger cũ và tạo lại từ đầu để đảm bảo không còn lỗi 42501
-- Hướng dẫn: Copy toàn bộ nội dung và chạy trong Supabase SQL Editor

-- 1. Xóa Trigger tiềm ẩn (nếu có)
DROP TRIGGER IF EXISTS on_group_created ON public.groups;
DROP TRIGGER IF EXISTS on_group_member_added ON public.group_members;

-- 2. Xóa toàn bộ policies cũ (Vòng lặp an toàn)
DO $$ 
DECLARE 
    pol record;
BEGIN 
    -- Xóa policies của groups
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'groups' 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.groups', pol.policyname);
    END LOOP;

    -- Xóa policies của group_members
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'group_members' 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.group_members', pol.policyname);
    END LOOP;
END $$;

-- 3. Cấp quyền cơ bản (quan trọng nếu bị revoke)
GRANT ALL ON public.groups TO postgres;
GRANT ALL ON public.groups TO service_role;
GRANT ALL ON public.groups TO authenticated;

GRANT ALL ON public.group_members TO postgres;
GRANT ALL ON public.group_members TO service_role;
GRANT ALL ON public.group_members TO authenticated;

-- 4. Đảm bảo RLS được bật
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- 5. Tạo lại hàm helper (SECURITY DEFINER để tránh đệ quy)
CREATE OR REPLACE FUNCTION public.is_member_of_group(_group_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.group_members 
    WHERE group_id = _group_id 
    AND user_id = auth.uid()
  );
END;
$$;
GRANT EXECUTE ON FUNCTION public.is_member_of_group(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_member_of_group(uuid) TO service_role;

-- 6. Tạo Policy cho GROUPS

-- 6.1 INSERT: Cho phép tạo nhóm (quan trọng nhất cho lỗi 42501)
-- Check: auth.uid() phải trùng với created_by gửi lên
CREATE POLICY "groups_insert_policy" ON public.groups FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- 6.2 SELECT: Xem nhóm nếu là thành viên HOẶC là người tạo
CREATE POLICY "groups_select_policy" ON public.groups FOR SELECT
USING (
    created_by = auth.uid() 
    OR 
    EXISTS (SELECT 1 FROM public.group_members WHERE group_id = id AND user_id = auth.uid())
);

-- 6.3 UPDATE: Sửa nhóm nếu là admin (hoặc người tạo)
CREATE POLICY "groups_update_policy" ON public.groups FOR UPDATE
USING (
    created_by = auth.uid() 
    OR 
    EXISTS (SELECT 1 FROM public.group_members WHERE group_id = id AND user_id = auth.uid() AND role = 'admin')
);

-- 6.4 DELETE: Xóa nhóm nếu là người tạo
CREATE POLICY "groups_delete_policy" ON public.groups FOR DELETE
USING (auth.uid() = created_by);

-- 7. Tạo Policy cho GROUP_MEMBERS

-- 7.1 SELECT: Xem thành viên
CREATE POLICY "members_select_policy" ON public.group_members FOR SELECT
USING (
    user_id = auth.uid() -- Xem chính mình
    OR
    EXISTS ( -- Xem người khác cùng nhóm
        SELECT 1 FROM public.group_members gm 
        WHERE gm.group_id = group_members.group_id AND gm.user_id = auth.uid()
    )
    OR
    EXISTS ( -- Người tạo nhóm xem được (phòng trường hợp chưa có record trong group_members)
        SELECT 1 FROM public.groups g
        WHERE g.id = group_members.group_id AND g.created_by = auth.uid()
    )
);

-- 7.2 INSERT: Thêm thành viên
CREATE POLICY "members_insert_policy" ON public.group_members FOR INSERT
WITH CHECK (
    -- Case 1: Tự thêm chính mình (Join)
    user_id = auth.uid()
    OR
    -- Case 2: Người tạo nhóm thêm thành viên (quan trọng cho lúc tạo nhóm)
    EXISTS (
        SELECT 1 FROM public.groups 
        WHERE id = group_id AND created_by = auth.uid()
    )
    OR
    -- Case 3: Admin thêm thành viên
    EXISTS (
        SELECT 1 FROM public.group_members 
        WHERE group_id = group_members.group_id 
        AND user_id = auth.uid() 
        AND role = 'admin'
    )
);

-- 7.3 DELETE: Xóa thành viên
CREATE POLICY "members_delete_policy" ON public.group_members FOR DELETE
USING (
    -- Tự rời nhóm
    user_id = auth.uid()
    OR
    -- Người tạo nhóm xóa
    EXISTS (
        SELECT 1 FROM public.groups 
        WHERE id = group_id AND created_by = auth.uid()
    )
    OR
    -- Admin xóa
    EXISTS (
        SELECT 1 FROM public.group_members 
        WHERE group_id = group_members.group_id 
        AND user_id = auth.uid() 
        AND role = 'admin'
    )
);

-- 8. Force reload schema (để Supabase nhận diện thay đổi ngay lập tức)
NOTIFY pgrst, 'reload schema';
