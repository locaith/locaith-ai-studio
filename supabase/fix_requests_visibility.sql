-- ==============================================================================
-- FIX: FRIEND REQUEST VISIBILITY & MISSING DATA
-- ==============================================================================
-- Chạy script này để sửa lỗi "Không thấy lời mời kết bạn" hoặc lỗi dữ liệu người gửi.

-- 1. ĐẢM BẢO LIÊN KẾT KHÓA NGOẠI (FOREIGN KEYS)
-- ------------------------------------------------------------------------------
-- Cần thiết để query: .select('*, sender:sender_id(full_name, ...)') hoạt động
DO $$
BEGIN
    -- Kiểm tra và tạo FK cho sender_id -> profiles
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'friend_requests_sender_id_fkey'
    ) THEN
        ALTER TABLE public.friend_requests 
        ADD CONSTRAINT friend_requests_sender_id_fkey 
        FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;

    -- Kiểm tra và tạo FK cho receiver_id -> profiles
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'friend_requests_receiver_id_fkey'
    ) THEN
        ALTER TABLE public.friend_requests 
        ADD CONSTRAINT friend_requests_receiver_id_fkey 
        FOREIGN KEY (receiver_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END;
$$;

-- 2. ĐẢM BẢO QUYỀN ĐỌC PROFILE (Profiles RLS)
-- ------------------------------------------------------------------------------
-- Nếu không có quyền đọc profile người gửi, dữ liệu sender sẽ bị null
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' AND policyname = 'Public profiles'
    ) THEN
        CREATE POLICY "Public profiles" ON public.profiles
        FOR SELECT USING (true); -- Cho phép tất cả mọi người xem thông tin cơ bản (tên, avatar)
    END IF;
END;
$$;

-- 3. CẤP LẠI QUYỀN CHO FRIEND REQUESTS (Để chắc chắn)
-- ------------------------------------------------------------------------------
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "View requests" ON public.friend_requests;
CREATE POLICY "View requests" ON public.friend_requests
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- 4. KIỂM TRA LẠI REALTIME
-- ------------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'friend_requests'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.friend_requests;
    END IF;
END;
$$;
