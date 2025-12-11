-- FIX CHAT V18 (TYPE CAST & OMNI CLEANUP)
-- Mục tiêu: Sửa lỗi "operator does not exist: uuid = bigint" bằng cách ép kiểu dữ liệu về UUID
-- Hướng dẫn: Copy toàn bộ nội dung và chạy trong Supabase SQL Editor

-- 1. Tắt RLS tạm thời để tránh lỗi khi sửa đổi
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments DISABLE ROW LEVEL SECURITY;

-- 2. Xóa sạch policies cũ (Vòng lặp an toàn)
DO $$ 
DECLARE 
    pol record;
BEGIN 
    -- Xóa policies của messages
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'messages' 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.messages', pol.policyname);
    END LOOP;

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

    -- Xóa policies của appointments
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'appointments' 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.appointments', pol.policyname);
    END LOOP;
END $$;

-- 3. Ép kiểu dữ liệu về UUID (Quan trọng nhất)
-- Sử dụng USING column::text::uuid để đảm bảo chuyển đổi thành công từ bigint hoặc text

-- Bảng MESSAGES
ALTER TABLE public.messages 
    ALTER COLUMN sender_id TYPE UUID USING sender_id::text::uuid,
    ALTER COLUMN receiver_id TYPE UUID USING receiver_id::text::uuid;

-- Xử lý group_id trong messages (có thể null)
ALTER TABLE public.messages 
    ALTER COLUMN group_id TYPE UUID USING group_id::text::uuid;

-- Bảng GROUPS
ALTER TABLE public.groups 
    ALTER COLUMN created_by TYPE UUID USING created_by::text::uuid;

-- Bảng GROUP_MEMBERS
ALTER TABLE public.group_members 
    ALTER COLUMN user_id TYPE UUID USING user_id::text::uuid,
    ALTER COLUMN group_id TYPE UUID USING group_id::text::uuid;

-- Bảng APPOINTMENTS
ALTER TABLE public.appointments 
    ALTER COLUMN created_by TYPE UUID USING created_by::text::uuid,
    ALTER COLUMN contact_id TYPE UUID USING contact_id::text::uuid;
-- Xử lý group_id trong appointments (có thể null)
ALTER TABLE public.appointments 
    ALTER COLUMN group_id TYPE UUID USING group_id::text::uuid;


-- 4. Tạo lại Function helper (SECURITY DEFINER)
DROP FUNCTION IF EXISTS public.is_member_of_group(uuid);
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


-- 5. Tạo lại Policies (Đã chuẩn hóa UUID)

-- === MESSAGES ===
CREATE POLICY "messages_insert_policy" ON public.messages FOR INSERT
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "messages_select_policy" ON public.messages FOR SELECT
USING (
    (auth.uid() = sender_id) OR 
    (auth.uid() = receiver_id) OR 
    (group_id IS NOT NULL AND public.is_member_of_group(group_id))
);

CREATE POLICY "messages_update_policy" ON public.messages FOR UPDATE
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "messages_delete_policy" ON public.messages FOR DELETE
USING (auth.uid() = sender_id);


-- === GROUPS ===
CREATE POLICY "groups_insert_policy" ON public.groups FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "groups_select_policy" ON public.groups FOR SELECT
USING (
    created_by = auth.uid() 
    OR 
    EXISTS (SELECT 1 FROM public.group_members WHERE group_id = id AND user_id = auth.uid())
);

CREATE POLICY "groups_update_policy" ON public.groups FOR UPDATE
USING (
    created_by = auth.uid() 
    OR 
    EXISTS (SELECT 1 FROM public.group_members WHERE group_id = id AND user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "groups_delete_policy" ON public.groups FOR DELETE
USING (auth.uid() = created_by);


-- === GROUP_MEMBERS ===
CREATE POLICY "members_select_policy" ON public.group_members FOR SELECT
USING (
    user_id = auth.uid() 
    OR
    EXISTS (SELECT 1 FROM public.group_members gm WHERE gm.group_id = group_members.group_id AND gm.user_id = auth.uid())
    OR
    EXISTS (SELECT 1 FROM public.groups g WHERE g.id = group_members.group_id AND g.created_by = auth.uid())
);

CREATE POLICY "members_insert_policy" ON public.group_members FOR INSERT
WITH CHECK (
    -- Admin hoặc Creator thêm thành viên
    EXISTS (
        SELECT 1 FROM public.groups g 
        WHERE g.id = group_members.group_id AND g.created_by = auth.uid()
    )
    OR
    EXISTS (
        SELECT 1 FROM public.group_members gm 
        WHERE gm.group_id = group_members.group_id AND gm.user_id = auth.uid() AND gm.role = 'admin'
    )
);

CREATE POLICY "members_delete_policy" ON public.group_members FOR DELETE
USING (
    -- Tự rời nhóm
    user_id = auth.uid()
    OR
    -- Admin/Creator xóa thành viên
    EXISTS (
        SELECT 1 FROM public.groups g 
        WHERE g.id = group_members.group_id AND g.created_by = auth.uid()
    )
    OR
    EXISTS (
        SELECT 1 FROM public.group_members gm 
        WHERE gm.group_id = group_members.group_id AND gm.user_id = auth.uid() AND gm.role = 'admin'
    )
);


-- === APPOINTMENTS ===
CREATE POLICY "appointments_select_policy" ON public.appointments FOR SELECT
USING (
    created_by = auth.uid() OR contact_id = auth.uid()
    OR 
    (group_id IS NOT NULL AND public.is_member_of_group(group_id))
);

CREATE POLICY "appointments_insert_policy" ON public.appointments FOR INSERT
WITH CHECK (created_by = auth.uid());

CREATE POLICY "appointments_update_policy" ON public.appointments FOR UPDATE
USING (created_by = auth.uid() OR contact_id = auth.uid());

CREATE POLICY "appointments_delete_policy" ON public.appointments FOR DELETE
USING (created_by = auth.uid());


-- 6. Bật lại RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- 7. Cấp quyền
GRANT ALL ON public.messages TO authenticated;
GRANT ALL ON public.groups TO authenticated;
GRANT ALL ON public.group_members TO authenticated;
GRANT ALL ON public.appointments TO authenticated;
GRANT ALL ON public.messages TO service_role;
GRANT ALL ON public.groups TO service_role;
GRANT ALL ON public.group_members TO service_role;
GRANT ALL ON public.appointments TO service_role;
