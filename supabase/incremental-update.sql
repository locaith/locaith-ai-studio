-- =====================================================
-- SUPABASE INCREMENTAL UPDATE
-- Chỉ chạy phần THIẾU - KHÔNG xóa data cũ
-- =====================================================

-- 1. TẠO BẢNG PROFILES (nếu chưa có)
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

-- Drop old policies nếu có
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create new policies
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
-- 2. TRIGGER AUTO-CREATE PROFILE (CRITICAL!)
-- =====================================================

-- Xóa trigger cũ nếu có
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Tạo function mới
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert vào profiles
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Tạo trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 3. FIX RLS CHO WEBSITES (nếu bị Unauthorized)
-- =====================================================

-- Thêm missing policies nếu chưa có
DO $$
BEGIN
  -- Drop old policies
  DROP POLICY IF EXISTS "Public websites are viewable by everyone" ON public.websites;
  DROP POLICY IF EXISTS "Users can insert their own websites" ON public.websites;
  DROP POLICY IF EXISTS "Users can update their own websites" ON public.websites;
  DROP POLICY IF EXISTS "Users can delete their own websites" ON public.websites;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create new policies
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
-- 4. FIX RLS CHO DEPLOYMENTS
-- =====================================================

DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can view deployments of their websites" ON public.deployments;
  DROP POLICY IF EXISTS "Users can insert deployments for their websites" ON public.deployments;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

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
-- 5. KIỂM TRA USER_ACTIVITY vs USER_ACTIVITY_HISTORY
-- =====================================================

-- Nếu bạn muốn dùng user_activity_history thay vì user_activity,
-- thì cần update code frontend để trỏ đúng table name

-- Hoặc tạo alias/view:
CREATE OR REPLACE VIEW public.user_activity AS
SELECT * FROM public.user_activity_history;

-- Enable RLS cho user_activity_history nếu chưa có
ALTER TABLE public.user_activity_history ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can view their own activity" ON public.user_activity_history;
  DROP POLICY IF EXISTS "Users can insert their own activity" ON public.user_activity_history;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "Users can view their own activity"
  ON public.user_activity_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity"
  ON public.user_activity_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 6. VERIFY - KIỂM TRA KẾT QUẢ
-- =====================================================

-- Check profiles table
SELECT 'profiles' as table_name, COUNT(*) as count FROM public.profiles;

-- Check trigger
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND trigger_name = 'on_auth_user_created';

-- Check RLS policies
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'websites', 'deployments', 'user_activity_history')
ORDER BY tablename, policyname;

-- =====================================================
-- ✅ DONE! 
-- =====================================================
-- Sau khi chạy SQL này:
-- 1. Test Google Login → Check profiles table có auto-create không
-- 2. Test deploy website → Check websites table
-- 3. Check console logs không có lỗi "Unauthorized"
-- =====================================================
