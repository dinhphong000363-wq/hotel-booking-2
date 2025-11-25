# Hướng dẫn khắc phục vấn đề thanh toán không cập nhật trạng thái

## Vấn đề
Sau khi thanh toán thành công trên Stripe, trạng thái booking vẫn là "pending" và isPaid vẫn là false.

## Nguyên nhân chính
Stripe webhook chưa được cấu hình đúng trên môi trường deploy (Vercel/Railway/etc.)

---

## ✅ CHECKLIST KHẮC PHỤC

### Bước 1: Kiểm tra webhook endpoint trên Stripe Dashboard

1. Đăng nhập [Stripe Dashboard](https://dashboard.stripe.com/)
2. Chuyển sang **Test mode** (góc trên bên phải)
3. Vào **Developers** → **Webhooks**
4. Kiểm tra xem có endpoint nào trỏ đến domain deploy của bạn chưa?
   - ✅ Có: `https://your-domain.vercel.app/api/stripe`
   - ❌ Không có: Cần tạo mới (xem Bước 2)

### Bước 2: Tạo webhook endpoint mới (nếu chưa có)

1. Click **Add endpoint**
2. Nhập URL: `https://YOUR_DOMAIN/api/stripe`
   - Ví dụ: `https://hotel-booking-api.vercel.app/api/stripe`
3. Chọn events:
   - ✅ `checkout.session.completed` (BẮT BUỘC)
   - ✅ `payment_intent.succeeded` (Tùy chọn)
4. Click **Add endpoint**

### Bước 3: Cập nhật STRIPE_WEBHOOK_SECRET

1. Trong Stripe Dashboard, click vào endpoint vừa tạo
2. Trong phần **Signing secret**, click **Reveal**
3. Copy secret key (dạng `whsec_...`)
4. Cập nhật vào môi trường deploy:

**Nếu dùng Vercel:**
```bash
# Vào Settings → Environment Variables
# Thêm hoặc cập nhật:
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxx
```

**Nếu dùng Railway:**
```bash
# Vào Variables tab
# Thêm hoặc cập nhật:
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxx
```

5. **QUAN TRỌNG**: Sau khi cập nhật, phải **Redeploy** ứng dụng

### Bước 4: Kiểm tra logs

Sau khi redeploy, thực hiện một giao dịch test:

1. Vào trang booking và thanh toán
2. Sau khi thanh toán xong, kiểm tra logs:

**Trên Vercel:**
- Vào **Deployments** → Click vào deployment mới nhất → **Functions** → Xem logs

**Trên Railway:**
- Vào **Deployments** → Click vào deployment → **Logs**

**Logs thành công sẽ hiển thị:**
```
🔔 Stripe webhook received
✅ Webhook signature verified, event type: checkout.session.completed
📦 Session data: { bookingId: "..." }
🔄 Updating booking ...
✅ Payment confirmed for booking ...
```

**Nếu có lỗi:**
```
❌ Webhook signature verification failed
→ Sai STRIPE_WEBHOOK_SECRET hoặc chưa redeploy

❌ No bookingId found in session metadata
→ Lỗi khi tạo checkout session

❌ Booking ... not found in database
→ BookingId không tồn tại trong database
```

### Bước 5: Test lại

1. Tạo một booking mới
2. Click "Thanh toán ngay"
3. Hoàn tất thanh toán trên Stripe (dùng card test: `4242 4242 4242 4242`)
4. Đợi 4 giây (trang loader)
5. Kiểm tra trang My Bookings:
   - ✅ Trạng thái: "Đã xác nhận"
   - ✅ Thanh toán: "Đã thanh toán" (màu xanh)
   - ✅ Phương thức: "Stripe"

---

## 🔍 TROUBLESHOOTING

### Vấn đề 1: Webhook không được gọi

**Triệu chứng:** Không thấy logs webhook trong server

**Giải pháp:**
1. Kiểm tra URL endpoint có đúng không
2. Kiểm tra endpoint có public access không (không bị firewall chặn)
3. Xem logs trên Stripe Dashboard → Webhooks → Click endpoint → Tab "Events"
   - Nếu thấy status 400/500: Có lỗi
   - Nếu không thấy event nào: Webhook chưa được trigger

### Vấn đề 2: Signature verification failed

**Triệu chứng:** Logs hiển thị `❌ Webhook signature verification failed`

**Giải pháp:**
1. Kiểm tra STRIPE_WEBHOOK_SECRET có đúng không
2. Đảm bảo đang dùng secret của đúng mode (test/live)
3. Kiểm tra đã redeploy sau khi cập nhật environment variable chưa
4. Thử xóa và tạo lại webhook endpoint trên Stripe

### Vấn đề 3: Booking không được cập nhật

**Triệu chứng:** Webhook được gọi nhưng booking vẫn pending

**Giải pháp:**
1. Kiểm tra logs xem có lỗi gì không
2. Kiểm tra database connection
3. Kiểm tra bookingId có đúng không
4. Thử query trực tiếp trong database xem booking có tồn tại không

### Vấn đề 4: Trạng thái không cập nhật ngay lập tức

**Triệu chứng:** Phải refresh trang nhiều lần mới thấy trạng thái mới

**Giải pháp:**
- Đã fix: Tăng thời gian chờ trong Loader từ 2s lên 4s
- Webhook Stripe thường mất 2-3 giây để xử lý
- Nếu vẫn chậm, có thể tăng lên 5-6 giây

---

## 📝 LƯU Ý QUAN TRỌNG

1. **Webhook Secret khác nhau giữa Test mode và Live mode**
   - Test mode: `whsec_test_...`
   - Live mode: `whsec_...`

2. **Phải Redeploy sau khi cập nhật Environment Variables**
   - Vercel: Tự động redeploy
   - Railway: Tự động redeploy
   - Nếu không tự động, trigger manual deploy

3. **Không thể test webhook trên localhost**
   - Stripe không thể gọi đến localhost
   - Phải deploy lên server public
   - Hoặc dùng Stripe CLI để forward webhook (xem STRIPE_WEBHOOK_SETUP.md)

4. **Card test của Stripe:**
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - Require authentication: `4000 0025 0000 3155`
   - Expiry: Bất kỳ ngày trong tương lai
   - CVC: Bất kỳ 3 số

---

## 🎯 KIỂM TRA NHANH

Chạy các lệnh sau để kiểm tra cấu hình:

```bash
# 1. Kiểm tra health endpoint
curl https://YOUR_DOMAIN/api/stripe/health

# Kết quả mong đợi:
{
  "status": "ok",
  "webhookConfigured": true,
  "stripeKeyConfigured": true,
  "endpoint": "/api/stripe"
}

# 2. Kiểm tra webhook trên Stripe Dashboard
# Vào Developers → Webhooks → Click endpoint → Send test webhook
# Chọn event: checkout.session.completed
```

---

## 📞 HỖ TRỢ

Nếu vẫn gặp vấn đề sau khi làm theo hướng dẫn:

1. Kiểm tra logs chi tiết trên server
2. Xem logs trên Stripe Dashboard
3. Kiểm tra database xem booking có được tạo không
4. Gửi logs để được hỗ trợ thêm

---

## ✨ CẢI TIẾN ĐÃ THỰC HIỆN

1. ✅ Thêm logging chi tiết trong webhook handler
2. ✅ Tăng thời gian chờ trong Loader từ 2s → 4s
3. ✅ Thêm health check endpoint `/api/stripe/health`
4. ✅ Cải thiện error handling trong webhook
5. ✅ Thêm hướng dẫn chi tiết trong STRIPE_WEBHOOK_SETUP.md
