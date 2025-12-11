-- ==============================================================================
-- MASTER FIX V3: COMPLETE FRIEND SYSTEM & VISIBILITY
-- ==============================================================================
-- Script này tích hợp TOÀN BỘ sửa lỗi:
-- 1. Sửa lỗi không hiện lời mời (do thiếu liên kết FK hoặc dữ liệu rác).
-- 2. Sửa lỗi logic Kết bạn/Hủy kết bạn.
-- 3. Sửa lỗi Chat & Realtime.
-- 4. An toàn để chạy nhiều lần.

-- 1. SỬA CẤU TRÚC BẢNG & KHÓA NGOẠI (QUAN TRỌNG)
-- ------------------------------------------------------------------------------
DO $$
BEGIN
    -- Thêm cột group_id cho messages nếu thiếu
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'group_id') THEN
        ALTER TABLE public.messages ADD COLUMN group_id uuid;
    END IF;
    
    -- Thêm cột priority cho messages nếu thiếu
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'priority') THEN
        ALTER TABLE public.messages ADD COLUMN priority text default 'normal';
    END IF;

    -- DỌN DẸP DỮ LIỆU RÁC (Quan trọng: Xóa các lời mời từ user không tồn tại để tránh lỗi tạo FK)
    DELETE FROM public.friend_requests 
    WHERE sender_id NOT IN (SELECT id FROM public.profiles)
       OR receiver_id NOT IN (SELECT id FROM public.profiles);

    -- TẠO KHÓA NGOẠI (FK) CHO FRIEND REQUESTS -> PROFILES
    -- Điều này giúp query lấy thông tin người gửi (avatar, tên) hoạt động đúng
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'friend_requests_sender_id_fkey') THEN
        ALTER TABLE public.friend_requests 
        ADD CONSTRAINT friend_requests_sender_id_fkey 
        FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'friend_requests_receiver_id_fkey') THEN
        ALTER TABLE public.friend_requests 
        ADD CONSTRAINT friend_requests_receiver_id_fkey 
        FOREIGN KEY (receiver_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END;
$$;

-- 2. KÍCH HOẠT REALTIME (Sửa lỗi cú pháp DROP TABLE cũ)
-- ------------------------------------------------------------------------------
DO $$
BEGIN
    -- friend_requests
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'friend_requests') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.friend_requests;
    END IF;

    -- contacts
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'contacts') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.contacts;
    END IF;

    -- messages
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'messages') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
    END IF;
END;
$$;

-- 3. LOGIC: CHẤP NHẬN KẾT BẠN (Transactional)
-- ------------------------------------------------------------------------------
create or replace function public.accept_friend_request(request_id bigint)
returns void as $$
declare
  req record;
begin
  select * into req from public.friend_requests where id = request_id;
  
  if req is null then
    raise exception 'Không tìm thấy lời mời';
  end if;

  if req.receiver_id = auth.uid() and req.status = 'pending' then
    update public.friend_requests set status = 'accepted' where id = request_id;
    
    insert into public.contacts (user_id, contact_id) values (req.sender_id, req.receiver_id) on conflict do nothing;
    insert into public.contacts (user_id, contact_id) values (req.receiver_id, req.sender_id) on conflict do nothing;
  else
    raise exception 'Không có quyền hoặc lời mời đã được xử lý';
  end if;
end;
$$ language plpgsql security definer;

-- 4. LOGIC: HỦY KẾT BẠN (Sạch sẽ 2 chiều)
-- ------------------------------------------------------------------------------
create or replace function public.unfriend_user(target_user_id uuid)
returns void as $$
begin
  delete from public.contacts 
  where (user_id = auth.uid() and contact_id = target_user_id)
     or (user_id = target_user_id and contact_id = auth.uid());

  delete from public.friend_requests
  where (sender_id = auth.uid() and receiver_id = target_user_id)
     or (sender_id = target_user_id and receiver_id = auth.uid());
end;
$$ language plpgsql security definer;

-- 5. BẢO MẬT & QUYỀN XEM (RLS) - QUAN TRỌNG
-- ------------------------------------------------------------------------------

-- A. PROFILES (Cho phép xem thông tin người khác để hiện avatar/tên)
alter table public.profiles enable row level security;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Public profiles') THEN
        CREATE POLICY "Public profiles" ON public.profiles FOR SELECT USING (true);
    END IF;
END;
$$;

-- B. FRIEND REQUESTS
alter table public.friend_requests enable row level security;
drop policy if exists "View requests" on public.friend_requests;
create policy "View requests" on public.friend_requests
  for select using (auth.uid() = sender_id or auth.uid() = receiver_id);

drop policy if exists "Create requests" on public.friend_requests;
create policy "Create requests" on public.friend_requests
  for insert with check (auth.uid() = sender_id);

drop policy if exists "Update requests" on public.friend_requests;
create policy "Update requests" on public.friend_requests
  for update using (auth.uid() = receiver_id);

drop policy if exists "Delete requests" on public.friend_requests;
create policy "Delete requests" on public.friend_requests
  for delete using (auth.uid() = sender_id);

-- C. CONTACTS
alter table public.contacts enable row level security;
drop policy if exists "View contacts" on public.contacts;
create policy "View contacts" on public.contacts
  for select using (auth.uid() = user_id);

-- D. MESSAGES
alter table public.messages enable row level security;
drop policy if exists "View messages" on public.messages;
create policy "View messages" on public.messages
  for select using (auth.uid() = sender_id or auth.uid() = receiver_id);

drop policy if exists "Send messages" on public.messages;
create policy "Send messages" on public.messages for insert 
with check (
  auth.uid() = sender_id 
  and (
     group_id is not null
     or 
     exists (
       select 1 from public.contacts 
       where user_id = auth.uid() 
       and contact_id = receiver_id
     )
  )
);
