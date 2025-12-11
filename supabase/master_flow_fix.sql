-- ==============================================================================
-- MASTER FLOW FIX: FRIENDSHIP & CHAT SYSTEM
-- ==============================================================================
-- Script này tổng hợp toàn bộ logic cho luồng: Tìm kiếm -> Kết bạn -> Chat -> Hủy kết bạn
-- Đảm bảo tính nhất quán dữ liệu và bảo mật 2 chiều.

BEGIN;

-- 1. CẤU HÌNH BẢNG & KHÓA NGOẠI (Foreign Keys)
-- ------------------------------------------------------------------------------
-- Đảm bảo bảng friend_requests có khóa ngoại đến profiles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'friend_requests_sender_id_fkey') THEN
        ALTER TABLE public.friend_requests ADD CONSTRAINT friend_requests_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'friend_requests_receiver_id_fkey') THEN
        ALTER TABLE public.friend_requests ADD CONSTRAINT friend_requests_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;

    -- Đảm bảo status có giá trị mặc định là 'pending'
    ALTER TABLE public.friend_requests ALTER COLUMN status SET DEFAULT 'pending';
    
    -- Fix dữ liệu cũ (NULL status)
    UPDATE public.friend_requests SET status = 'pending' WHERE status IS NULL;
END;
$$;

-- 2. QUYỀN TRUY CẬP (RLS POLICIES)
-- ------------------------------------------------------------------------------
-- A. PROFILES: Công khai để A tìm được B
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles" ON public.profiles;
CREATE POLICY "Public profiles" ON public.profiles FOR SELECT USING (true);

-- B. FRIEND REQUESTS: Bảo mật luồng gửi/nhận
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;

-- Xem: Người gửi và Người nhận đều thấy
DROP POLICY IF EXISTS "View requests" ON public.friend_requests;
CREATE POLICY "View requests" ON public.friend_requests
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Gửi: Chỉ người gửi được tạo
DROP POLICY IF EXISTS "Create requests" ON public.friend_requests;
CREATE POLICY "Create requests" ON public.friend_requests
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Cập nhật (Đồng ý): Chỉ người nhận được update status
DROP POLICY IF EXISTS "Update requests" ON public.friend_requests;
CREATE POLICY "Update requests" ON public.friend_requests
  FOR UPDATE USING (auth.uid() = receiver_id);

-- Xóa (Hủy/Từ chối): Cả 2 đều có quyền xóa để làm sạch danh sách
DROP POLICY IF EXISTS "Delete requests" ON public.friend_requests;
CREATE POLICY "Delete requests" ON public.friend_requests
  FOR DELETE USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- C. CONTACTS: Danh sách bạn bè
-- Đảm bảo các cột cần thiết tồn tại
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS muted_until BIGINT DEFAULT NULL;

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Xem: Chỉ xem danh sách của chính mình
DROP POLICY IF EXISTS "View contacts" ON public.contacts;
CREATE POLICY "View contacts" ON public.contacts
  FOR SELECT USING (auth.uid() = user_id);

-- D. MESSAGES: Chat Realtime & Bảo mật quan hệ bạn bè
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Xem: Chỉ xem tin nhắn của mình (gửi hoặc nhận)
DROP POLICY IF EXISTS "View messages" ON public.messages;
CREATE POLICY "View messages" ON public.messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Gửi: CHỈ GỬI ĐƯỢC NẾU LÀ BẠN BÈ (Hoặc trong nhóm)
-- Điều này chặn việc chat nếu đã hủy kết bạn.
DROP POLICY IF EXISTS "Send messages" ON public.messages;
CREATE POLICY "Send messages" ON public.messages FOR INSERT 
WITH CHECK (
  auth.uid() = sender_id 
  AND (
     group_id IS NOT NULL -- Cho phép chat nhóm (nếu có tính năng này)
     OR 
     EXISTS (
       SELECT 1 FROM public.contacts 
       WHERE user_id = auth.uid() 
       AND contact_id = receiver_id
     )
  )
);

-- 3. LOGIC XỬ LÝ (FUNCTIONS)
-- ------------------------------------------------------------------------------

-- Function: Chấp nhận kết bạn (Transaction an toàn)
CREATE OR REPLACE FUNCTION public.accept_friend_request(request_id bigint)
RETURNS void AS $$
DECLARE
  req record;
BEGIN
  -- Lấy thông tin request
  SELECT * INTO req FROM public.friend_requests WHERE id = request_id;
  
  IF req IS NULL THEN
    RAISE EXCEPTION 'Không tìm thấy lời mời';
  END IF;

  -- Kiểm tra quyền (chỉ người nhận mới được chấp nhận)
  IF req.receiver_id = auth.uid() AND req.status = 'pending' THEN
    -- 1. Cập nhật status thành 'accepted'
    UPDATE public.friend_requests SET status = 'accepted' WHERE id = request_id;
    
    -- 2. Tạo contact cho User (người nhận) -> Sender
    INSERT INTO public.contacts (user_id, contact_id, status, created_at)
    VALUES (req.receiver_id, req.sender_id, 'accepted', now())
    ON CONFLICT (user_id, contact_id) DO UPDATE SET status = 'accepted';
    
    -- 3. Tạo contact cho Sender -> User (người nhận)
    INSERT INTO public.contacts (user_id, contact_id, status, created_at)
    VALUES (req.sender_id, req.receiver_id, 'accepted', now())
    ON CONFLICT (user_id, contact_id) DO UPDATE SET status = 'accepted';
    
  ELSE
    RAISE EXCEPTION 'Không có quyền hoặc lời mời đã được xử lý';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Hủy kết bạn (Xóa 2 chiều sạch sẽ)
CREATE OR REPLACE FUNCTION public.unfriend_user(target_user_id uuid)
RETURNS void AS $$
BEGIN
  -- 1. Xóa trong contacts (Cả 2 chiều A->B và B->A)
  DELETE FROM public.contacts 
  WHERE (user_id = auth.uid() AND contact_id = target_user_id)
     OR (user_id = target_user_id AND contact_id = auth.uid());

  -- 2. Xóa lời mời kết bạn cũ (Để có thể gửi lại lời mời mới nếu muốn)
  DELETE FROM public.friend_requests
  WHERE (sender_id = auth.uid() AND receiver_id = target_user_id)
     OR (sender_id = target_user_id AND receiver_id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. REALTIME (Kích hoạt thông báo tức thì)
-- ------------------------------------------------------------------------------
-- Kích hoạt Realtime cho các bảng quan trọng
DO $$
BEGIN
    -- friend_requests: Để hiện thông báo lời mời ngay lập tức
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'friend_requests') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.friend_requests;
    END IF;

    -- contacts: Để cập nhật danh sách bạn bè khi được chấp nhận/hủy
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'contacts') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.contacts;
    END IF;

    -- messages: Để chat realtime
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'messages') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
    END IF;
END;
$$;

COMMIT;
