-- =====================================================
-- SUPABASE DATABASE SCHEMA - LOCAITH AI STUDIO
-- =====================================================
-- Run this SQL in Supabase SQL Editor
-- =====================================================

-- Enable UUID extension (nếu chưa có)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. BẢNG PROFILES (Thông tin người dùng)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- =====================================================
-- 2. TRIGGER AUTO-CREATE PROFILE KHI USER ĐĂNG KÝ
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING; -- Tránh lỗi nếu đã tồn tại
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Xóa trigger cũ nếu có
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Tạo trigger mới
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 3. BẢNG USER_ACTIVITY (Lịch sử hoạt động)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_type TEXT NOT NULL, -- 'web-builder', 'voice', 'design', etc.
  action_type TEXT NOT NULL,  -- 'create', 'update', 'export', 'deploy'
  action_details JSONB,        -- Chi tiết action
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id 
  ON public.user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at 
  ON public.user_activity(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_feature_type 
  ON public.user_activity(feature_type);

-- Enable RLS
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own activity"
  ON public.user_activity FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity"
  ON public.user_activity FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 4. BẢNG WEBSITES (Lưu trữ website đã deploy)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.websites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_name TEXT NOT NULL,
  subdomain TEXT UNIQUE NOT NULL,
  html_content TEXT NOT NULL,
  storage_path TEXT, -- path trong Supabase Storage (nếu dùng)
  github_repo TEXT,  -- nếu sync với GitHub
  deployed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_public BOOLEAN DEFAULT TRUE,
  status TEXT DEFAULT 'active', -- active, paused, deleted
  metadata JSONB -- custom data (analytics, config, etc.)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_websites_subdomain 
  ON public.websites(subdomain);
CREATE INDEX IF NOT EXISTS idx_websites_user_id 
  ON public.websites(user_id);
CREATE INDEX IF NOT EXISTS idx_websites_status 
  ON public.websites(status);

-- Enable RLS
ALTER TABLE public.websites ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public websites are viewable by everyone"
  ON public.websites FOR SELECT
  USING (is_public = TRUE OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own websites"
  ON public.websites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own websites"
  ON public.websites FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own websites"
  ON public.websites FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 5. BẢNG DEPLOYMENTS (Lịch sử deploy)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.deployments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id UUID REFERENCES public.websites(id) ON DELETE CASCADE NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  deployed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  html_snapshot TEXT, -- Snapshot của HTML tại thời điểm deploy
  deployment_log JSONB, -- Log quá trình deploy
  deployed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Index
CREATE INDEX IF NOT EXISTS idx_deployments_website_id 
  ON public.deployments(website_id);
CREATE INDEX IF NOT EXISTS idx_deployments_deployed_at 
  ON public.deployments(deployed_at DESC);

-- Enable RLS
ALTER TABLE public.deployments ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Users can view deployments of their websites"
  ON public.deployments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.websites 
      WHERE websites.id = deployments.website_id 
      AND websites.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert deployments for their websites"
  ON public.deployments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.websites 
      WHERE websites.id = deployments.website_id 
      AND websites.user_id = auth.uid()
    )
  );

-- =====================================================
-- 6. FUNCTION: Get User Stats (Helper function)
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_user_stats(user_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_websites', (SELECT COUNT(*) FROM public.websites WHERE user_id = user_uuid AND status = 'active'),
    'total_deployments', (SELECT COUNT(*) FROM public.deployments d 
                           JOIN public.websites w ON d.website_id = w.id 
                           WHERE w.user_id = user_uuid),
    'total_activities', (SELECT COUNT(*) FROM public.user_activity WHERE user_id = user_uuid),
    'last_activity_at', (SELECT MAX(created_at) FROM public.user_activity WHERE user_id = user_uuid)
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. STORAGE BUCKET (Nếu muốn lưu HTML vào Storage)
-- =====================================================

-- Run this in Supabase Storage UI hoặc dùng supabase CLI
-- Tạo bucket: 'websites-html'
-- Public access: true (để có thể serve HTML)

-- SQL để tạo bucket policies (nếu dùng SQL):
/*
INSERT INTO storage.buckets (id, name, public)
VALUES ('websites-html', 'websites-html', true)
ON CONFLICT (id) DO NOTHING;
*/

-- =====================================================
-- 8. TEST QUERIES (Kiểm tra setup)
-- =====================================================

-- Check tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'user_activity', 'websites', 'deployments');

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';

-- Check triggers
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public';

-- =====================================================
-- DONE! ✅
-- =====================================================
-- Next steps:
-- 1. Verify all tables created successfully
-- 2. Test Google OAuth login flow
-- 3. Check if profile auto-creates after login
-- 4. Deploy Edge Function: deploy-website
-- =====================================================
