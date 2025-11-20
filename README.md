# Locaith Studio

Locaith Studio là nền tảng **AI Studio all-in-one** giúp bạn xây dựng website, tạo nội dung và tự động hóa chiến dịch mạng xã hội (Auto-Pilot Content) chỉ với vài cú click.

Các mô-đun chính:

- **Website Builder** – Tạo website landing/portfolio bằng AI.
- **Interior & Design** – Gợi ý bố cục, ý tưởng thiết kế.
- **Compose Word** – Viết và chỉnh sửa tài liệu bằng AI.
- **Deep Web Search** – Tìm kiếm & tổng hợp thông tin chuyên sâu.
- **Voice Chat** – Trò chuyện với AI bằng giọng nói.
- **Content & Automation** – Lên lịch, tự động sinh nội dung & đăng lên mạng xã hội.

---

## 1. Chạy local

### Prerequisites

- Node.js (khuyến nghị: ≥ 18.x)
- npm hoặc pnpm / yarn

### Bước 1 – Cài đặt dependency

```bash
npm install
# hoặc
pnpm install
# hoặc
yarn
Bước 2 – Cấu hình biến môi trường
Tạo file .env.local ở thư mục gốc project và bổ sung tối thiểu:

bash
Copy code
GEMINI_API_KEY=your_gemini_api_key_here

# (Tùy chọn) Nếu dùng Supabase cho auth + database:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
Lưu ý: không commit .env.local lên Git.

Bước 3 – Chạy dev server
bash
Copy code
npm run dev
Mặc định ứng dụng chạy tại:

http://localhost:3000

2. Build & Deploy
Build production
bash
Copy code
npm run build
npm start
Bạn có thể deploy lên bất kỳ nền tảng hỗ trợ Node.js / Next.js, ví dụ:

Vercel

Netlify

Render

VPS riêng

Chỉ cần cấu hình lại các biến môi trường giống file .env.local trên môi trường production.

3. Cấu trúc tính năng (gợi ý)
app/ – Next.js App Router (dashboard, layout Locaith Studio).

components/ – Các khối UI dùng chung (sidebar, header, card…).

lib/ai/ – Hàm gọi Gemini API (generate nội dung, gợi ý thiết kế…).

lib/supabase/ – Khởi tạo Supabase client (nếu dùng).

features/

website-builder/

compose-word/

content-automation/

...

4. Đóng góp & phát triển tiếp
Mở issue để đề xuất thêm mô-đun (ERP, chatbot, social auto-post…).

Tách từng tính năng thành module/feature độc lập để dễ scale.

Made with ❤️ by the Locaith team.

Copy code
