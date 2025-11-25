# Hướng dẫn cấu hình Stripe Webhook

## Vấn đề hiện tại
Sau khi thanh toán thành công trên Stripe, trạng thái booking không được cập nhật từ "pending" sang "confirmed" và isPaid vẫn là false.

## Nguyên nhân
Stripe webhook không được cấu hình đúng trên môi trường production/deploy.

## Các bước khắc phục

### 1. Lấy Webhook Endpoint URL
Webhook endpoint của bạn là:
```
https://YOUR_DOMAIN/api/stripe
```
Ví dụ: `https://your-app.vercel.app/api/stripe`

### 2. Cấu hình Webhook trên Stripe Dashboard

1. Đăng nhập vào [Stripe Dashboard](https://dashboard.stripe.com/)
2. Chuyển sang **Test mode** (nếu đang test) hoặc **Live mode** (nếu production)
3. Vào **Developers** → **Webhooks**
4. Click **Add endpoint**
5. Nhập URL: `https://YOUR_DOMAIN/api/stripe`
6. Chọn các events cần lắng nghe:
   - ✅ `checkout.session.completed` (BẮT BUỘC)
   - ✅ `payment_intent.succeeded` (Tùy chọn, để backup)
7. Click **Add endpoint**

### 3. Lấy Webhook Signing Secret

Sau khi tạo webhook endpoint:
1. Click vào endpoint vừa tạo
2. Trong phần **Signing secret**, click **Reveal**
3. Copy secret key (dạng `whsec_...`)
4. Cập nhật vào biến môi trường:
   - Local: file `.env` → `STRIPE_WEBHOOK_SECRET=whsec_...`
   - Deploy: Vercel/Railway/etc → Environment Variables

### 4. Kiểm tra logs

Sau khi cấu hình xong:
1. Thực hiện một giao dịch test
2. Vào Stripe Dashboard → Webhooks → Click vào endpoint
3. Xem tab **Events** để kiểm tra:
   - ✅ Status 200: Webhook hoạt động tốt
   - ❌ Status 400/500: Có lỗi, xem logs để debug

### 5. Test Webhook locally (Tùy chọn)

Nếu muốn test webhook trên localhost:

```bash
# Cài đặt Stripe CLI
# Windows: scoop install stripe
# Mac: brew install stripe/stripe-cli/stripe
# Linux: https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhook events đến localhost
stripe listen --forward-to localhost:3000/api/stripe

# Copy webhook secret từ terminal và cập nhật vào .env
# STRIPE_WEBHOOK_SECRET=whsec_...

# Test webhook
stripe trigger checkout.session.completed
```

## Kiểm tra webhook đang hoạt động

Xem logs trong console khi thanh toán:
- ✅ `🔔 Stripe webhook received`
- ✅ `✅ Webhook signature verified, event type: checkout.session.completed`
- ✅ `✅ Payment confirmed for booking {bookingId}`

Nếu thấy lỗi:
- ❌ `❌ Webhook signature verification failed` → Sai STRIPE_WEBHOOK_SECRET
- ❌ `❌ No bookingId found in session metadata` → Lỗi khi tạo checkout session

## Lưu ý quan trọng

1. **Webhook Secret khác nhau giữa Test mode và Live mode**
2. **Phải cấu hình webhook trên môi trường deploy**, không thể dùng localhost
3. **Endpoint phải là POST và nhận raw body** (đã được cấu hình đúng trong server.js)
4. Sau khi cập nhật Environment Variables trên Vercel/Railway, phải **redeploy** app

## Troubleshooting

### Vấn đề: Webhook không được gọi
- Kiểm tra URL endpoint có đúng không
- Kiểm tra firewall/CORS settings
- Xem logs trên Stripe Dashboard

### Vấn đề: Signature verification failed
- Kiểm tra STRIPE_WEBHOOK_SECRET có đúng không
- Đảm bảo đang dùng secret của đúng mode (test/live)
- Kiểm tra endpoint nhận raw body (không parse JSON trước)

### Vấn đề: Booking không được cập nhật
- Kiểm tra bookingId có được truyền vào metadata không
- Xem logs server để biết lỗi cụ thể
- Kiểm tra database connection
