-- FIX CHAT V19 (RECREATE TABLES - NUCLEAR FIX)
-- MỤC TIÊU: Xóa bỏ hoàn toàn các bảng bị sai kiểu dữ liệu (BigInt) và tạo lại chuẩn UUID
-- CẢNH BÁO: Script này sẽ XÓA TOÀN BỘ dữ liệu tin nhắn, nhóm, và lịch hẹn hiện tại để sửa lỗi triệt để.

-- 1. Xóa bảng cũ (CASCADE sẽ xóa luôn policies, triggers, fk liên quan)
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.group_members CASCADE;
DROP TABLE IF EXISTS public.groups CASCADE;
DROP TABLE IF EXISTS public.appointments CASCADE;

-- 2. Tạo bảng GROUPS (Chuẩn UUID)
CREATE TABLE public.groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    avatar_url TEXT,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tạo bảng GROUP_MEMBERS (Chuẩn UUID)
CREATE TABLE public.group_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(group_id, user_id)
);

-- 4. Tạo bảng MESSAGES (Chuẩn UUID)
CREATE TABLE public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT,
    image_url TEXT,
    file_url TEXT,
    video_url TEXT,
    sender_id UUID REFERENCES auth.users(id) NOT NULL,
    receiver_id UUID REFERENCES auth.users(id), -- Nullable (cho group chat)
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE, -- Nullable (cho direct chat)
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT check_receiver_or_group CHECK (
        (receiver_id IS NOT NULL AND group_id IS NULL) OR 
        (receiver_id IS NULL AND group_id IS NOT NULL)
    )
);

-- 5. Tạo bảng APPOINTMENTS (Chuẩn UUID)
CREATE TABLE public.appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    time TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    contact_id UUID REFERENCES auth.users(id),
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT check_contact_or_group_appt CHECK (
        (contact_id IS NOT NULL AND group_id IS NULL) OR 
        (contact_id IS NULL AND group_id IS NOT NULL)
    )
);

-- 6. Bật RLS
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- 7. Tạo Helper Function
CREATE OR REPLACE FUNCTION public.is_member_of_group(_group_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.group_members 
    WHERE group_id = _group_id 
    AND user_id = auth.uid()
  );
END;
$$;

-- 8. Thiết lập Policies (Đơn giản & Chuẩn)

-- GROUPS
CREATE POLICY "Groups Select" ON public.groups FOR SELECT
USING (
    created_by = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.group_members WHERE group_id = id AND user_id = auth.uid())
);

CREATE POLICY "Groups Insert" ON public.groups FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Groups Update" ON public.groups FOR UPDATE
USING (created_by = auth.uid()); -- Chỉ creator mới được sửa info nhóm

CREATE POLICY "Groups Delete" ON public.groups FOR DELETE
USING (created_by = auth.uid());

-- GROUP MEMBERS
CREATE POLICY "Members Select" ON public.group_members FOR SELECT
USING (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.group_members gm WHERE gm.group_id = group_members.group_id AND gm.user_id = auth.uid())
);

CREATE POLICY "Members Insert" ON public.group_members FOR INSERT
WITH CHECK (
    -- Creator tự thêm mình hoặc thêm người khác
    EXISTS (SELECT 1 FROM public.groups g WHERE g.id = group_id AND g.created_by = auth.uid())
    OR
    -- Admin thêm người khác
    EXISTS (SELECT 1 FROM public.group_members gm WHERE gm.group_id = group_id AND gm.user_id = auth.uid() AND gm.role = 'admin')
); 

CREATE POLICY "Members Delete" ON public.group_members FOR DELETE
USING (
    user_id = auth.uid() -- Tự rời
    OR
    EXISTS (SELECT 1 FROM public.groups g WHERE g.id = group_id AND g.created_by = auth.uid()) -- Creator kick
);

-- MESSAGES
CREATE POLICY "Messages Select" ON public.messages FOR SELECT
USING (
    sender_id = auth.uid() 
    OR receiver_id = auth.uid() 
    OR (group_id IS NOT NULL AND public.is_member_of_group(group_id))
);

CREATE POLICY "Messages Insert" ON public.messages FOR INSERT
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Messages Update" ON public.messages FOR UPDATE
USING (auth.uid() = sender_id); -- Cho phép sửa tin nhắn chính mình (mark read logic xử lý riêng hoặc qua RPC)

CREATE POLICY "Messages Delete" ON public.messages FOR DELETE
USING (auth.uid() = sender_id);

-- APPOINTMENTS
CREATE POLICY "Appt Select" ON public.appointments FOR SELECT
USING (created_by = auth.uid() OR contact_id = auth.uid() OR (group_id IS NOT NULL AND public.is_member_of_group(group_id)));

CREATE POLICY "Appt Insert" ON public.appointments FOR INSERT
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Appt Delete" ON public.appointments FOR DELETE
USING (created_by = auth.uid());

-- 9. Cấp quyền
GRANT ALL ON public.groups TO authenticated;
GRANT ALL ON public.groups TO service_role;
GRANT ALL ON public.group_members TO authenticated;
GRANT ALL ON public.group_members TO service_role;
GRANT ALL ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
GRANT ALL ON public.appointments TO authenticated;
GRANT ALL ON public.appointments TO service_role;

-- 10. Indexes (Tối ưu hiệu năng)
CREATE INDEX IF NOT EXISTS idx_messages_group_id ON public.messages(group_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON public.group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON public.group_members(user_id);
