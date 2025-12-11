-- FIX CHAT V15 FINAL
-- Mục tiêu: Loại bỏ hoàn toàn lỗi ERR_ABORTED bằng cách tách Policy và dùng hàm SECURITY DEFINER tối ưu.

-- 1. Tạm thời tắt RLS để tránh lỗi khi đang thao tác
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members DISABLE ROW LEVEL SECURITY;

-- 2. Xóa sạch các Policy cũ (đảm bảo không còn policy rác)
DROP POLICY IF EXISTS "view_messages_v14" ON public.messages;
DROP POLICY IF EXISTS "view_groups_v14" ON public.groups;
DROP POLICY IF EXISTS "view_group_members_v14" ON public.group_members;
DROP POLICY IF EXISTS "insert_messages_v14" ON public.messages;
DROP POLICY IF EXISTS "update_messages_v14" ON public.messages;
DROP POLICY IF EXISTS "insert_groups_v14" ON public.groups;
DROP POLICY IF EXISTS "insert_group_members_v14" ON public.group_members;
DROP POLICY IF EXISTS "delete_group_members_v14" ON public.group_members;

-- Xóa các policy cũ hơn nếu còn sót
DO $$ 
DECLARE 
  r RECORD; 
BEGIN 
  FOR r IN (
    SELECT policyname, tablename 
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename IN ('messages', 'groups', 'group_members')
  ) LOOP 
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.' || r.tablename; 
  END LOOP;
END $$;

-- 3. Xóa các Function cũ (Cascade để xóa hết)
DROP FUNCTION IF EXISTS public.check_group_access_v14(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_my_group_ids() CASCADE;
DROP FUNCTION IF EXISTS public.is_member_of_group(uuid) CASCADE;

-- 4. Tạo hàm kiểm tra thành viên nhóm (SECURITY DEFINER - Bỏ qua RLS)
-- Đây là chìa khóa để chống đệ quy. Hàm này chạy với quyền owner (postgres) nên đọc bảng trực tiếp mà không kích hoạt Policy.
CREATE OR REPLACE FUNCTION public.is_member_of_group(_group_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  -- Kiểm tra trực tiếp trong bảng group_members
  -- Vì là SECURITY DEFINER, nó sẽ bỏ qua RLS của bảng group_members
  RETURN EXISTS (
    SELECT 1 
    FROM public.group_members 
    WHERE group_id = _group_id 
    AND user_id = (select auth.uid())
  );
END;
$$;

-- Cấp quyền cho user authenticated dùng hàm này
GRANT EXECUTE ON FUNCTION public.is_member_of_group(uuid) TO authenticated;

-- 5. Thiết lập Policy mới - TÁCH BIỆT (Split Policies)
-- Thay vì dùng 1 policy phức tạp với OR, ta tách ra để Postgres tối ưu hóa tốt hơn.

-- === BẢNG MESSAGES ===
-- Policy 1: Xem tin nhắn cá nhân (DM)
CREATE POLICY "msg_view_dm" ON public.messages FOR SELECT
USING (
  (sender_id = auth.uid()) OR (receiver_id = auth.uid())
);

-- Policy 2: Xem tin nhắn nhóm
CREATE POLICY "msg_view_group" ON public.messages FOR SELECT
USING (
  group_id IS NOT NULL 
  AND public.is_member_of_group(group_id)
);

-- Policy 3: Gửi tin nhắn (Insert)
CREATE POLICY "msg_insert" ON public.messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id 
  AND (
    (group_id IS NULL) -- DM: Ai cũng gửi được (hoặc thêm logic check friend nếu cần)
    OR 
    (group_id IS NOT NULL AND public.is_member_of_group(group_id)) -- Group: Phải là thành viên
  )
);

-- Policy 4: Cập nhật (đánh dấu đã đọc)
CREATE POLICY "msg_update" ON public.messages FOR UPDATE
USING (
  (sender_id = auth.uid()) OR (receiver_id = auth.uid()) OR (public.is_member_of_group(group_id))
);

-- === BẢNG GROUPS ===
-- Xem nhóm: Nếu là thành viên thì được xem
CREATE POLICY "group_view" ON public.groups FOR SELECT
USING (
  public.is_member_of_group(id)
);

-- Tạo nhóm: Ai cũng được tạo
CREATE POLICY "group_insert" ON public.groups FOR INSERT
WITH CHECK (true);

-- Sửa nhóm: Chỉ admin (logic phức tạp hơn, tạm thời cho phép thành viên sửa hoặc chỉ admin - ở đây cho phép thành viên để đơn giản)
CREATE POLICY "group_update" ON public.groups FOR UPDATE
USING (
  public.is_member_of_group(id)
);

-- === BẢNG GROUP_MEMBERS ===
-- Xem thành viên: Nếu mình ở trong nhóm đó thì xem được các thành viên khác
-- Sử dụng hàm SECURITY DEFINER để tránh đệ quy chính nó!
CREATE POLICY "member_view" ON public.group_members FOR SELECT
USING (
  public.is_member_of_group(group_id)
);

-- Thêm thành viên: Cho phép thêm (thường là khi tạo nhóm hoặc mời)
CREATE POLICY "member_insert" ON public.group_members FOR INSERT
WITH CHECK (
  user_id = auth.uid() -- Tự join
  OR 
  public.is_member_of_group(group_id) -- Hoặc thành viên hiện tại thêm người khác
);

-- Xóa thành viên (Rời nhóm)
CREATE POLICY "member_delete" ON public.group_members FOR DELETE
USING (
  user_id = auth.uid() -- Tự rời
);

-- 6. Bật lại RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- 7. Tạo Index để tăng tốc độ (quan trọng để tránh timeout/abort)
CREATE INDEX IF NOT EXISTS idx_messages_group_id_created ON public.messages(group_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_read ON public.messages(receiver_id, is_read);
CREATE INDEX IF NOT EXISTS idx_group_members_composite ON public.group_members(user_id, group_id);
