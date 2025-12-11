-- Script to FIX Missing Profiles (Black Screen Issue)
-- Run this in Supabase SQL Editor

-- 1. Ensure Profiles are viewable by everyone (or at least authenticated users)
-- This is necessary for Friend Search and Contact List to work.

DO $$
BEGIN
    -- Enable RLS on profiles if not already enabled
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

    -- Drop existing restrictive policies if any (optional, but safer to ensure our new policy works)
    -- We'll try to create a broad "view" policy.
    
    -- Check if a "Public profiles" policy exists, if not create it
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Public profiles are viewable by everyone'
    ) THEN
        CREATE POLICY "Public profiles are viewable by everyone" 
        ON public.profiles FOR SELECT 
        USING ( true ); -- Allow everyone (or just authenticated?)
        
        -- Alternative: If you want only logged-in users:
        -- USING ( auth.role() = 'authenticated' );
        
        RAISE NOTICE 'Created policy: Public profiles are viewable by everyone';
    ELSE
        RAISE NOTICE 'Policy already exists: Public profiles are viewable by everyone';
    END IF;

    -- 2. Ensure Messages are viewable by sender/receiver
    -- This prevents crash when fetching messages
    
    ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'messages' 
        AND policyname = 'Users can view their own messages'
    ) THEN
        CREATE POLICY "Users can view their own messages" 
        ON public.messages FOR SELECT 
        USING ( auth.uid() = sender_id OR auth.uid() = receiver_id );
        RAISE NOTICE 'Created policy: Users can view their own messages';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'messages' 
        AND policyname = 'Users can insert their own messages'
    ) THEN
        CREATE POLICY "Users can insert their own messages" 
        ON public.messages FOR INSERT 
        WITH CHECK ( auth.uid() = sender_id );
        RAISE NOTICE 'Created policy: Users can insert their own messages';
    END IF;

END;
$$;
