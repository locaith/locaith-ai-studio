-- Add RLS policies for user_activity table
-- This allows users to insert their own activity logs

-- Enable RLS on user_activity if not already enabled
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own activity
CREATE POLICY "Users can insert own activity"
ON user_activity
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view their own activity
CREATE POLICY "Users can view own activity"
ON user_activity
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Optional: Users can update their own activity (if needed)
CREATE POLICY "Users can update own activity"
ON user_activity
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
