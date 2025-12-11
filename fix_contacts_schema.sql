-- Fix missing columns in contacts table
alter table public.contacts add column if not exists is_pinned boolean default false;
alter table public.contacts add column if not exists muted_until bigint default 0;
