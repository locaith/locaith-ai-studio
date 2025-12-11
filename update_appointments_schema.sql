
-- 1. Update appointments table to support groups
alter table public.appointments add column if not exists group_id uuid references public.groups(id) on delete cascade;
alter table public.appointments alter column contact_id drop not null;

-- 2. Update RLS for appointments to include groups
drop policy if exists "Users can view related appointments." on public.appointments;
create policy "Users can view related appointments." on public.appointments
  for select using (
    auth.uid() = user_id 
    or auth.uid() = contact_id
    or (
      group_id is not null and exists (
        select 1 from public.group_members
        where group_id = appointments.group_id and user_id = auth.uid()
      )
    )
  );

drop policy if exists "Users can delete related appointments." on public.appointments;
create policy "Users can delete related appointments." on public.appointments
  for delete using (
    auth.uid() = user_id 
    or auth.uid() = contact_id
    or (
      group_id is not null and exists (
        select 1 from public.group_members
        where group_id = appointments.group_id and user_id = auth.uid()
      )
    )
  );

-- 3. Ensure messages policies are correct for groups (already defined in setup, but reinforcing just in case)
-- (No changes needed if setup.sql was accurate, but let's double check handleSendMessage logic later)
