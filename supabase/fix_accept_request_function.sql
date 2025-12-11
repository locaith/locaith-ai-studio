-- Fix: Change accept_friend_request to accept text to avoid type mismatch issues
-- and ensure robustness regardless of ID type (bigint vs uuid)

BEGIN;

-- Drop the old function signature
DROP FUNCTION IF EXISTS public.accept_friend_request(bigint);
DROP FUNCTION IF EXISTS public.accept_friend_request(uuid);
DROP FUNCTION IF EXISTS public.accept_friend_request(text);

-- Re-create with text input and robust casting
CREATE OR REPLACE FUNCTION public.accept_friend_request(request_id text)
RETURNS void AS $$
DECLARE
  req record;
BEGIN
  -- Lấy thông tin request bằng cách so sánh text
  SELECT * INTO req FROM public.friend_requests WHERE id::text = request_id;
  
  IF req IS NULL THEN
    RAISE EXCEPTION 'Không tìm thấy lời mời (ID: %)', request_id;
  END IF;

  -- Kiểm tra quyền (chỉ người nhận mới được chấp nhận)
  IF req.receiver_id = auth.uid() AND req.status = 'pending' THEN
    -- 1. Cập nhật status thành 'accepted'
    UPDATE public.friend_requests SET status = 'accepted' WHERE id::text = request_id;
    
    -- 2. Tạo contact cho User (người nhận) -> Sender
    INSERT INTO public.contacts (user_id, contact_id, status, created_at, is_pinned, muted_until)
    VALUES (req.receiver_id, req.sender_id, 'accepted', now(), false, null)
    ON CONFLICT (user_id, contact_id) DO UPDATE SET status = 'accepted';
    
    -- 3. Tạo contact cho Sender -> User (người nhận)
    INSERT INTO public.contacts (user_id, contact_id, status, created_at, is_pinned, muted_until)
    VALUES (req.sender_id, req.receiver_id, 'accepted', now(), false, null)
    ON CONFLICT (user_id, contact_id) DO UPDATE SET status = 'accepted';
    
  ELSE
    RAISE EXCEPTION 'Không có quyền hoặc lời mời đã được xử lý (Receiver: %, Auth: %, Status: %)', req.receiver_id, auth.uid(), req.status;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
