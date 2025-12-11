-- FIX: Friend Request Acceptance Error & Missing Columns
-- Run this script in Supabase SQL Editor to resolve "Lỗi khi chấp nhận" and "column does not exist" errors.

BEGIN;

-- 1. Fix missing columns in 'contacts' table
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS muted_until BIGINT DEFAULT NULL;

-- 2. Fix accept_friend_request function to handle IDs robustly (text input)
DROP FUNCTION IF EXISTS public.accept_friend_request(bigint);
DROP FUNCTION IF EXISTS public.accept_friend_request(uuid);
DROP FUNCTION IF EXISTS public.accept_friend_request(text);

CREATE OR REPLACE FUNCTION public.accept_friend_request(request_id text)
RETURNS void AS $$
DECLARE
  req record;
BEGIN
  -- Cast ID to text for comparison to handle both bigint and uuid types
  SELECT * INTO req FROM public.friend_requests WHERE id::text = request_id;
  
  IF req IS NULL THEN
    RAISE EXCEPTION 'Không tìm thấy lời mời (ID: %)', request_id;
  END IF;

  -- Verify permissions
  IF req.receiver_id = auth.uid() AND req.status = 'pending' THEN
    -- Update status
    UPDATE public.friend_requests SET status = 'accepted' WHERE id::text = request_id;
    
    -- Create mutual contacts (including new columns)
    INSERT INTO public.contacts (user_id, contact_id, status, created_at, is_pinned, muted_until)
    VALUES (req.receiver_id, req.sender_id, 'accepted', now(), false, null)
    ON CONFLICT (user_id, contact_id) DO UPDATE SET status = 'accepted';
    
    INSERT INTO public.contacts (user_id, contact_id, status, created_at, is_pinned, muted_until)
    VALUES (req.sender_id, req.receiver_id, 'accepted', now(), false, null)
    ON CONFLICT (user_id, contact_id) DO UPDATE SET status = 'accepted';
    
  ELSE
    RAISE EXCEPTION 'Không có quyền hoặc lời mời đã được xử lý (Status: %)', req.status;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
