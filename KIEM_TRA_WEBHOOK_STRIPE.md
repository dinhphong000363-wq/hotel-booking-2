# Kiểm tra và khắc phục Webhook Stripe

## Thông tin hiện tại
- Webhook URL: `https://hotel-booking-2-be.vercel.app/api/stripe`
- ✅ URL đã được cấu hình trên Stripe Dashboard

## Các bước kiểm tra ngay bây giờ

### 1. Kiểm tra Webhook Secret trên Stripe Dashboard

1. Đăng nhập [Stripe Dashboard](https://dashboard.stripe.com/)
2. Đảm bảo đang ở **Test mode** (góc trên bên phải)
3. Vào **Developers** → **Webhooks**
4. Tìm endpoint: `https://hotel-booking-2-be.vercel.app/api/stripe`
5. Click vào endpoint đó
6. Trong phần **Signing secret**, click **Reveal**
7. Copy secret key (dạng `whsec_...`)

### 2. So sánh với Environment Variable trên Vercel

1. Vào [Vercel Dashboard](https://vercel.com/dashboard)
2. Chọn project backend của bạn
3. Vào **Settings** → **Environment Variables**
4. Tìm biến `STRIPE_WEBHOOK_SECRET`
5. So sánh giá trị với secret key từ Stripe:
   - ✅ **Giống nhau**: OK, chuyển sang bước 3
   - ❌ **Khác nhau hoặc không có**: Cập nhật lại (xem bước 2.1)

#### 2.1. Cập nhật STRIPE_WEBHOOK_SECRET trên Vercel

1. Trong Vercel → Settings → Environment Variables
2. Nếu đã có `STRIPE_WEBHOOK_SECRET`:
   - Click **Edit**
   - Paste secret key mới từ Stripe
   - Click **Save**
3. Nếu chưa có:
   - Click **Add New**
   - Name: `STRIPE_WEBHOOK_SECRET`
   - Value: Paste secret key từ Stripe
   - Chọn tất cả environments (Production, Preview, Development)
   - Click **Save**
4. **QUAN TRỌNG**: Sau khi save, click **Redeploy** để áp dụng thay đổi

### 3. Kiểm tra Events đã nhận trên Stripe

1. Trong Stripe Dashboard → Webhooks → Click vào endpoint
2. Xem tab **Events**
3. Kiểm tra các event gần đây:
   - ✅ **Status 200**: Webhook hoạt động tốt
   - ❌ **Status 400**: Lỗi signature verification (sai webhook secret)
   - ❌ **Status 500**: Lỗi server (kiểm tra logs Vercel)
   - ❌ **Không có event nào**: Webhook chưa được trigger

### 4. Test Webhook bằng cách gửi test event

1. Trong Stripe Dashboard → Webhooks → Click vào endpoint
2. Click **Send test webhook**
3. Chọn event: `checkout.session.completed`
4. Click **Send test webhook**
5. Xem kết quả:
   - ✅ **Success**: Webhook hoạt động
   - ❌ **Failed**: Xem error message

### 5. Kiểm tra Logs trên Vercel

1. Vào Vercel Dashboard → Chọn project backend
2. Vào tab **Logs** hoặc **Functions**
3. Thực hiện một giao dịch test hoặc gửi test webhook
4. Xem logs real-time:

**Logs thành công:**
```
🔔 Stripe webhook received
📋 Headers: {...}
🔑 Webhook Secret exists: true
✅ Webhook signature verified, event type: checkout.session.completed
📦 Session data: { "bookingId": "..." }
🔄 Updating booking ...
✅ Payment confirmed for booking ...
```

**Logs lỗi thường gặp:**
```
❌ Webhook signature verification failed
→ Giải pháp: Cập nhật STRIPE_WEBHOOK_SECRET đúng và redeploy

❌ No bookingId found in session metadata
→ Giải pháp: Kiểm tra code tạo checkout session

❌ Booking ... not found in database
→ Giải pháp: Kiểm tra database connection
```

### 6. Test thanh toán thực tế

1. Vào trang web của bạn
2. Tạo một booking mới
3. Click "Thanh toán ngay"
4. Sử dụng card test của Stripe:
   - Card number: `4242 4242 4242 4242`
   - Expiry: Bất kỳ ngày trong tương lai (VD: 12/25)
   - CVC: Bất kỳ 3 số (VD: 123)
   - ZIP: Bất kỳ (VD: 12345)
5. Hoàn tất thanh toán
6. Đợi 4 giây (trang loader)
7. Kiểm tra trang My Bookings:
   - Trạng thái phải là "Đã xác nhận"
   - Thanh toán phải là "Đã thanh toán" (màu xanh)
   - Phương thức phải là "Stripe"

### 7. Nếu vẫn không hoạt động

#### Kiểm tra Events được chọn trên Webhook

1. Stripe Dashboard → Webhooks → Click endpoint
2. Xem phần **Events to send**
3. Đảm bảo có event: `checkout.session.completed`
4. Nếu không có:
   - Click **Add events**
   - Tìm và chọn `checkout.session.completed`
   - Click **Add events**

#### Kiểm tra Webhook có bị disabled không

1. Stripe Dashboard → Webhooks → Click endpoint
2. Xem status ở góc trên:
   - ✅ **Enabled**: OK
   - ❌ **Disabled**: Click **Enable** để bật lại

#### Thử xóa và tạo lại Webhook

1. Stripe Dashboard → Webhooks
2. Click vào endpoint cũ → Click **Delete**
3. Click **Add endpoint**
4. URL: `https://hotel-booking-2-be.vercel.app/api/stripe`
5. Events: Chọn `checkout.session.completed`
6. Click **Add endpoint**
7. Copy **Signing secret** mới
8. Cập nhật lại trên Vercel và redeploy

---

## Checklist nhanh

- [ ] Webhook URL đúng: `https://hotel-booking-2-be.vercel.app/api/stripe`
- [ ] Webhook đang ở Test mode (nếu đang test)
- [ ] Event `checkout.session.completed` đã được chọn
- [ ] Webhook status là **Enabled**
- [ ] `STRIPE_WEBHOOK_SECRET` trên Vercel khớp với Stripe Dashboard
- [ ] Đã redeploy sau khi cập nhật environment variable
- [ ] Test webhook từ Stripe Dashboard trả về status 200
- [ ] Logs trên Vercel hiển thị webhook được nhận

---

## Lưu ý quan trọng

1. **Webhook Secret phải khớp 100%**
   - Copy từ Stripe Dashboard
   - Paste vào Vercel Environment Variables
   - Không có khoảng trắng thừa
   - Đúng format: `whsec_...`

2. **Phải Redeploy sau khi cập nhật Environment Variables**
   - Vercel không tự động áp dụng ngay
   - Vào Deployments → Click **Redeploy**

3. **Test mode vs Live mode**
   - Webhook secret khác nhau giữa 2 mode
   - Đảm bảo đang dùng đúng mode

4. **Thời gian xử lý**
   - Webhook Stripe mất 2-4 giây để xử lý
   - Trang loader đợi 4 giây trước khi redirect
   - Nếu vẫn chậm, click nút "Làm mới" trên trang My Bookings

---

## Nếu cần hỗ trợ thêm

Gửi cho tôi:
1. Screenshot tab Events trên Stripe Dashboard (webhook endpoint)
2. Screenshot Environment Variables trên Vercel (che phần secret)
3. Logs từ Vercel khi thực hiện thanh toán
4. Trạng thái booking trong database sau khi thanh toán
