-- Fix Chat v23: Sửa lỗi cú pháp SQL 42601 và thêm RPC mark_dm_read
-- Script này thay thế hoàn toàn logic của v22 và bổ sung logic cho DM

-- 1. Thêm cột priority và type vào messages nếu chưa có (Idempotent)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'priority') THEN
        ALTER TABLE public.messages ADD COLUMN priority text DEFAULT 'normal';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'type') THEN
        ALTER TABLE public.messages ADD COLUMN type text DEFAULT 'text';
    END IF;
END $$;

-- 2. Thêm cột last_read_at vào group_members để server-side tracking (Idempotent)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'group_members' AND column_name = 'last_read_at') THEN
        ALTER TABLE public.group_members ADD COLUMN last_read_at timestamptz DEFAULT now();
    END IF;
END $$;

-- 3. Hàm đánh dấu đã đọc nhóm
CREATE OR REPLACE FUNCTION public.mark_group_read(_group_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  UPDATE public.group_members
  SET last_read_at = now()
  WHERE group_id = _group_id AND user_id = auth.uid();
END;
$$;

-- 4. Hàm đánh dấu đã đọc DM (MỚI)
-- Khắc phục lỗi RLS không cho phép update tin nhắn của người khác gửi
CREATE OR REPLACE FUNCTION public.mark_dm_read(_sender_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  UPDATE public.messages
  SET is_read = true
  WHERE sender_id = _sender_id 
  AND receiver_id = auth.uid()
  AND is_read = false;
END;
$$;

-- 5. Hàm đếm tổng tin nhắn chưa đọc (DM + Group) - VIẾT LẠI DẠNG SQL
CREATE OR REPLACE FUNCTION public.get_total_unread_count()
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT 
    (
      -- Đếm DM
      SELECT count(*)::integer 
      FROM public.messages 
      WHERE receiver_id = auth.uid() AND is_read = false
    ) 
    + 
    (
      -- Đếm Group
      SELECT count(*)::integer 
      FROM public.messages m
      JOIN public.group_members gm ON m.group_id = gm.group_id
      WHERE gm.user_id = auth.uid()
      AND m.created_at > gm.last_read_at
    );
$$;

-- 6. Hàm lấy chi tiết số tin nhắn chưa đọc của từng DM
CREATE OR REPLACE FUNCTION public.get_dm_unread_counts()
RETURNS TABLE (sender_id uuid, count bigint)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT sender_id, count(*) as count
  FROM public.messages
  WHERE receiver_id = auth.uid() 
  AND is_read = false
  GROUP BY sender_id;
$$;

-- 7. Hàm lấy chi tiết số tin nhắn chưa đọc của từng Group
CREATE OR REPLACE FUNCTION public.get_group_unread_counts()
RETURNS TABLE (group_id uuid, count bigint)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT m.group_id, count(*) as count
  FROM public.messages m
  JOIN public.group_members gm ON m.group_id = gm.group_id
  WHERE gm.user_id = auth.uid()
  AND m.created_at > gm.last_read_at
  GROUP BY m.group_id;
$$;

-- 8. Cấp quyền thực thi
GRANT EXECUTE ON FUNCTION public.mark_group_read(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_dm_read(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_total_unread_count() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_dm_unread_counts() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_group_unread_counts() TO authenticated;
