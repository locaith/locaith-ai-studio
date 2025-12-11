-- FIX CHAT V22 (MISSING RPCS & OPTIMIZATION)
-- Mục tiêu: Tạo các hàm RPC backend để thay thế logic loop frontend gây lỗi ERR_ABORTED.
-- Chuyển logic "đã đọc" của nhóm từ LocalStorage (Client) sang Database (Server).

-- 1. Thêm cột last_read_at vào bảng group_members (nếu chưa có)
ALTER TABLE public.group_members 
ADD COLUMN IF NOT EXISTS last_read_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- 2. Hàm đánh dấu đã đọc nhóm (Cập nhật thời gian đọc mới nhất)
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

-- 3. Hàm đếm tổng tin nhắn chưa đọc (DM + Group) - Dùng cho LayoutContext
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
    -- Đếm tin nhắn riêng (DM) chưa đọc
    SELECT count(*) INTO dm_count
    FROM public.messages
    WHERE receiver_id = auth.uid() AND is_read = false;

    -- Đếm tin nhắn nhóm chưa đọc (Tin mới hơn last_read_at)
    SELECT count(*) INTO group_count
    FROM public.messages m
    JOIN public.group_members gm ON m.group_id = gm.group_id
    WHERE gm.user_id = auth.uid()
    AND m.created_at > gm.last_read_at;

    RETURN COALESCE(dm_count, 0) + COALESCE(group_count, 0); 
END;
$$;

-- 4. Hàm lấy chi tiết số tin chưa đọc từng người (cho SocialChatFeature - DM)
CREATE OR REPLACE FUNCTION public.get_dm_unread_counts()
RETURNS TABLE (sender_id UUID, count BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
    RETURN QUERY
    SELECT m.sender_id, count(*)
    FROM public.messages m
    WHERE m.receiver_id = auth.uid() AND m.is_read = false
    GROUP BY m.sender_id;
END;
$$;

-- 5. Hàm lấy chi tiết số tin chưa đọc từng nhóm (cho SocialChatFeature - Group)
CREATE OR REPLACE FUNCTION public.get_group_unread_counts()
RETURNS TABLE (group_id UUID, count BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
    RETURN QUERY
    SELECT m.group_id, count(*)
    FROM public.messages m
    JOIN public.group_members gm ON m.group_id = gm.group_id
    WHERE gm.user_id = auth.uid()
    AND m.created_at > gm.last_read_at
    GROUP BY m.group_id;
END;
$$;

-- 6. Cấp quyền thực thi
GRANT EXECUTE ON FUNCTION public.get_total_unread_count() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_dm_unread_counts() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_group_unread_counts() TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_group_read(uuid) TO authenticated;

GRANT EXECUTE ON FUNCTION public.get_total_unread_count() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_dm_unread_counts() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_group_unread_counts() TO service_role;
GRANT EXECUTE ON FUNCTION public.mark_group_read(uuid) TO service_role;
