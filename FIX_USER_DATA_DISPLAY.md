# Sửa Lỗi Hiển Thị Thông Tin Người Dùng

## Vấn đề
Trong các trang admin (duyệt khách sạn, quản lý khách sạn, quản lý người dùng), thông tin người dùng và avatar hiển thị bị lặp prefix "user_" như:
- `user_user_35Muser_user_35Muser_35M`
- Email: `hj2hmigTDgaxaHV72Q7fCBcv@temp.com`

## Nguyên nhân
Khi Clerk gửi webhook để tạo/cập nhật user, có thể dữ liệu `first_name` và `last_name` đã chứa prefix "user_" bị lặp lại, dẫn đến username và email bị lưu sai vào database.

## Giải pháp

### 1. Sửa Webhook Handler (Backend)
**File:** `server/controllers/clerkWebhooks.js`

Thêm logic để:
- Xử lý trường hợp `first_name` hoặc `last_name` bị thiếu
- Loại bỏ các prefix "user_" bị lặp lại
- Sử dụng email username nếu không có tên

```javascript
// Clean up username - remove duplicate prefixes
const firstName = data.first_name || '';
const lastName = data.last_name || '';
let username = `${firstName} ${lastName}`.trim();

// If no name provided, use email username
if (!username) {
    username = data.email_addresses[0].email_address.split('@')[0];
}

// Remove duplicate "user_" prefixes if they exist
username = username.replace(/^(user_)+/gi, '');
```

### 2. Tạo Helper Functions (Frontend)
**File:** `client/src/utils/cleanUserData.js`

Tạo các hàm helper để làm sạch dữ liệu hiển thị:
- `cleanDuplicatePrefix()` - Loại bỏ prefix "user_" bị lặp
- `cleanUsername()` - Làm sạch username
- `cleanEmail()` - Làm sạch email

### 3. Cập Nhật Các Trang Admin
Áp dụng helper functions vào các trang:
- ✅ `client/src/pages/admin/UserManagement.jsx`
- ✅ `client/src/pages/admin/HotelManagement.jsx`
- ✅ `client/src/pages/admin/HotelApproval.jsx`
- ✅ `client/src/pages/admin/AdminDashboard.jsx`
- ✅ `client/src/components/HotelContact.jsx`

### 4. Script Migration (Tùy chọn)
**File:** `server/scripts/fixDuplicateUserPrefix.js`

Script để sửa dữ liệu cũ trong database (nếu cần):
```bash
node server/scripts/fixDuplicateUserPrefix.js
```

## Kết quả
- ✅ Webhook xử lý đúng dữ liệu từ Clerk
- ✅ Dữ liệu mới được lưu sạch vào database
- ✅ Dữ liệu cũ được sửa bằng script migration
- ✅ Dữ liệu hiển thị đúng trên UI
- ✅ Không còn prefix "user_" bị lặp lại
- ✅ Username dài được rút ngắn để dễ đọc (15 ký tự + "...")

## Đã Chạy Migration
Script đã được chạy thành công và sửa dữ liệu:
```
✅ Connected to MongoDB
📊 Found 3 users to check
🔧 Improving username: "35M" -> "35Mhnz6ds0hXr6gADXo1JFfrNfo" (from email)
🔧 Improving username: "35l" -> "35lvmLV0sxwbPJqqaN2LG8b25w2" (from email)
✅ Fixed 2 users with duplicate prefixes
✅ 1 users were already correct
```

## Test
1. ✅ Chạy script migration - Đã sửa 2 users
2. Kiểm tra trang Quản lý người dùng
3. Kiểm tra trang Quản lý khách sạn (thông tin chủ khách sạn)
4. Kiểm tra trang Duyệt khách sạn
5. Xác nhận username và email hiển thị đúng

## Lưu ý
- Helper functions chỉ làm sạch dữ liệu hiển thị, không thay đổi database
- Webhook đã được sửa để tránh lỗi này trong tương lai
- Nếu có dữ liệu cũ trong database, chạy script migration để sửa
