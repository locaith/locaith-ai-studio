# 🔧 IMPLEMENTATION PLAN - BUG FIXES & FEATURES

## 📋 DANH SÁCH VẤN ĐỀ CẦN XỬ LÝ

### ❌ VẤN ĐỀ 1: Voice Chat bị LAG lần đầu
**Hiện trạng:**
- Voice Chat tự động connect khi component mount (line 189-190 VoiceChat.tsx)
- `connect()` được gọi trong `useEffect` với empty dependency `[]`
- Có thể gây racing condition hoặc audio context chưa ready

**Nguyên nhân:**
- AudioContext được tạo quá sớm (line 343-344)
- Không kiểm tra quyền microphone trước khi connect
- Không có debounce/delay để đảm bảo browser ready

**Giải pháp:**
```typescript
// VoiceChat.tsx line 180-200
useEffect(() => {
  const init = async () => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        setConnectionError("API Key Missing");
        return;
      }
      aiRef.current = new GoogleGenAI({ apiKey });
      
      // DELAY để đảm bảo browser ready
      await new Promise(r => setTimeout(r, 300));
      
      // Kiểm tra quyền mic trước
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (e) {
        setConnectionError("Microphone permission denied");
        return;
      }
      
      // Chỉ connect khi mode = 'FULL' hoặc user click
      if (mode === 'FULL' && !isConnected) {
        await connect();
      }
    } catch (e: any) {
      console.error("Init error:", e);
      setConnectionError(e.message);
    }
  };
  
  init();
  
  return () => cleanup();
}, []); // Empty deps nhưng có async init
```

---

### ❌ VẤN ĐỀ 2: Google Login không cập nhật vào website

**Cần kiểm tra:**
1. ✅ Supabase Auth configuration (Google OAuth)
2. ✅ RLS Policies cho bảng users/profiles
3. ✅ Trigger/Function để auto-create profile khi user đăng ký
4. ✅ Frontend auth flow

**File cần kiểm tra:**
- `src/hooks/useAuth.ts`
- Supabase SQL: Auth triggers
- LoginPage.tsx Google login handler

**Giải pháp dự kiến:**
- Tạo trigger `handle_new_user()` trong Supabase
- Tạo bảng `profiles` nếu chưa có
- Update RLS policies

---

### ❌ VẤN ĐỀ 3: Voice tự động chuyển Website Builder + nhập prompt

**Hiện trạng:**
- Logic đã có ở line 403-430 VoiceChat.tsx
- Tool `navigate_to_feature` gọi `onNavigate(feature)` (line 408)
- Tool `fill_prompt_and_generate` gọi `onFillAndGenerate(prompt)` (line 421)
- Nhưng có thể bị lỗi do không minimize về WIDGET

**Vấn đề:**
- Line 407: `setMode('WIDGET')` CHỈ chạy với navigate tool
- Fill prompt tool KHÔNG có minimize về widget
- Cần thêm minimize ở cả 2 tools

**Giải pháp:**
```typescript
// VoiceChat.tsx line 419-430
} else if (fc.name === 'fill_prompt_and_generate') {
  const prompt = (fc.args as any).prompt;
  
  // CRITICAL FIX: Minimize về widget trước khi fill
  setMode('WIDGET');
  
  // Delay nhỏ để UI update
  setTimeout(() => {
    onFillAndGenerate(prompt);
  }, 100);
  
  sessionPromise.then(session => {
    session.sendToolResponse({
      functionResponses: {
        id: fc.id,
        name: fc.name,
        response: { result: 'success' }
      }
    });
  });
}
```

---

### ✅ VẤN ĐỀ 4: Tối ưu Voice - chuyển backend về Edge Function

**Phân tích:**
- Hiện tại Voice Chat HOÀN TOÀN chạy client-side
- Gọi trực tiếp Gemini Live API từ browser
- Crypto API & General Knowledge đều fetch từ client

**Nên chuyển sang Edge Function?**
- ❌ KHÔNG NÊN vì:
  - Gemini Live cần WebSocket real-time
  - Edge Function khó handle streaming audio
  - Latency cao hơn (client -> edge -> gemini -> edge -> client)
  
**Tối ưu khác (Better approach):**
- ✅ Lazy load component VoiceChat khi cần
- ✅ Optimize audio buffer size
- ✅ Dùng Web Workers cho audio processing
- ✅ Cache crypto data (không cần gọi lại liên tục)

---

## 🗂️ SUPABASE DATABASE SCHEMA

### Bảng: `profiles`
```sql
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);
```

### Trigger: Auto-create profile
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Bảng: `user_activity` (Lưu lịch sử)
```sql
CREATE TABLE IF NOT EXISTS public.user_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_type TEXT NOT NULL, -- 'web-builder', 'voice', 'design', etc.
  action_type TEXT NOT NULL,  -- 'create', 'update', 'export', 'deploy'
  action_details JSONB,        -- Chi tiết action
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_user_activity_user_id ON public.user_activity(user_id);
CREATE INDEX idx_user_activity_created_at ON public.user_activity(created_at DESC);

-- RLS
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activity"
  ON public.user_activity FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity"
  ON public.user_activity FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

---

## 🚀 PLAN TRIỂN KHAI

### Phase 1: Fix Critical Bugs (1-2 giờ)
1. ✅ Fix Voice Chat lag (VoiceChat.tsx)
2. ✅ Fix auto-minimize khi fill prompt (VoiceChat.tsx)
3. ✅ Test end-to-end flow

### Phase 2: Database Setup (30 phút)
1. ✅ Chạy SQL tạo bảng `profiles`
2. ✅ Tạo trigger `handle_new_user`
3. ✅ Tạo bảng `user_activity` 
4. ✅ Setup RLS policies

### Phase 3: Google Login Fix (1 giờ)
1. ✅ Verify Supabase Auth config
2. ✅ Test Google OAuth flow
3. ✅ Kiểm tra profile auto-create

### Phase 4: Deploy Edge Functions (1-2 giờ)
1. ✅ Tạo edge function `deploy-website`
2. ✅ Update frontend `handleDeploy`
3. ✅ Test deployment flow

---

## 📝 CHECKLIST

- [ ] Fix Voice Chat initialization lag
- [ ] Fix voice auto-minimize when filling prompt
- [ ] Setup Supabase database schema
- [ ] Create auth trigger for profiles
- [ ] Test Google login flow
- [ ] Create Edge Function for deployment
- [ ] Update handleDeploy in frontend
- [ ] End-to-end testing

---

## 🔍 FILES TO MODIFY

1. `components/VoiceChat.tsx` - Fix lag & auto-minimize
2. `src/hooks/useAuth.ts` - Verify auth flow
3. `App.tsx` - handleDeploy update
4. Supabase SQL Editor - Run schema
5. `supabase/functions/deploy-website/index.ts` - NEW file

