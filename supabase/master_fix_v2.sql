-- ==============================================================================
-- MASTER FIX V2: COMPLETE FRIEND & CHAT SYSTEM
-- ==============================================================================
-- This script fixes ALL potential issues with the Friend Flow, Realtime, and Chat.
-- It is safe to run multiple times (idempotent).

-- 1. FIX DATABASE SCHEMA (Missing Columns)
-- ------------------------------------------------------------------------------
DO $$
BEGIN
    -- Ensure messages table has group_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'group_id') THEN
        ALTER TABLE public.messages ADD COLUMN group_id uuid;
    END IF;
    
    -- Ensure messages table has priority
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'priority') THEN
        ALTER TABLE public.messages ADD COLUMN priority text default 'normal';
    END IF;
END;
$$;

-- 2. ENABLE REALTIME (Crucial for Notifications & Chat)
-- ------------------------------------------------------------------------------
-- Use DO block to check and add tables safely (avoid "already exists" errors)
DO $$
BEGIN
    -- friend_requests
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'friend_requests'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.friend_requests;
    END IF;

    -- contacts
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'contacts'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.contacts;
    END IF;

    -- messages
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
    END IF;
END;
$$;


-- 3. LOGIC: ACCEPT FRIEND REQUEST (Transactional)
-- ------------------------------------------------------------------------------
create or replace function public.accept_friend_request(request_id bigint)
returns void as $$
declare
  req record;
begin
  -- Get request info
  select * into req from public.friend_requests where id = request_id;
  
  if req is null then
    raise exception 'Request not found';
  end if;

  -- Verify receiver is current user and status is pending
  if req.receiver_id = auth.uid() and req.status = 'pending' then
    -- A. Update request status
    update public.friend_requests set status = 'accepted' where id = request_id;
    
    -- B. Add mutual friends (A->B and B->A)
    insert into public.contacts (user_id, contact_id) values (req.sender_id, req.receiver_id) on conflict do nothing;
    insert into public.contacts (user_id, contact_id) values (req.receiver_id, req.sender_id) on conflict do nothing;
  else
    raise exception 'Permission denied or request already handled';
  end if;
end;
$$ language plpgsql security definer;


-- 4. LOGIC: UNFRIEND (Clean Removal)
-- ------------------------------------------------------------------------------
create or replace function public.unfriend_user(target_user_id uuid)
returns void as $$
begin
  -- A. Delete contacts (Both directions)
  delete from public.contacts 
  where (user_id = auth.uid() and contact_id = target_user_id)
     or (user_id = target_user_id and contact_id = auth.uid());

  -- B. Delete the friend request (so they can add again)
  delete from public.friend_requests
  where (sender_id = auth.uid() and receiver_id = target_user_id)
     or (sender_id = target_user_id and receiver_id = auth.uid());
end;
$$ language plpgsql security definer;


-- 5. SECURITY POLICIES (RLS)
-- ------------------------------------------------------------------------------

-- A. FRIEND REQUESTS
alter table public.friend_requests enable row level security;

drop policy if exists "View requests" on public.friend_requests;
create policy "View requests" on public.friend_requests
  for select using (auth.uid() = sender_id or auth.uid() = receiver_id);

drop policy if exists "Create requests" on public.friend_requests;
create policy "Create requests" on public.friend_requests
  for insert with check (auth.uid() = sender_id);

drop policy if exists "Update requests" on public.friend_requests;
create policy "Update requests" on public.friend_requests
  for update using (auth.uid() = receiver_id); -- Only receiver can accept/reject

drop policy if exists "Delete requests" on public.friend_requests;
create policy "Delete requests" on public.friend_requests
  for delete using (auth.uid() = sender_id); -- Sender can cancel

-- B. CONTACTS
alter table public.contacts enable row level security;

drop policy if exists "View contacts" on public.contacts;
create policy "View contacts" on public.contacts
  for select using (auth.uid() = user_id);

-- C. MESSAGES (Strict Chat Security)
alter table public.messages enable row level security;

drop policy if exists "View messages" on public.messages;
create policy "View messages" on public.messages
  for select using (auth.uid() = sender_id or auth.uid() = receiver_id);

drop policy if exists "Send messages" on public.messages;
drop policy if exists "Users can insert their own messages" on public.messages;

create policy "Send messages" on public.messages for insert 
with check (
  auth.uid() = sender_id 
  and (
     -- Allow if it's a group message
     group_id is not null
     or 
     -- OR if the receiver is in your contacts list (Must be friends to chat)
     exists (
       select 1 from public.contacts 
       where user_id = auth.uid() 
       and contact_id = receiver_id
     )
  )
);
