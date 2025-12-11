-- =====================================================
-- SAFE ENABLE REALTIME (KHẮC PHỤC LỖI ALREADY EXISTS)
-- =====================================================
-- Chạy đoạn code này trong Supabase SQL Editor.
-- Nó sẽ kiểm tra trước khi thêm bảng, tránh lỗi "already member".

do $$
begin
  -- 1. Kiểm tra và thêm bảng contacts
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'contacts') then
    alter publication supabase_realtime add table public.contacts;
  end if;

  -- 2. Kiểm tra và thêm bảng friend_requests
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'friend_requests') then
    alter publication supabase_realtime add table public.friend_requests;
  end if;
end;
$$;
