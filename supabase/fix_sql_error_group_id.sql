-- =====================================================
-- FIX SQL ERROR: "column group_id does not exist"
-- =====================================================

-- 1. Add missing columns to 'messages' table if they don't exist
DO $$
BEGIN
    -- Add group_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'group_id') THEN
        ALTER TABLE public.messages ADD COLUMN group_id uuid REFERENCES public.groups(id);
        RAISE NOTICE 'Added group_id column to messages table';
    END IF;

    -- Add file_url (checking just in case)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'file_url') THEN
        ALTER TABLE public.messages ADD COLUMN file_url text;
    END IF;

    -- Add priority (checking just in case)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'priority') THEN
        ALTER TABLE public.messages ADD COLUMN priority text default 'normal';
    END IF;
END;
$$;

-- 2. Re-apply the Friend Flow Functions (Safe to run again)
create or replace function public.accept_friend_request(request_id bigint)
returns void as $$
declare
  req record;
begin
  select * into req from public.friend_requests where id = request_id;
  
  if req is null then
    raise exception 'Request not found';
  end if;

  if req.receiver_id = auth.uid() and req.status = 'pending' then
    update public.friend_requests set status = 'accepted' where id = request_id;
    
    -- Insert mutual contacts
    insert into public.contacts (user_id, contact_id) values (req.sender_id, req.receiver_id) on conflict do nothing;
    insert into public.contacts (user_id, contact_id) values (req.receiver_id, req.sender_id) on conflict do nothing;
  else
    raise exception 'Invalid request or permission denied';
  end if;
end;
$$ language plpgsql security definer;

create or replace function public.unfriend_user(target_user_id uuid)
returns void as $$
begin
  -- Delete contacts (Both directions)
  delete from public.contacts 
  where (user_id = auth.uid() and contact_id = target_user_id)
     or (user_id = target_user_id and contact_id = auth.uid());

  -- Delete the friend request record
  delete from public.friend_requests
  where (sender_id = auth.uid() and receiver_id = target_user_id)
     or (sender_id = target_user_id and receiver_id = auth.uid());
end;
$$ language plpgsql security definer;

-- 3. Re-apply the Strict Chat Policy (Now that group_id definitely exists)
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
