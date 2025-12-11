-- FIX CHAT V20 (RECURSION FIX & SECURE FUNCTIONS)
-- Mục tiêu: Sửa lỗi "infinite recursion detected" (42P17) bằng cách sử dụng SECURITY DEFINER functions để phá vỡ vòng lặp RLS.
-- Script này sẽ thay thế toàn bộ policies hiện tại bằng phiên bản an toàn hơn.

-- 1. Tạm thời tắt RLS
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments DISABLE ROW LEVEL SECURITY;

-- 2. Xóa toàn bộ policies cũ (để tránh xung đột)
DO $$ 
DECLARE 
    pol record;
BEGIN 
    FOR pol IN SELECT tablename, policyname FROM pg_policies WHERE tablename IN ('messages', 'groups', 'group_members', 'appointments') 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- 3. Tạo các hàm Helper SECURITY DEFINER (Bypass RLS)
-- Hàm kiểm tra thành viên nhóm
CREATE OR REPLACE FUNCTION public.is_member_of_group(_group_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Chạy với quyền owner (bỏ qua RLS của bảng group_members)
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

-- Hàm kiểm tra người tạo nhóm
CREATE OR REPLACE FUNCTION public.is_group_creator(_group_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Chạy với quyền owner (bỏ qua RLS của bảng groups)
SET search_path = public, extensions
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.groups 
    WHERE id = _group_id 
    AND created_by = auth.uid()
  );
END;
$$;

-- Hàm kiểm tra admin nhóm
CREATE OR REPLACE FUNCTION public.is_group_admin(_group_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Chạy với quyền owner
SET search_path = public, extensions
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.group_members 
    WHERE group_id = _group_id 
    AND user_id = auth.uid()
    AND role = 'admin'
  );
END;
$$;

-- 4. Tạo Policies mới (Sử dụng hàm Helper để tránh đệ quy)

-- === GROUPS ===
-- Xem: Người tạo HOẶC Thành viên (dùng hàm)
CREATE POLICY "groups_select_policy" ON public.groups FOR SELECT
USING (
    created_by = auth.uid() 
    OR 
    public.is_member_of_group(id) -- An toàn vì hàm này là SECURITY DEFINER
);

-- Thêm: Chỉ cần auth.uid khớp
CREATE POLICY "groups_insert_policy" ON public.groups FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- Sửa: Người tạo HOẶC Admin
CREATE POLICY "groups_update_policy" ON public.groups FOR UPDATE
USING (
    created_by = auth.uid() 
    OR 
    public.is_group_admin(id)
);

-- Xóa: Chỉ người tạo
CREATE POLICY "groups_delete_policy" ON public.groups FOR DELETE
USING (created_by = auth.uid());


-- === GROUP_MEMBERS ===
-- Xem: Xem chính mình HOẶC xem thành viên cùng nhóm (dùng hàm)
CREATE POLICY "members_select_policy" ON public.group_members FOR SELECT
USING (
    user_id = auth.uid() 
    OR
    public.is_member_of_group(group_id) -- Kiểm tra xem mình có trong nhóm đó không
);

-- Thêm: Creator HOẶC Admin được thêm người
CREATE POLICY "members_insert_policy" ON public.group_members FOR INSERT
WITH CHECK (
    public.is_group_creator(group_id)
    OR
    public.is_group_admin(group_id)
);

-- Xóa: Tự rời HOẶC Creator/Admin kick
CREATE POLICY "members_delete_policy" ON public.group_members FOR DELETE
USING (
    user_id = auth.uid()
    OR
    public.is_group_creator(group_id)
    OR
    public.is_group_admin(group_id)
);


-- === MESSAGES ===
-- Xem: Gửi, Nhận, hoặc Thành viên nhóm
CREATE POLICY "messages_select_policy" ON public.messages FOR SELECT
USING (
    sender_id = auth.uid() 
    OR receiver_id = auth.uid() 
    OR (group_id IS NOT NULL AND public.is_member_of_group(group_id))
);

-- Thêm: Phải là người gửi
CREATE POLICY "messages_insert_policy" ON public.messages FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- Sửa/Xóa: Chính chủ
CREATE POLICY "messages_update_policy" ON public.messages FOR UPDATE
USING (auth.uid() = sender_id);

CREATE POLICY "messages_delete_policy" ON public.messages FOR DELETE
USING (auth.uid() = sender_id);


-- === APPOINTMENTS ===
-- Xem: Tạo, Được mời, hoặc Thành viên nhóm
CREATE POLICY "appointments_select_policy" ON public.appointments FOR SELECT
USING (
    created_by = auth.uid() 
    OR contact_id = auth.uid() 
    OR (group_id IS NOT NULL AND public.is_member_of_group(group_id))
);

CREATE POLICY "appointments_insert_policy" ON public.appointments FOR INSERT
WITH CHECK (created_by = auth.uid());

CREATE POLICY "appointments_update_policy" ON public.appointments FOR UPDATE
USING (created_by = auth.uid() OR contact_id = auth.uid());

CREATE POLICY "appointments_delete_policy" ON public.appointments FOR DELETE
USING (created_by = auth.uid());


-- 5. Bật lại RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- 6. Cấp quyền thực thi function (Quan trọng)
GRANT EXECUTE ON FUNCTION public.is_member_of_group(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_member_of_group(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.is_group_creator(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_group_creator(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.is_group_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_group_admin(uuid) TO service_role;
