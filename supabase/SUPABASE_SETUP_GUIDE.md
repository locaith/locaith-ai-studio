# Supabase Setup Guide - Production Auth

This guide contains ALL steps needed to configure Supabase for production-ready Google OAuth authentication.

## Step 1: Run Database Migration

### Option A: Via Supabase Dashboard

1. Go to your Supabase project
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy entire content from `supabase/migrations/20250125_create_profiles_and_policies.sql`
5. Paste and click **Run**
6. Wait for success message

### Option B: Via Supabase CLI

```bash
supabase db push
```

---

## Step 2: Configure Google OAuth Provider

### A. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project (or create new one)
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Name: `Locaith AI Studio`

7. **Authorized redirect URIs** - Add:
   ```
   https://rhxgyhkvtyojzbrtliqn.supabase.co/auth/v1/callback
   ```

8. Click **Create**
9. Copy **Client ID** and **Client Secret**

### B. Enable Required APIs

In Google Cloud Console:
1. **APIs & Services** → **Library**
2. Search and enable:
   - Google+ API
   - Google People API

---

## Step 3: Configure Supabase Auth

### In Supabase Dashboard → Authentication → Providers

1. Click **Google**
2. Enable: ✅ **Yes**
3. Paste **Client ID** from Google Cloud Console
4. Paste **Client Secret** from Google Cloud Console
5. Authorized Client IDs: (leave empty)
6. Click **Save**

---

## Step 4: Configure URLs

### In Supabase Dashboard → Authentication → URL Configuration

**Site URL:**
```
https://www.locaith.ai
```

**Redirect URLs** - Add ALL of these (one per line):
```
https://www.locaith.ai
https://www.locaith.ai/**
https://locaith.ai
https://locaith.ai/**
http://localhost:3000
http://localhost:3000/**
```

Click **Save**.

---

## Step 5: Configure Edge Function Environment Variables

### In Supabase Dashboard → Edge Functions → Settings

Add these secrets:

```
FREESTYLE_API_KEY=your_freestyle_api_key_here
FREESTYLE_BASE_DOMAIN=apps.locaith.ai
```

Click **Save**.

---

## Step 6: Verify Configuration

### Test Database Setup

Run this query in SQL Editor:

```sql
-- Should return your profiles table structure
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'profiles';

-- Should return 3 policies
SELECT * FROM pg_policies 
WHERE tablename = 'profiles';

-- Should return the trigger
SELECT * FROM information_schema.triggers 
WHERE event_object_table = 'users'
AND trigger_name = 'on_auth_user_created';
```

### Test Google OAuth

1. Go to **Authentication** → **Providers** → **Google**
2. Should show ✅ Enabled
3. Click **Test Connection** (if available)

---

## Troubleshooting

### Issue: "redirect_uri_mismatch" error

**Solution:**
- Verify redirect URI in Google Cloud Console matches exactly:
  `https://rhxgyhkvtyojzbrtliqn.supabase.co/auth/v1/callback`

### Issue: Profile not created automatically

**Solution:**
- Check Supabase logs: **Database** → **Logs**
- Verify trigger exists: Run query from Step 6
- Manually test trigger:
  ```sql
  SELECT public.handle_new_user();
  ```

### Issue: RLS Policy errors

**Solution:**
- Disable RLS temporarily to test:
  ```sql
  ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
  ```
- Re-enable after testing:
  ```sql
  ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
  ```

---

## Configuration Checklist

- [ ] Database migration executed successfully
- [ ] Google OAuth credentials created
- [ ] Google+ API enabled
- [ ] Supabase Google provider configured
- [ ] Site URL set to www.locaith.ai
- [ ] All redirect URLs added
- [ ] Edge Function secrets added
- [ ] Database schema verified
- [ ] RLS policies verified
- [ ] Trigger verified

**Once all checkboxes are ✅, you're ready to test the auth flow!**
