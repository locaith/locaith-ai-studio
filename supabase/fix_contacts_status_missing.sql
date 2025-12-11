-- FIX: Add missing 'status' column to contacts table
-- This resolves the "column status of relation contacts does not exist" error.

BEGIN;

-- Add status column if it doesn't exist
ALTER TABLE public.contacts 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'accepted';

-- Add other potentially missing columns just in case
ALTER TABLE public.contacts 
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;

ALTER TABLE public.contacts 
ADD COLUMN IF NOT EXISTS muted_until BIGINT DEFAULT NULL;

COMMIT;
