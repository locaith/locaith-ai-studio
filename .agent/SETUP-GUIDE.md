# 🚀 HƯỚNG DẪN FIX GOOGLE LOGIN & DEPLOY EDGE FUNCTIONS

## BƯỚC 1: Fix Google Login Error ⚠️

### 1.1 Chạy SQL Fix trong Supabase

1. **Mở Supabase Dashboard:**
   - Vào: https://app.supabase.com
   - Chọn project của bạn

2. **Mở SQL Editor:**
   - Sidebar → **SQL Editor**
   - Click **+ New query**

3. **Copy và Run SQL:**
   - Mở file: `supabase/fix-google-login.sql`
   - Copy TOÀN BỘ nội dung
   - Paste vào SQL Editor
   - Click **Run** (hoặc Ctrl/Cmd + Enter)

4. **Verify kết quả:**
   - Cuối cùng phải thấy:
     ```
     ✅ Setup complete! Try Google login now.
     ```
   - Check output có:
     - "Profiles table: 5 columns"
     - "Trigger: 1"

### 1.2 Test Google Login

1. **Logout khỏi app** (nếu đang login)
2. **Clear browser cache:**
   - F12 → Application → Clear storage
3. **Click "Sign in with Google"**
4. **Chọn tài khoản Google**
5. **✅ Expected:** Redirect về app, đã login

**Nếu vẫn lỗi:**
- Vào Supabase Dashboard → **Database** → **Logs**
- Tìm error message
- Gửi cho tôi để debug

---

## BƯỚC 2: Deploy Edge Function 🔥

### 2.1 Cài Supabase CLI

**Mở Terminal (PowerShell) và chạy:**

```powershell
npm install -g supabase
```

Đợi cài xong → Verify:
```powershell
supabase --version
```

### 2.2 Login vào Supabase

```powershell
supabase login
```

- Browser sẽ mở
- Đăng nhập Supabase
- Authorize CLI
- Quay lại terminal thấy: "Logged in"

### 2.3 Lấy Project Reference ID

1. Vào Supabase Dashboard
2. **Settings** → **General**
3. Tìm **Reference ID**
4. Copy ID (dạng: `abcdefghijklmnop`)

### 2.4 Link Project

**Thay `YOUR_PROJECT_REF` bằng ID vừa copy:**

```powershell
cd "d:\Locaith Website\Website Locaith.ai\locaith-ai-studio"
supabase link --project-ref YOUR_PROJECT_REF
```

Expected output:
```
Linked to project: your-project-name
```

### 2.5 Deploy Edge Function

```powershell
supabase functions deploy deploy-website
```

Expected output:
```
Deploying deploy-website (project ref: ...)
...
✓ Deployed Function deploy-website
```

### 2.6 Verify trong Dashboard

1. Supabase Dashboard → **Edge Functions**
2. Phải thấy: `deploy-website` với status **Active**

---

## BƯỚC 3: Test Deployment 🧪

### 3.1 Test từ App

1. Mở app (localhost:5173)
2. Login (Google hoặc email)
3. Vào **Website Builder**
4. Tạo website bất kỳ (prompt: "Create a simple landing page")
5. Đợi code generate xong
6. Click **Publish** (góc phải)
7. **Expected:**
   - Loading ~3-5 giây
   - Modal hiện: "✅ Website deployed successfully!"
   - URL: `https://[subdomain].locaith.app`

### 3.2 Verify trong Database

1. Supabase Dashboard → **Table Editor**
2. Chọn table **`websites`**
3. Phải thấy record mới với:
   - `subdomain`: tên project
   - `html_content`: code HTML
   - `user_id`: your user ID
   - `deployed_at`: timestamp

---

## BƯỚC 4: Troubleshooting 🔧

### Lỗi: "Function not found"

**Fix:**
```powershell
supabase functions deploy deploy-website --no-verify-jwt
```

### Lỗi: "Permission denied"

**Fix:** Check RLS policies:
```sql
-- Run in SQL Editor
SELECT * FROM pg_policies WHERE tablename = 'websites';
```

### Lỗi: "Unauthorized" khi deploy

**Fix:**
1. Logout: `supabase logout`
2. Login lại: `supabase login`
3. Deploy lại

---

## CHECKLIST ✅

- [ ] Run `fix-google-login.sql` trong Supabase
- [ ] Test Google login → Thành công
- [ ] Install Supabase CLI
- [ ] Login Supabase CLI
- [ ] Link project với CLI
- [ ] Deploy `deploy-website` function
- [ ] Verify function trong Dashboard
- [ ] Test deploy website từ app
- [ ] Verify data trong `websites` table

---

## GHI CHÚ QUAN TRỌNG

1. **Backup trước khi run SQL:**
   - SQL sẽ DROP table `profiles`
   - Nếu đã có data, sẽ mất
   - Nhưng auth users vẫn giữ nguyên

2. **Edge Function URL:**
   - Sau khi deploy, function sẽ có URL:
   - `https://YOUR_PROJECT.supabase.co/functions/v1/deploy-website`
   - Frontend đã config tự động gọi đúng URL

3. **Rate Limits:**
   - Free tier: 500K function calls/month
   - Đủ cho development & testing

---

## KẾT QUẢ MONG ĐỢI

✅ Google login hoạt động bình thường
✅ Edge Function deployed và active
✅ Deploy website từ app thành công
✅ Data lưu vào Supabase database

**Thời gian ước tính:** 10-15 phút

**Nếu gặp vấn đề:** Gửi screenshot error cho tôi!
