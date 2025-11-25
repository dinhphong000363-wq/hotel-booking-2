# Hướng dẫn sửa lỗi "User not found in database"

## Vấn đề
Khi đăng nhập, user không được tạo trong database, gây ra lỗi "User not found" khi request.

## Nguyên nhân
1. Clerk webhook có thể bị delay, fail, hoặc không được cấu hình đúng
2. User chưa được sync từ Clerk sang MongoDB
3. Webhook chỉ hoạt động với public URL (không hoạt động với localhost)

## Giải pháp đã áp dụng ✅

### 1. Auto-sync user khi đăng nhập (Frontend)
- **File**: `client/src/conext/AppContext.jsx`
- Khi user đăng nhập, frontend tự động gọi API `/api/user/sync` để tạo/cập nhật user trong database
- Nếu fetch user fail, sẽ tự động retry sau khi sync

### 2. Endpoint sync user (Backend)
- **File**: `server/controllers/syncUserController.js`
- **Endpoint**: `POST /api/user/sync`
- Nhận thông tin user từ frontend (email, username, image)
- Tạo mới hoặc cập nhật user trong database

### 3. Fallback trong middleware (Backend)
- **File**: `server/middleware/authMiddleware.js`
- Nếu user không tồn tại, tạo placeholder user để tránh crash
- User sẽ được cập nhật đầy đủ thông tin qua sync endpoint

### 4. Webhook handler (Backend)
- **File**: `server/controllers/clerkWebhooks.js`
- Xử lý events: `user.created`, `user.updated`, `user.deleted`
- Chỉ hoạt động khi có public URL (production hoặc ngrok)

## Cách hoạt động

1. User đăng nhập qua Clerk
2. Frontend tự động gọi `/api/user/sync` với thông tin user
3. Backend tạo/cập nhật user trong MongoDB
4. Frontend fetch thông tin user và hiển thị

## Test

### Bước 1: Xóa user cũ (nếu có)
```bash
# Vào MongoDB và xóa user test
```

### Bước 2: Đăng nhập lại
- Đăng xuất và đăng nhập lại
- User sẽ tự động được tạo trong database

### Bước 3: Kiểm tra console
- Mở DevTools → Console
- Xem log "User synced" hoặc "User updated"

## Troubleshooting

### Vẫn bị lỗi "User not found"?
1. Kiểm tra console log trong browser
2. Kiểm tra server log
3. Đảm bảo `VITE_BACKEND_URL` đúng trong `.env` của client
4. Restart cả client và server

### Webhook không hoạt động?
- Webhook chỉ hoạt động với public URL
- Dùng ngrok cho local development:
  ```bash
  ngrok http 3000
  ```
- Cập nhật webhook URL trong Clerk Dashboard

## Lưu ý quan trọng
- ✅ Giải pháp hiện tại không phụ thuộc vào webhook
- ✅ User được sync tự động khi đăng nhập
- ✅ Hoạt động cả trên localhost và production
- ⚠️ Đảm bảo server đang chạy trước khi đăng nhập
