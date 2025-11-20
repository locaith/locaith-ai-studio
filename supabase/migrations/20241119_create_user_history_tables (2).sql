-- User usage history tracking tables
-- This migration creates tables to track user activity across all features

-- User activity history table
CREATE TABLE user_activity_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_type TEXT NOT NULL, -- 'web-builder', 'design', 'text', 'search', 'voice', 'automation', 'settings'
  action_type TEXT NOT NULL, -- 'create', 'update', 'delete', 'view', 'export', 'deploy'
  action_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_id TEXT,
  metadata JSONB
);

-- Create indexes for better performance
CREATE INDEX idx_user_activity_user_id ON user_activity_history(user_id);
CREATE INDEX idx_user_activity_feature_type ON user_activity_history(feature_type);
CREATE INDEX idx_user_activity_created_at ON user_activity_history(created_at DESC);

-- Social connections table (from Facebook OAuth guide)
CREATE TABLE social_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- 'facebook', 'twitter', 'linkedin'
  account_id TEXT NOT NULL,
  account_name TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  permissions TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_social_connections_user_id ON social_connections(user_id);
CREATE INDEX idx_social_connections_provider ON social_connections(provider);

-- Scheduled posts table (from Facebook OAuth guide)
CREATE TABLE scheduled_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  account_id TEXT NOT NULL,
  content_text TEXT,
  media_url TEXT,
  scheduled_time TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending', -- 'pending', 'published', 'failed'
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_scheduled_posts_user_id ON scheduled_posts(user_id);
CREATE INDEX idx_scheduled_posts_status ON scheduled_posts(status);
CREATE INDEX idx_scheduled_posts_scheduled_time ON scheduled_posts(scheduled_time);

-- User preferences table
CREATE TABLE user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  theme_preference TEXT DEFAULT 'default',
  notifications_enabled BOOLEAN DEFAULT TRUE,
  auto_save_enabled BOOLEAN DEFAULT TRUE,
  language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE user_activity_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- User activity history: users can only see their own activity
CREATE POLICY "Users can view own activity" ON user_activity_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity" ON user_activity_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Social connections: users can only see their own connections
CREATE POLICY "Users can view own connections" ON social_connections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own connections" ON social_connections
  FOR ALL USING (auth.uid() = user_id);

-- Scheduled posts: users can only see their own posts
CREATE POLICY "Users can view own posts" ON scheduled_posts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own posts" ON scheduled_posts
  FOR ALL USING (auth.uid() = user_id);

-- User preferences: users can only see their own preferences
CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own preferences" ON user_preferences
  FOR ALL USING (auth.uid() = user_id);