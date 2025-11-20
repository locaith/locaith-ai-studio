## Mục Tiêu
- Hoàn tất cấu hình Supabase, GitHub OAuth và Google TTS.
- Áp dụng các migration (bảng, RLS, Storage) và kiểm thử đăng nhập/đăng ký, lưu lịch sử, Website Builder, đồng bộ GitHub, lưu mã lên Supabase.

## Việc Bạn Cần Làm Ngay
1. Biến môi trường (`.env.local`):
   - Client: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_GITHUB_CLIENT_ID`, `GEMINI_API_KEY`.
   - Server: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY`.
   - Không commit file chứa secret.
2. Supabase Project:
   - Vào SQL Editor, chạy lần lượt các file migration:
     - `supabase/migrations/20241119_create_user_history_tables.sql`
     - `supabase/migrations/20251120_create_user_sessions.sql`
     - `supabase/migrations/20251121_enable_rls_user_sessions.sql`
     - `supabase/migrations/20251120_create_storage_buckets.sql`
   - Kiểm tra RLS đã bật cho các bảng và bucket `websites` tồn tại.
   - Auth: đảm bảo redirect URLs gồm `http://localhost:3001/auth/callback` và domain production theo `supabase/config.toml`.
3. GitHub OAuth App:
   - Tạo app trên GitHub, đặt Callback URL:
     - Dev: `http://localhost:3001/api/github/callback`
     - Prod: `https://<domain>/api/github/callback`
   - Lấy `Client ID`/`Client Secret` rồi điền vào `.env.local` (server và client như trên).
4. Google Cloud TTS:
   - Tạo service account, lấy `GOOGLE_CLIENT_EMAIL` và `GOOGLE_PRIVATE_KEY` đưa vào `.env.local`.
   - Bật Cloud Text-to-Speech API.
5. Supabase Edge Function `tts` (nếu dùng bản Edge):
   - Deploy function `tts` (theo dự án): sau khi có secret TTS, kiểm thử từ UI (Settings/Voice).

## Kiểm Thử Chức Năng
- Khởi chạy dev: `npm run dev` (đang chạy ở `http://localhost:3001/`).
- Đăng nhập:
  - Google: nút “Đăng nhập”; xác nhận thấy avatar và có bản ghi `user_sessions`.
  - Email/Password: dùng modal đăng ký/đăng nhập; xác nhận vào được.
- Lịch sử sử dụng:
  - Khi chưa đăng nhập: “Session History” hiển thị hoạt động tạm thời (mất khi đóng trình duyệt).
  - Khi đã đăng nhập: “Recent Activity” lấy dữ liệu từ Supabase.
- Website Builder:
  - Tạo website từ prompt, kiểm tra preview.
  - Bấm “Save to Supabase” để lưu `index.html` vào bucket `websites` theo đường dẫn `userId/project/index.html`.
  - Kết nối GitHub và “Sync to GitHub” để tạo repo (nếu chưa có) và đẩy `index.html`.
- Voice/TTS: chạy test voice trong Settings/Voice; nếu không có TTS, sẽ dùng fallback Web Speech.

## Triển Khai Production (Tùy Chọn)
- Vercel: deploy app, thiết lập env giống `.env.local`.
- `vercel.json` đã có rewrites cho `/api/github/*` và `/api/tts`.
- Cập nhật `supabase/config.toml` `site_url` và `additional_redirect_urls` với domain chính.

## Nâng Cấp Khuyến Nghị (Tùy Chọn)
- Ghép lịch sử guest vào tài khoản sau lần đăng nhập đầu tiên.
- Liệt kê danh sách project đã lưu trên Supabase Storage trong UI.
- Lưu cả ZIP source vào Storage (ngoài `index.html`).
- Bổ sung thông báo lỗi/tiến trình rõ ràng cho GitHub/Supabase thao tác.

Xác nhận: Nếu bạn đồng ý, tôi sẽ tiến hành kiểm tra áp dụng migration, kiểm thử lưu/rút dữ liệu và tinh chỉnh UI/luồng xác thực nếu cần.