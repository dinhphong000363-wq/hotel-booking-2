# 🔧 Debug Stripe Payment - isPaid không chuyển thành true

## 🐛 Vấn đề

Sau khi thanh toán thành công qua Stripe, `isPaid` không chuyển thành `true` và status không chuyển thành "confirmed".

## 🔍 Nguyên nhân có thể

### 1. Webhook chưa được cấu hình trong Stripe Dashboard

Stripe cần biết URL để gửi webhook events.

### 2. Webhook Secret sai

`STRIPE_WEBHOOK_SECRET` trong `.env` không khớp với Stripe.

### 3. Webhook không được gọi

Server không nhận được event từ Stripe.

### 4. Event type không đúng

Stripe gửi event khác với `checkout.session.completed`.

## ✅ Cách kiểm tra & Fix

### Bước 1: Kiểm tra Stripe Webhook trong Dashboard

1. Truy cập: https://dashboard.stripe.com/test/webhooks
2. Kiểm tra có webhook endpoint chưa?
3. URL phải là: `https://your-domain.com/api/stripe`

**Nếu chưa có, tạo mới:**
- Click "Add endpoint"
- URL: `https://your-domain.com/api/stripe`
- Events to send: Chọn `checkout.session.completed`
- Click "Add endpoint"

### Bước 2: Lấy Webhook Signing Secret

1. Trong Stripe Dashboard → Webhooks
2. Click vào webhook endpoint vừa tạo
3. Trong tab "Signing secret", click "Reveal"
4. Copy secret (dạng `whsec_...`)
5. Cập nhật vào `server/.env`:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

### Bước 3: Test với Stripe CLI (Development)

**Cài đặt Stripe CLI:**
```bash
# Windows (Scoop)
scoop install stripe

# Mac (Homebrew)
brew install stripe/stripe-cli/stripe

# Linux
# Download từ https://github.com/stripe/stripe-cli/releases
```

**Login:**
```bash
stripe login
```

**Forward webhooks đến local:**
```bash
stripe listen --forward-to localhost:3000/api/stripe
```

Lệnh này sẽ in ra webhook secret, copy và thêm vào `.env`:
```
> Ready! Your webhook signing secret is whsec_xxxxx
```

**Test payment:**
```bash
stripe trigger checkout.session.completed
```

### Bước 4: Kiểm tra Server Logs

Sau khi thanh toán, xem server console:

```bash
cd server
npm start
```

**Logs mong đợi:**
```
📨 Received Stripe event: checkout.session.completed
📋 Session metadata: { bookingId: '507f1f77bcf86cd799439011' }
🆔 Booking ID: 507f1f77bcf86cd799439011
✅ Payment confirmed for booking 507f1f77bcf86cd799439011
✅ Booking updated: { isPaid: true, status: 'confirmed' }
```

**Nếu không thấy logs:**
- Webhook chưa được gọi
- Kiểm tra lại URL webhook trong Stripe Dashboard

**Nếu thấy lỗi:**
```
❌ Webhook signature verification failed
```
→ Webhook secret sai, kiểm tra lại `.env`

```
❌ No bookingId found in session metadata
```
→ Metadata không được gửi, kiểm tra booking controller

```
❌ Booking 507f... not found
```
→ BookingId không tồn tại trong database

### Bước 5: Test với Stripe Test Cards

**Test card thành công:**
```
Card number: 4242 4242 4242 4242
Expiry: 12/34
CVC: 123
ZIP: 12345
```

**Test card thất bại:**
```
Card number: 4000 0000 0000 0002
```

### Bước 6: Kiểm tra Database

Sau khi thanh toán, kiểm tra booking trong MongoDB:

```javascript
// MongoDB shell hoặc Compass
db.bookings.findOne({ _id: ObjectId("507f1f77bcf86cd799439011") })
```

**Kết quả mong đợi:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "isPaid": true,
  "paymentMethod": "Stripe",
  "status": "confirmed",
  ...
}
```

## 🔧 Code đã cập nhật

### Đã thêm logging

**File:** `server/controllers/stripeWebhook.js`

```javascript
console.log(`📨 Received Stripe event: ${event.type}`);
console.log('📋 Session metadata:', session.metadata);
console.log('🆔 Booking ID:', bookingId);
console.log(`✅ Booking updated:`, { isPaid: booking.isPaid, status: booking.status });
```

### Webhook xử lý 2 events

1. `checkout.session.completed` - Event chính
2. `payment_intent.succeeded` - Fallback

## 🚀 Production Setup

### 1. Deploy server lên production

Ví dụ: Vercel, Heroku, Railway, etc.

### 2. Cấu hình Webhook trong Stripe

**Live mode:**
1. Chuyển sang Live mode trong Stripe Dashboard
2. Webhooks → Add endpoint
3. URL: `https://your-production-domain.com/api/stripe`
4. Events: `checkout.session.completed`
5. Copy webhook secret → cập nhật production `.env`

### 3. Test với real payment

Dùng thẻ thật để test (sẽ bị charge thật).

## 📊 Monitoring

### Xem webhook logs trong Stripe

1. Stripe Dashboard → Webhooks
2. Click vào endpoint
3. Tab "Events" → xem tất cả events đã gửi
4. Click vào event để xem chi tiết request/response

**Response thành công:**
```json
{
  "received": true,
  "bookingId": "507f1f77bcf86cd799439011"
}
```

**Response lỗi:**
```json
{
  "received": true,
  "error": "Booking not found"
}
```

## 🐛 Common Issues

### Issue 1: Webhook không được gọi

**Nguyên nhân:**
- URL sai
- Server không public (localhost)
- Firewall block

**Fix:**
- Dùng Stripe CLI để forward (development)
- Deploy server lên public URL (production)
- Kiểm tra firewall settings

### Issue 2: Signature verification failed

**Nguyên nhân:**
- Webhook secret sai
- Request body bị modify

**Fix:**
```javascript
// Đảm bảo webhook route nhận raw body
app.post('/api/stripe', 
  express.raw({ type: 'application/json' }),  // ✅ Raw body
  stripeWebhooks
);
```

### Issue 3: Booking không update

**Nguyên nhân:**
- BookingId sai
- Database connection issue

**Fix:**
- Kiểm tra logs
- Verify bookingId trong metadata
- Test database connection

### Issue 4: Multiple webhooks

**Nguyên nhân:**
- Có nhiều webhook endpoints trong Stripe

**Fix:**
- Xóa các endpoints cũ
- Chỉ giữ 1 endpoint active

## 💡 Best Practices

### 1. Idempotency

Webhook có thể được gọi nhiều lần, đảm bảo idempotent:

```javascript
// Kiểm tra đã paid chưa
const booking = await Booking.findById(bookingId);
if (booking.isPaid) {
  console.log('⚠️ Booking already paid, skipping update');
  return response.json({ received: true, alreadyPaid: true });
}

// Update
await booking.updateOne({ isPaid: true, status: 'confirmed' });
```

### 2. Error handling

```javascript
try {
  await Booking.findByIdAndUpdate(...);
} catch (error) {
  console.error('❌ Database error:', error);
  // Vẫn return 200 để Stripe không retry
  return response.json({ received: true, error: error.message });
}
```

### 3. Logging

Log tất cả events để debug:

```javascript
console.log(`📨 Event: ${event.type}`);
console.log(`🆔 Booking: ${bookingId}`);
console.log(`✅ Updated: ${booking.isPaid}`);
```

## 📝 Checklist

- [ ] Webhook endpoint đã tạo trong Stripe Dashboard
- [ ] Webhook secret đã cập nhật vào `.env`
- [ ] Server đang chạy và public accessible
- [ ] Route `/api/stripe` nhận raw body
- [ ] Logs hiển thị khi webhook được gọi
- [ ] Database connection hoạt động
- [ ] Test với Stripe test card
- [ ] Verify booking.isPaid = true sau payment

---

**Nếu vẫn không hoạt động, check server logs và Stripe webhook logs để debug! 🔍**
