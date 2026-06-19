# Bách Thiện Hiếu Vi Tiên

Next.js app dựng lại form đăng ký từ Jotform và lưu đăng ký vào Supabase. Sau khi submit thành công, hệ thống sinh mã đăng ký, lưu bản ghi vào Supabase, tạo QR từ mã đăng ký và gửi email xác nhận cho người tham gia.

## Chạy local

```bash
npm install
cp .env.example .env.local
npm run dev
```

Mở `http://localhost:3000`.

## Supabase

App lưu đăng ký vào bảng `public.registrations` trong Supabase.

Chạy SQL trong `supabase/schema.sql` bằng Supabase SQL Editor để tạo bảng và policy cho form public insert.

Điền `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` trong `.env.local`.

## Cấu hình email

Điền các biến `SMTP_*` và `MAIL_FROM` trong `.env.local`. Với Gmail, dùng App Password thay cho mật khẩu đăng nhập. Nếu chưa cấu hình SMTP, app vẫn lưu đăng ký vào Supabase nhưng sẽ bỏ qua bước gửi email xác nhận.

## Luồng submit

1. Frontend gọi `POST /api/register`.
2. API validate dữ liệu.
3. API tạo `registrationId`.
4. API lưu dữ liệu vào Supabase, gồm cả `registrationId`.
5. API tạo QR từ `PUBLIC_BASE_URL/ticket/{registrationId}` nếu có `PUBLIC_BASE_URL`, nếu không thì QR chỉ chứa mã đăng ký.
6. API gửi email xác nhận kèm QR.
