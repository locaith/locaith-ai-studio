-- =====================================================
-- COMPLETE FRIEND FLOW FIX (Strict Logic)
-- =====================================================

-- 1. Function: Accept Friend Request
-- Logic: Updates request status -> Adds MUTUAL contacts (A->B and B->A)
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
    -- A. Update request status to 'accepted'
    update public.friend_requests set status = 'accepted' where id = request_id;
    
    -- B. Add mutual friends to contacts table (Bi-directional)
    insert into public.contacts (user_id, contact_id) values (req.sender_id, req.receiver_id) on conflict do nothing;
    insert into public.contacts (user_id, contact_id) values (req.receiver_id, req.sender_id) on conflict do nothing;
  else
    raise exception 'Invalid request or permission denied';
  end if;
end;
$$ language plpgsql security definer;


-- 2. Function: Unfriend User
-- Logic: Deletes MUTUAL contacts -> Deletes/Resets friend request -> Blocks Chat (via RLS)
create or replace function public.unfriend_user(target_user_id uuid)
returns void as $$
begin
  -- A. Delete contacts (Both directions: Me->Them and Them->Me)
  delete from public.contacts 
  where (user_id = auth.uid() and contact_id = target_user_id)
     or (user_id = target_user_id and contact_id = auth.uid());

  -- B. Delete the friend request record (so they can add each other again cleanly)
  delete from public.friend_requests
  where (sender_id = auth.uid() and receiver_id = target_user_id)
     or (sender_id = target_user_id and receiver_id = auth.uid());
     
end;
$$ language plpgsql security definer;


-- 3. Strict Chat Security (RLS)
-- Logic: You can only send messages to people in your 'contacts' list.
-- This ensures that once unfriended, they cannot chat.

-- Update Messages Insert Policy
drop policy if exists "Users can insert their own messages" on public.messages;
create policy "Users can insert their own messages" 
on public.messages for insert 
with check (
  auth.uid() = sender_id 
  and (
     -- Allow if it's a group message (group_id is not null)
     group_id is not null
     or 
     -- OR if the receiver is in your contacts list
     exists (
       select 1 from public.contacts 
       where user_id = auth.uid() 
       and contact_id = receiver_id
     )
  )
);

-- Ensure Realtime is enabled for contacts (so contact list updates instantly)
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'contacts') then
    alter publication supabase_realtime add table public.contacts;
  end if;
end;
$$;
