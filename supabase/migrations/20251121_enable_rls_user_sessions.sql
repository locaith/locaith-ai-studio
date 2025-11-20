ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_sessions_select_own ON user_sessions;
DROP POLICY IF EXISTS user_sessions_insert_own ON user_sessions;
DROP POLICY IF EXISTS user_sessions_update_own ON user_sessions;

CREATE POLICY user_sessions_select_own ON user_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY user_sessions_insert_own ON user_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_sessions_update_own ON user_sessions
  FOR UPDATE USING (auth.uid() = user_id);