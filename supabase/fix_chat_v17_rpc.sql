-- FIX CHAT V17: OPTIMIZE UNREAD COUNTS (RPC)
-- Script này tối ưu hóa việc đếm tin nhắn chưa đọc, chuyển logic từ Frontend (chậm, nhiều request) sang Backend (nhanh, 1 request).

-- 1. Thêm cột last_read_at vào bảng group_members (nếu chưa có)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'group_members' AND column_name = 'last_read_at') THEN
        ALTER TABLE public.group_members ADD COLUMN last_read_at TIMESTAMPTZ DEFAULT now();
    END IF;
END $$;

-- 2. Hàm đánh dấu đã đọc tin nhắn nhóm
CREATE OR REPLACE FUNCTION public.mark_group_read(_group_id UUID)
RETURNS VOID
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

-- 3. Hàm lấy tổng số tin nhắn chưa đọc (DM + Group)
CREATE OR REPLACE FUNCTION public.get_total_unread_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    dm_count INTEGER;
    group_count INTEGER;
BEGIN
    -- Đếm tin nhắn cá nhân chưa đọc
    SELECT COUNT(*) INTO dm_count
    FROM public.messages
    WHERE receiver_id = auth.uid()
    AND is_read = false;

    -- Đếm tin nhắn nhóm chưa đọc (dựa trên last_read_at)
    SELECT COALESCE(SUM(cnt), 0) INTO group_count
    FROM (
        SELECT COUNT(m.id) as cnt
        FROM public.group_members gm
        JOIN public.messages m ON m.group_id = gm.group_id
        WHERE gm.user_id = auth.uid()
        AND m.created_at > COALESCE(gm.last_read_at, gm.joined_at, '2000-01-01'::timestamp)
        AND m.sender_id != auth.uid()
        GROUP BY gm.group_id
    ) sub;

    RETURN COALESCE(dm_count, 0) + COALESCE(group_count, 0);
END;
$$;

-- 4. Hàm lấy số tin nhắn chưa đọc cho từng nhóm (cho Contact List)
CREATE OR REPLACE FUNCTION public.get_group_unread_counts()
RETURNS TABLE (group_id UUID, count BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
    RETURN QUERY
    SELECT gm.group_id, COUNT(m.id)
    FROM public.group_members gm
    JOIN public.messages m ON m.group_id = gm.group_id
    WHERE gm.user_id = auth.uid()
    AND m.created_at > COALESCE(gm.last_read_at, gm.joined_at, '2000-01-01'::timestamp)
    AND m.sender_id != auth.uid()
    GROUP BY gm.group_id;
END;
$$;

-- 4.5 Hàm lấy số tin nhắn chưa đọc từ người gửi (DM)
CREATE OR REPLACE FUNCTION public.get_dm_unread_counts()
RETURNS TABLE (sender_id UUID, count BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
    RETURN QUERY
    SELECT m.sender_id, COUNT(*)
    FROM public.messages m
    WHERE m.receiver_id = auth.uid()
    AND m.is_read = false
    GROUP BY m.sender_id;
END;
$$;

-- 5. Cấp quyền cho authenticated users
GRANT EXECUTE ON FUNCTION public.mark_group_read(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_total_unread_count() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_group_unread_counts() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_dm_unread_counts() TO authenticated;

-- 6. Force reload schema
NOTIFY pgrst, 'reload schema';
