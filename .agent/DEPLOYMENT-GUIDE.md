# 🚀 HƯỚNG DẪN DEPLOYMENT - LOCAITH AI STUDIO

## ✅ ĐÃ HOÀN THÀNH

### 1. Fix Voice Chat Lag ✅
- **File**: `components/VoiceChat.tsx`
- **Thay đổi**: 
  - Thêm delay 300ms để browser ready
  - Kiểm tra quyền microphone trước khi connect
  - Chỉ auto-connect khi mode = 'FULL'
  
### 2. Fix Voice Auto-Minimize ✅
- **File**: `components/VoiceChat.tsx`
- **Thay đổi**:
  - Thêm `setMode('WIDGET')` khi gọi `fill_prompt_and_generate`
  - Thêm delay 150ms để UI update smooth
  - Đảm bảo voice minimize về widget trước khi chuyển sang Website Builder

### 3. Database Schema ✅
- **File**: `supabase/schema.sql`
- **Bảng đã tạo**:
  - `profiles` - Thông tin user
  - `user_activity` - Lịch sử hoạt động
  - `websites` - Website đã deploy
  - `deployments` - Lịch sử deploy
- **Triggers**: `handle_new_user()` - Auto-create profile khi đăng ký
- **RLS Policies**: Đầy đủ cho tất cả bảng

### 4. Edge Function ✅
- **File**: `supabase/functions/deploy-website/index.ts`
- **Chức năng**: Deploy website HTML lên Supabase với subdomain tự động

### 5. Frontend Integration ✅
- **File**: `App.tsx`
- **Thay đổi**: `handleDeploy` sử dụng Edge Function thật thay vì fake

---

## 📋 DEPLOYMENT STEPS

### BƯỚC 1: Setup Supabase Database

1. **Đăng nhập Supabase Dashboard**:
   ```
   https://app.supabase.com
   ```

2. **Chọn Project** (hoặc tạo mới nếu chưa có)

3. **Chạy SQL Schema**:
   - Vào **SQL Editor**
   - Copy nội dung file `supabase/schema.sql`
   - Paste vào editor và click **Run**
   - Verify: Check tab **Database** → **Tables** xem có 4 bảng:
     - `profiles`
     - `user_activity`
     - `websites`
     - `deployments`

4. **Verify Triggers**:
   - Vào **Database** → **Triggers**
   - Phải thấy: `on_auth_user_created` on `auth.users`

5. **Verify RLS Policies**:
   - Click vào từng table
   - Tab **Policies** phải có policies được enable

---

### BƯỚC 2: Deploy Edge Function

1. **Install Supabase CLI** (nếu chưa có):
   ```powershell
   npm install -g supabase
   ```

2. **Login to Supabase**:
   ```powershell
   supabase login
   ```

3. **Link Project**:
   ```powershell
   cd "d:\Locaith Website\Website Locaith.ai\locaith-ai-studio"
   supabase link --project-ref YOUR_PROJECT_REF
   ```
   
   Lấy `YOUR_PROJECT_REF` từ:
   - Supabase Dashboard → Settings → General → Reference ID

4. **Deploy Edge Function**:
   ```powershell
   supabase functions deploy deploy-website
   ```

5. **Verify Deployment**:
   - Vào Supabase Dashboard → **Edge Functions**
   - Phải thấy `deploy-website` với status **Active**

---

### BƯỚC 3: Config Environment Variables

1. **Kiểm tra file `.env` (hoặc `.env.local`)**:
   ```env
   VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
   GEMINI_API_KEY=YOUR_GEMINI_KEY
   ```

2. **Lấy Supabase Keys**:
   - Dashboard → Settings → API
   - Copy: **URL** và **anon/public** key

3. **Restart Dev Server**:
   ```powershell
   # Stop current server (Ctrl+C)
   npm run dev
   ```

---

### BƯỚC 4: Test Google OAuth (Fix Login Issue)

1. **Setup Google OAuth in Supabase**:
   - Dashboard → **Authentication** → **Providers**
   - Enable **Google**
   - Nhập:
     - Client ID
     - Client Secret
     (Lấy từ Google Cloud Console)

2. **Set Redirect URL**:
   - Google Cloud Console → OAuth 2.0
   - Authorized redirect URIs:
     ```
     https://YOUR_PROJECT.supabase.co/auth/v1/callback
     http://localhost:5173/auth/callback
     ```

3. **Test Login Flow**:
   - Logout khỏi app
   - Click "Sign in with Google"
   - Sau khi login thành công:
     - Check **Authentication** → **Users** (phải thấy user mới)
     - Check **Database** → **profiles** (phải có profile tự động tạo)

---

### BƯỚC 5: Test Website Deployment

1. **Tạo một website**:
   - Vào "Website Builder"
   - Nhập prompt: "Tạo landing page đơn giản"
   - Đợi AI generate code

2. **Click "Publish"**:
   - Nhấn nút **Publish** ở góc phải
   - Đợi ~3-5 giây
   - Xem modal success với URL

3. **Verify Database**:
   - Dashboard → **Table Editor** → `websites`
   - Phải thấy record mới với:
     - subdomain
     - html_content
     - user_id

4. **Check Activity Log**:
   - **Table Editor** → `user_activity`
   - Phải thấy entry với:
     - `feature_type`: 'web-builder'
     - `action_type`: 'deploy'

---

## 🧪 TESTING CHECKLIST

- [ ] Voice Chat không bị lag lần đầu mở
- [ ] Voice Chat auto-minimize khi nói "tạo website..."
- [ ] Google login tạo profile tự động
- [ ] Deploy website thành công (không lỗi)
- [ ] URL được generate đúng format
- [ ] Database lưu website record
- [ ] Activity log được ghi nhận
- [ ] User có thể xem lại website đã deploy

---

## 🐛 TROUBLESHOOTING

### Lỗi: "API Key Missing"
**Fix**: Check file `.env` có `GEMINI_API_KEY` chưa

### Lỗi: "Edge Function not found"
**Fix**: 
```powershell
supabase functions deploy deploy-website
```

### Lỗi: "Unauthorized" khi deploy
**Fix**: 
- Đăng nhập lại app
- Check Supabase Auth config

### Lỗi: "Permission denied" (RLS)
**Fix**:
- Check RLS policies trong Supabase
- Chạy lại `schema.sql`

### Voice Chat vẫn lag
**Fix**:
- Hard refresh browser (Ctrl + Shift + R)
- Clear cache
- Check browser mic permission

### Google login không tạo profile
**Fix**:
- Check trigger: `on_auth_user_created`
- Test bằng cách xóa user và đăng ký lại
- Check Supabase logs: Dashboard → Logs

---

## 📝 NEXT STEPS (Optional)

### 1. Setup Subdomain Routing (Để website thật chạy)

**Option A: Vercel (Recommended)**
1. Tạo repo Next.js đơn giản
2. Deploy lên Vercel
3. Add custom domain: `locaith.app`
4. Config wildcard: `*.locaith.app`
5. Trong Next.js, fetch HTML từ Supabase theo subdomain

**Option B: Cloudflare Workers**
1. Tạo Worker để route subdomain
2. Fetch HTML từ Supabase
3. Serve HTML với correct headers

### 2. Add Website Management UI

Tạo trang để user xem danh sách website đã deploy:
- List all websites
- Edit/Delete
- View analytics
- Re-deploy

### 3. Optimize Voice Chat

- Implement audio caching
- Use Web Workers for processing
- Add voice activity detection (VAD)

---

## 🎯 SUMMARY

**Đã fix:**
1. ✅ Voice Chat lag
2. ✅ Voice auto-minimize
3. ✅ Database schema + triggers
4. ✅ Edge Function deployment
5. ✅ Frontend integration

**Chưa làm (cần thêm work):**
- ⏳ Subdomain routing thật (cần Vercel/Cloudflare)
- ⏳ Website management UI
- ⏳ Voice optimization with Web Workers

**Ready to deploy:** ✅ YES
**Production ready:** ⚠️ CẦN setup subdomain routing

---

## 📞 SUPPORT

Nếu gặp lỗi, check file:
- `supabase/schema.sql` - Database setup
- `supabase/functions/deploy-website/index.ts` - Edge Function
- `.agent/implementation-plan-fixes.md` - Chi tiết kỹ thuật

Good luck! 🚀
