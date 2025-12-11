-- FIX CHAT V16: CLEANUP & RELOAD
-- Chạy script này để đảm bảo Schema Cache được làm mới và xóa bỏ các Trigger gây lỗi.

-- 1. Xóa các Trigger tiềm ẩn trên bảng messages (nếu có)
DROP TRIGGER IF EXISTS on_message_created ON public.messages;
DROP TRIGGER IF EXISTS update_unread_count ON public.messages;
-- (Thêm các tên trigger khác nếu bạn nghi ngờ, hoặc dùng vòng lặp xóa hết)
DO $$ 
DECLARE 
  r RECORD; 
BEGIN 
  FOR r IN (
    SELECT trigger_name, event_object_table 
    FROM information_schema.triggers 
    WHERE event_object_table = 'messages' 
    AND trigger_schema = 'public'
  ) LOOP 
    EXECUTE 'DROP TRIGGER IF EXISTS "' || r.trigger_name || '" ON public."messages"'; 
  END LOOP;
END $$;

-- 2. Đảm bảo RLS đã bật
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- 3. Cấp lại quyền cho Function (đề phòng bị trôi)
GRANT EXECUTE ON FUNCTION public.is_member_of_group(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_member_of_group(uuid) TO service_role;

-- 4. FORCE RELOAD SCHEMA CACHE (Quan trọng với Supabase/PostgREST)
NOTIFY pgrst, 'reload schema';
