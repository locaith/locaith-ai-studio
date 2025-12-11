-- Function to handle mutual friendship (Bidirectional)
-- This ensures that when User A adds User B, User B is also added to User A's contacts.
create or replace function public.add_mutual_friend(friend_id uuid)
returns void as $$
begin
  -- Insert A -> B (Current User -> Friend)
  insert into public.contacts (user_id, contact_id)
  values (auth.uid(), friend_id)
  on conflict (user_id, contact_id) do nothing;

  -- Insert B -> A (Friend -> Current User)
  insert into public.contacts (user_id, contact_id)
  values (friend_id, auth.uid())
  on conflict (user_id, contact_id) do nothing;
end;
$$ language plpgsql security definer;

-- Migration to make ALL existing contacts mutual
-- This fixes the issue for users who already added friends but don't see them back
insert into public.contacts (user_id, contact_id)
select contact_id, user_id
from public.contacts
on conflict (user_id, contact_id) do nothing;
