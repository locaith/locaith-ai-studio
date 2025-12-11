-- FIX CHAT SYSTEM V14 (FORCE RESET & REBUILD)
-- Script này sẽ TẮT RLS, XÓA sạch mọi thứ cũ, và CÀI ĐẶT lại từ đầu.
-- Đảm bảo khắc phục lỗi ERR_ABORTED do recursion hoặc policy cũ còn sót lại.

BEGIN;

-- 1. Tạm thời tắt RLS để tránh lỗi khi đang xóa (Safety first)
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members DISABLE ROW LEVEL SECURITY;

-- 2. Xóa TOÀN BỘ Policy cũ (Dọn sạch sẽ)
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

-- 3. Xóa Function cũ (Cascade để xóa hết dependency)
DROP FUNCTION IF EXISTS public.check_group_access_v13(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.check_group_access_v12(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.check_group_access_v11(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.check_group_access_v10(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.check_group_access_v9(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.check_group_access_v8(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.check_group_access(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.is_group_member(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_my_group_ids() CASCADE;

-- 4. Tạo lại Functions với quyền SECURITY DEFINER (Quan trọng: Quyền Postgres)
-- Hàm lấy danh sách nhóm của tôi
CREATE OR REPLACE FUNCTION public.get_my_group_ids()
RETURNS TABLE (group_id UUID) 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public, extensions
AS $$
BEGIN
  -- Trả về danh sách group_id mà user hiện tại đang tham gia
  RETURN QUERY 
  SELECT gm.group_id 
  FROM public.group_members gm 
  WHERE gm.user_id = (select auth.uid());
END;
$$;

-- Hàm kiểm tra quyền truy cập nhóm (trả về true/false)
CREATE OR REPLACE FUNCTION public.check_group_access_v14(_group_id UUID)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public, extensions
AS $$
BEGIN
  IF _group_id IS NULL THEN 
    RETURN FALSE; 
  END IF;
  
  -- Kiểm tra xem user có trong nhóm này không
  RETURN EXISTS (
    SELECT 1 
    FROM public.group_members gm
    WHERE gm.group_id = _group_id 
    AND gm.user_id = (select auth.uid())
  );
END;
$$;

-- Cấp quyền thực thi cho functions
GRANT EXECUTE ON FUNCTION public.get_my_group_ids() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_group_ids() TO service_role;
GRANT EXECUTE ON FUNCTION public.check_group_access_v14(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_group_access_v14(UUID) TO service_role;

-- 5. Bật lại RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- 6. Thiết lập Policies Mới (Đơn giản & Hiệu quả)

-- === MESSAGES ===
-- Xem tin nhắn cá nhân (DM)
CREATE POLICY "v14_dm_select" ON public.messages FOR SELECT
  USING (
    group_id IS NULL 
    AND (sender_id = auth.uid() OR receiver_id = auth.uid())
  );

-- Gửi tin nhắn cá nhân (DM)
CREATE POLICY "v14_dm_insert" ON public.messages FOR INSERT
  WITH CHECK (
    group_id IS NULL 
    AND sender_id = auth.uid()
  );

-- Xem tin nhắn nhóm (Dùng hàm Security Definer để tránh recursion)
CREATE POLICY "v14_group_msg_select" ON public.messages FOR SELECT
  USING (
    group_id IS NOT NULL 
    AND check_group_access_v14(group_id)
  );

-- Gửi tin nhắn nhóm
CREATE POLICY "v14_group_msg_insert" ON public.messages FOR INSERT
  WITH CHECK (
    group_id IS NOT NULL 
    AND sender_id = auth.uid() 
    AND check_group_access_v14(group_id)
  );

-- === GROUPS ===
-- Xem nhóm: Người tạo HOẶC là thành viên (dùng hàm get_my_group_ids)
CREATE POLICY "v14_groups_select" ON public.groups FOR SELECT
  USING (
    created_by = auth.uid() 
    OR id IN (SELECT group_id FROM get_my_group_ids())
  );

-- Tạo nhóm
CREATE POLICY "v14_groups_insert" ON public.groups FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- Sửa nhóm
CREATE POLICY "v14_groups_update" ON public.groups FOR UPDATE
  USING (created_by = auth.uid());

-- === GROUP MEMBERS ===
-- Xem thành viên: Chính mình HOẶC thành viên cùng nhóm
-- Logic: Cho phép xem row nếu user_id là mình, HOẶC row thuộc về group mà mình đang tham gia
CREATE POLICY "v14_members_select" ON public.group_members FOR SELECT
  USING (
    user_id = auth.uid() 
    OR group_id IN (SELECT group_id FROM get_my_group_ids())
  );

-- Thêm thành viên: Người tạo nhóm (admin) hoặc chính mình (nếu logic cho phép tự join)
-- Ở đây giới hạn: Chỉ người tạo nhóm mới được thêm thành viên vào nhóm họ tạo
CREATE POLICY "v14_members_insert" ON public.group_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.groups 
      WHERE id = group_id 
      AND created_by = auth.uid()
    )
    OR user_id = auth.uid() -- Cho phép tự join nếu cần (optional)
  );

-- Xóa thành viên
CREATE POLICY "v14_members_delete" ON public.group_members FOR DELETE
  USING (
    user_id = auth.uid() -- Tự rời nhóm
    OR EXISTS (
      SELECT 1 FROM public.groups 
      WHERE id = group_id 
      AND created_by = auth.uid() -- Admin xóa
    )
  );

COMMIT;
