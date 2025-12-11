-- FIX CHAT V21 (ADD MISSING COLUMNS)
-- Mục tiêu: Thêm các cột còn thiếu (priority, type) vào bảng messages để khớp với Frontend
-- Sửa lỗi: "Could not find the 'priority' column of 'messages'" (PGRST204)

-- 1. Thêm cột priority (cho tính năng tin nhắn quan trọng/khẩn cấp)
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal';

-- 2. Thêm cột type (cho loại tin nhắn: text, image, file, sticker...)
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'text';

-- 3. Làm mới Schema Cache của Supabase (Bắt buộc để API nhận diện cột mới)
NOTIFY pgrst, 'reload schema';

-- 4. Kiểm tra lại các cột đã tạo
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'messages';
