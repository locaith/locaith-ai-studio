-- Add messages column to websites table to store chat history
ALTER TABLE public.websites 
ADD COLUMN IF NOT EXISTS messages JSONB DEFAULT '[]'::jsonb;

-- Add last_edited_at for sorting
ALTER TABLE public.websites 
ADD COLUMN IF NOT EXISTS last_edited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
