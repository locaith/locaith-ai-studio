-- Script to SAFELY enable Realtime for tables
-- Run this in Supabase SQL Editor

DO $$
BEGIN
    -- 1. Enable Realtime for 'contacts' table if not already enabled
    IF NOT EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
        AND tablename = 'contacts'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.contacts;
        RAISE NOTICE 'Added contacts to supabase_realtime';
    ELSE
        RAISE NOTICE 'contacts is already in supabase_realtime';
    END IF;

    -- 2. Enable Realtime for 'friend_requests' table if not already enabled
    IF NOT EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
        AND tablename = 'friend_requests'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.friend_requests;
        RAISE NOTICE 'Added friend_requests to supabase_realtime';
    ELSE
        RAISE NOTICE 'friend_requests is already in supabase_realtime';
    END IF;

    -- 3. Enable Realtime for 'messages' table if not already enabled (just in case)
    IF NOT EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
        AND tablename = 'messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
        RAISE NOTICE 'Added messages to supabase_realtime';
    ELSE
        RAISE NOTICE 'messages is already in supabase_realtime';
    END IF;

END;
$$;
