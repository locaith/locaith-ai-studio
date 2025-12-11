-- FIX GROUP CREATION V2
-- Mục tiêu: Sửa lỗi 42501 khi tạo nhóm và lỗi thêm thành viên

-- 0. Đảm bảo hàm helper tồn tại (copy từ v15)
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
    AND user_id = (select auth.uid())
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_member_of_group(uuid) TO authenticated;

-- 1. Đảm bảo RLS được bật
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- 2. Sửa Policy cho bảng GROUPS (Cho phép tạo nhóm)
DROP POLICY IF EXISTS "group_insert" ON public.groups;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.groups;

CREATE POLICY "group_insert_policy" ON public.groups FOR INSERT
WITH CHECK (
    auth.uid() = created_by
);

-- Policy xem nhóm (cần thiết để select sau khi insert)
DROP POLICY IF EXISTS "group_view" ON public.groups;
CREATE POLICY "group_view_policy" ON public.groups FOR SELECT
USING (
    -- Xem nếu là thành viên HOẶC là người tạo (để tránh lỗi khi vừa tạo xong chưa kịp thêm member)
    created_by = auth.uid() OR public.is_member_of_group(id)
);

-- Policy sửa nhóm
DROP POLICY IF EXISTS "group_update" ON public.groups;
CREATE POLICY "group_update_policy" ON public.groups FOR UPDATE
USING (
    created_by = auth.uid() OR public.is_member_of_group(id)
);

-- 3. Sửa Policy cho bảng GROUP_MEMBERS (Cho phép thêm thành viên)
DROP POLICY IF EXISTS "member_insert" ON public.group_members;

CREATE POLICY "member_insert_policy" ON public.group_members FOR INSERT
WITH CHECK (
    -- 1. Tự thêm chính mình
    user_id = auth.uid() 
    OR 
    -- 2. Là người tạo nhóm (cho phép thêm bạn bè ngay khi tạo nhóm)
    EXISTS (
        SELECT 1 FROM public.groups 
        WHERE id = group_id AND created_by = auth.uid()
    )
    OR
    -- 3. Là thành viên nhóm (logic mời người khác - cần check quyền admin nếu muốn chặt chẽ hơn)
    public.is_member_of_group(group_id)
);

-- 4. Cấp lại quyền cho chắc chắn
GRANT ALL ON public.groups TO authenticated;
GRANT ALL ON public.group_members TO authenticated;

-- Force reload schema cache
NOTIFY pgrst, 'reload schema';
