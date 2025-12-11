-- =====================================================
-- ENABLE REALTIME FOR CONTACTS & FRIEND_REQUESTS
-- =====================================================
-- Run this SQL in Supabase SQL Editor to ensure Realtime updates work.

begin;
  -- 1. Enable Realtime for 'contacts' table (for syncing friend lists)
  do $$
  begin
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'contacts') then
      alter publication supabase_realtime add table public.contacts;
    end if;
  end;
  $$;

  -- 2. Enable Realtime for 'friend_requests' table (for syncing status)
  do $$
  begin
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'friend_requests') then
      alter publication supabase_realtime add table public.friend_requests;
    end if;
  end;
  $$;
commit;
