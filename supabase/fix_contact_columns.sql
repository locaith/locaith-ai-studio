-- Fix: Add missing columns to contacts table required by SocialChatFeature
-- This resolves the "column contacts.is_pinned does not exist" error

BEGIN;

-- Add is_pinned column
ALTER TABLE public.contacts 
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;

-- Add muted_until column
ALTER TABLE public.contacts 
ADD COLUMN IF NOT EXISTS muted_until BIGINT DEFAULT NULL;

COMMIT;
