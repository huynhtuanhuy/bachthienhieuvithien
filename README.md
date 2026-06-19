# Bách Thiện Hiếu Vi Tiên

Next.js app dựng lại form đăng ký từ Jotform và lưu đăng ký vào Google Form. Sau khi submit thành công, hệ thống sinh mã đăng ký, gửi mã đó vào Google Form, tạo QR từ mã đăng ký và gửi email xác nhận cho người tham gia.

## Chạy local

```bash
npm install
cp .env.example .env.local
npm run dev
```

Mở `http://localhost:3000`.

## Google Form

App đang submit vào Google Form:

`https://docs.google.com/forms/d/e/1FAIpQLSe-3bRfJipoGQgTnT8-77OofVbe5gY6x3WmPUSHNY42kF9qGw/viewform`

Các `entry.xxxxx` tương ứng đã được ghi trong `.env.example` và cũng có fallback mặc định trong code. Google Form hiện có field “Mã đăng ký” và app submit UUID vào `entry.752712333`. Google Form chưa có field email, nên `GOOGLE_FORM_ENTRY_EMAIL` là optional; nếu bạn thêm field email vào Google Form, chỉ cần điền thêm entry id vào `.env.local`.

## Cấu hình email

Điền các biến `SMTP_*` và `MAIL_FROM` trong `.env.local`. Với Gmail, dùng App Password thay cho mật khẩu đăng nhập. Nếu chưa cấu hình SMTP, app vẫn lưu đăng ký vào Google Form nhưng sẽ bỏ qua bước gửi email xác nhận.

## Luồng submit

1. Frontend gọi `POST /api/register`.
2. API validate dữ liệu.
3. API tạo `registrationId`.
4. API submit dữ liệu vào Google Form, gồm cả `registrationId`.
5. API tạo QR từ `PUBLIC_BASE_URL/ticket/{registrationId}` nếu có `PUBLIC_BASE_URL`, nếu không thì QR chỉ chứa mã đăng ký.
6. API gửi email xác nhận kèm QR.
