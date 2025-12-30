# HƯỚNG DẪN VẤN ĐÁP TOÀN BỘ CHỨC NĂNG ĐẶT PHÒNG

## 📚 MỤC LỤC

1. [Giới thiệu](#giới-thiệu)
2. [Chức năng của USER (Khách hàng)](#chức-năng-của-user-khách-hàng)
3. [Chức năng của OWNER (Chủ khách sạn)](#chức-năng-của-owner-chủ-khách-sạn)
4. [Câu hỏi thường gặp (FAQ)](#câu-hỏi-thường-gặp-faq)
5. [Troubleshooting](#troubleshooting)

---

## GIỚI THIỆU

Hệ thống đặt phòng khách sạn có 2 vai trò chính:
- **USER (Khách hàng)**: Đặt phòng, thanh toán, hủy phòng, xem lịch sử
- **OWNER (Chủ khách sạn)**: Quản lý đơn đặt phòng, xác nhận, hoàn thành, hủy đơn

### Các trạng thái booking:
- **pending**: Chờ xử lý (chưa thanh toán)
- **confirmed**: Đã xác nhận (đã thanh toán hoặc chủ KS xác nhận)
- **cancelled**: Đã hủy
- **completed**: Hoàn thành (sau checkout)

---

## CHỨC NĂNG CỦA USER (KHÁCH HÀNG)

### 1. ĐẶT PHÒNG MỚI

#### Bước 1: Tìm và chọn phòng
**File**: `client/src/pages/RoomsTails.jsx`

**Quy trình**:
1. Khách vào trang chi tiết phòng `/rooms/:id`
2. Xem thông tin phòng: giá, tiện nghi, đánh giá
3. Điền form đặt phòng:
   - Ngày nhận phòng (checkInDate)
   - Ngày trả phòng (checkOutDate)
   - Số khách (guests)

**Code quan trọng**:
```javascript
// Form đặt phòng
<form onSubmit={onSubmitHandle}>
  <input type="date" onChange={(e) => setCheckInDate(e.target.value)} />
  <input type="date" onChange={(e) => setCheckOutDate(e.target.value)} />
  <input type="number" onChange={(e) => setGuests(e.target.value)} />
  <button type="submit">
    {isAvailable ? 'Đặt ngay' : 'Kiểm tra tình trạng'}
  </button>
</form>
```

#### Bước 2: Kiểm tra phòng trống
**API**: `POST /api/bookings/check-availability`

**Request**:
```json
{
  "room": "room_id",
  "checkInDate": "2024-01-15",
  "checkOutDate": "2024-01-20"
}
```

**Response**:
```json
{
  "success": true,
  "isAvailable": true
}
```

**Logic backend** (`server/controllers/bookingControllers.js`):
```javascript
const checkAvailability = async ({ checkInDate, checkOutDate, room }) => {
  const bookings = await Booking.find({
    room,
    checkInDate: { $lte: checkOutDate },
    checkOutDate: { $gte: checkInDate },
  });
  
  return bookings.length === 0; // true = phòng trống
};
```


#### Bước 3: Tạo đơn đặt phòng
**API**: `POST /api/bookings/book`

**Request**:
```json
{
  "room": "room_id",
  "checkInDate": "2024-01-15",
  "checkOutDate": "2024-01-20",
  "guests": 2,
  "paymentMethod": "Pay At Hotel"
}
```

**Logic backend**:
```javascript
export const createBooking = async (req, res) => {
  const { room, checkInDate, checkOutDate, guests } = req.body;
  const user = req.user._id;

  // 1. Kiểm tra phòng trống
  const isAvailable = await checkAvailability({ checkInDate, checkOutDate, room });
  if (!isAvailable) {
    return res.json({ success: false, message: "Phòng không có sẵn" });
  }

  // 2. Lấy thông tin phòng và tính giá
  const roomData = await Room.findById(room).populate("hotel");
  let pricePerNight = roomData.pricePerNight;
  
  // Áp dụng discount nếu có
  if (roomData.discount && roomData.discount > 0) {
    pricePerNight = roomData.pricePerNight * (1 - roomData.discount / 100);
  }

  // 3. Tính tổng tiền
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const nights = Math.ceil((checkOut - checkIn) / (1000 * 3600 * 24));
  const totalPrice = pricePerNight * nights;

  // 4. Tạo booking
  const booking = await Booking.create({
    user,
    room,
    hotel: roomData.hotel._id,
    guests: +guests,
    checkInDate,
    checkOutDate,
    totalPrice,
    status: "pending",  // Mặc định
    isPaid: false       // Chưa thanh toán
  });

  // 5. Gửi email xác nhận
  await transporter.sendMail({
    to: req.user.email,
    subject: 'Hotel Booking Detail',
    html: `<h2>Your Booking Details</h2>...`
  });

  // 6. Tạo thông báo cho chủ KS
  await Notification.create({
    user: hotel.owner._id,
    type: "booking_new",
    title: "Đặt phòng mới",
    message: `Có đặt phòng mới từ ${req.user.username}`
  });

  res.json({ success: true, message: "Đã tạo đặt phòng thành công" });
};
```

**Kết quả**:
- Booking được tạo với `status: "pending"`, `isPaid: false`
- Email gửi cho khách hàng
- Thông báo gửi cho chủ khách sạn
- Khách được chuyển đến `/my-bookings`

---

### 2. XEM DANH SÁCH BOOKING CỦA TÔI

**File**: `client/src/pages/MyBookings.jsx`
**API**: `GET /api/bookings/user`

**Giao diện hiển thị**:
- Tổng số booking
- Số booking đã thanh toán
- Số booking chờ thanh toán
- Danh sách chi tiết từng booking

**Code frontend**:
```javascript
const fetchUserBookings = async () => {
  const { data } = await axios.get('/api/bookings/user', {
    headers: { Authorization: `Bearer ${await getToken()}` }
  });
  
  if (data.success) {
    setBookings(data.bookings);
  }
};
```

**Logic backend**:
```javascript
export const getUserBookings = async (req, res) => {
  const user = req.user._id;
  
  const bookings = await Booking.find({ user })
    .populate("room hotel")
    .sort({ createdAt: -1 });
  
  res.json({ success: true, bookings });
};
```

**Thông tin hiển thị mỗi booking**:
- Hình ảnh phòng
- Tên khách sạn
- Loại phòng
- Ngày nhận/trả phòng
- Số khách
- Tổng tiền
- Trạng thái thanh toán (isPaid)
- Trạng thái booking (status)
- Các nút hành động

---

### 3. THANH TOÁN BOOKING

**File**: `client/src/pages/MyBookings.jsx`

#### 3 phương thức thanh toán:

**1. Stripe (Thẻ tín dụng)**:
```javascript
navigate(`/payment/stripe?bookingId=${bookingId}&amount=${amount}`);
```

**2. MoMo (Ví điện tử)**:
```javascript
navigate(`/payment/momo?bookingId=${bookingId}&amount=${amount}`);
```

**3. Thanh toán tại khách sạn**:
```javascript
const { data } = await axios.patch(
  `/api/bookings/${bookingId}`,
  { paymentMethod: 'pay-at-hotel' },
  { headers: { Authorization: `Bearer ${token}` } }
);
```

#### Sau khi thanh toán thành công:
**API**: `PATCH /api/bookings/:id`

**Request**:
```json
{
  "isPaid": true
}
```

**Logic backend**:
```javascript
export const updateBooking = async (req, res) => {
  const { id } = req.params;
  const { isPaid } = req.body;
  
  const booking = await Booking.findById(id);
  
  if (isPaid !== undefined) {
    booking.isPaid = isPaid;
    
    // TỰ ĐỘNG chuyển status sang confirmed khi thanh toán
    if (isPaid === true && booking.status === 'pending') {
      booking.status = 'confirmed';
    }
  }
  
  await booking.save();
  res.json({ success: true, booking });
};
```

**Kết quả**:
- `isPaid` = true
- `status` tự động chuyển từ `pending` → `confirmed`

---

### 4. HỦY BOOKING (KHÁCH HÀNG)

**File**: `client/src/pages/MyBookings.jsx`
**Component**: `client/src/components/modals/CancelBookingModal.jsx`
**API**: `POST /api/bookings/:id/cancel`

#### Điều kiện hủy:
```javascript
// Không thể hủy nếu:
if (booking.status === 'cancelled') {
  return toast.error('Đặt phòng đã được hủy trước đó');
}

if (booking.status === 'completed') {
  return toast.error('Không thể hủy đặt phòng đã hoàn thành');
}

// Không thể hủy sau ngày check-in
const now = new Date();
const checkInDate = new Date(booking.checkInDate);
if (now >= checkInDate) {
  return toast.error('Không thể hủy sau ngày nhận phòng');
}
```

#### Chính sách hoàn tiền:
```javascript
const hoursUntilCheckIn = (checkInDate - now) / (1000 * 60 * 60);
let refundPercentage = 0;

if (hoursUntilCheckIn >= 168) {      // ≥ 7 ngày
  refundPercentage = 100;
} else if (hoursUntilCheckIn >= 72) { // 3-7 ngày
  refundPercentage = 50;
} else if (hoursUntilCheckIn >= 24) { // 1-3 ngày
  refundPercentage = 25;
} else {                              // < 1 ngày
  refundPercentage = 0;
}

const refundAmount = booking.isPaid 
  ? (booking.totalPrice * refundPercentage) / 100 
  : 0;
```

#### Request:
```json
{
  "cancellationReason": "Thay đổi kế hoạch du lịch"
}
```

#### Logic backend:
```javascript
export const cancelBooking = async (req, res) => {
  const { id } = req.params;
  const { cancellationReason } = req.body;
  
  const booking = await Booking.findById(id).populate("room hotel user");
  
  // Kiểm tra điều kiện hủy...
  
  // Tính % hoàn tiền
  const hoursUntilCheckIn = (checkInDate - now) / (1000 * 60 * 60);
  let refundPercentage = 0;
  if (hoursUntilCheckIn >= 168) refundPercentage = 100;
  else if (hoursUntilCheckIn >= 72) refundPercentage = 50;
  else if (hoursUntilCheckIn >= 24) refundPercentage = 25;
  
  const refundAmount = booking.isPaid 
    ? (booking.totalPrice * refundPercentage) / 100 
    : 0;
  
  // Cập nhật booking
  booking.status = "cancelled";
  booking.cancelledAt = now;
  booking.cancelledBy = userId;
  booking.cancellationReason = cancellationReason;
  booking.refundAmount = refundAmount;
  booking.refundPercentage = refundPercentage;
  await booking.save();
  
  // Gửi email cho khách và chủ KS
  await transporter.sendMail({...});
  
  // Tạo thông báo
  await Notification.create({...});
  
  res.json({ success: true, booking, refundInfo: { refundAmount, refundPercentage } });
};
```

**Kết quả**:
- `status` = "cancelled"
- `cancelledAt` = thời gian hủy
- `cancelledBy` = user ID
- `cancellationReason` = lý do hủy
- `refundAmount` = số tiền hoàn
- `refundPercentage` = % hoàn tiền
- Email gửi cho cả khách và chủ KS
- Thông báo được tạo

---

### 5. XÓA BOOKING ĐÃ HỦY

**API**: `DELETE /api/bookings/:id`

**Điều kiện**: Chỉ xóa được booking đã hủy (`status === 'cancelled'`)

**Code frontend**:
```javascript
const handleDelete = async () => {
  const { data } = await axios.delete(`/api/bookings/${bookingId}`, {
    headers: { Authorization: `Bearer ${await getToken()}` }
  });
  
  if (data.success) {
    toast.success('Đã xóa đơn đặt phòng thành công');
    setBookings(bookings.filter(b => b._id !== bookingId));
  }
};
```

**Logic backend**:
```javascript
export const deleteBooking = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  
  const booking = await Booking.findById(id);
  
  // Kiểm tra quyền sở hữu
  if (booking.user.toString() !== userId.toString()) {
    return res.json({ success: false, message: "Unauthorized" });
  }
  
  await Booking.findByIdAndDelete(id);
  res.json({ success: true, message: "Booking deleted successfully" });
};
```

---

## CHỨC NĂNG CỦA OWNER (CHỦ KHÁCH SẠN)

### 1. XEM DANH SÁCH BOOKING CỦA KHÁCH SẠN

**File**: `client/src/pages/hotelsOwner/OwnerBookings.jsx`
**API**: `GET /api/bookings/owner`

#### Bộ lọc:
- **Trạng thái**: pending, confirmed, cancelled, completed
- **Từ ngày**: fromDate
- **Đến ngày**: toDate

**Code frontend**:
```javascript
const query = useMemo(() => {
  const params = new URLSearchParams();
  if (statusFilter) params.set('status', statusFilter);
  if (fromDate) params.set('from', fromDate);
  if (toDate) params.set('to', toDate);
  return params.toString();
}, [statusFilter, fromDate, toDate]);

const fetchBookings = async () => {
  const url = `/api/bookings/owner${query ? `?${query}` : ''}`;
  const { data } = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  if (data.success) {
    setBookings(data.bookings);
  }
};
```

**Logic backend**:
```javascript
export const getHotelBookings = async (req, res) => {
  const ownerId = req.user._id;
  const { status, from, to } = req.query;
  
  // Tìm tất cả khách sạn của owner
  const hotels = await Hotel.find({ owner: ownerId });
  const hotelIds = hotels.map(h => h._id.toString());
  
  // Tạo filter
  const filter = { hotel: { $in: hotelIds } };
  if (status) filter.status = status;
  if (from || to) {
    filter.checkInDate = {};
    if (from) filter.checkInDate.$gte = new Date(from);
    if (to) filter.checkInDate.$lte = new Date(to);
  }
  
  const bookings = await Booking.find(filter)
    .populate("room hotel user")
    .sort({ createdAt: -1 });
  
  const totalBookings = bookings.length;
  const totalRevenue = bookings.reduce((acc, b) => acc + b.totalPrice, 0);
  
  res.json({
    success: true,
    bookings,
    metrics: { totalBookings, totalRevenue }
  });
};
```

**Thông tin hiển thị**:
- Ảnh phòng (ẩn nếu đã hoàn thành)
- Tên khách hàng (ẩn nếu đã hoàn thành)
- Email khách (ẩn nếu đã hoàn thành)
- Loại phòng
- Ngày nhận/trả
- Tổng tiền
- Trạng thái thanh toán
- Trạng thái booking
- Các nút hành động

---

### 2. XÁC NHẬN BOOKING (PENDING → CONFIRMED)

**API**: `PATCH /api/bookings/:id/status`

**Request**:
```json
{
  "status": "confirmed"
}
```

**Code frontend**:
```javascript
const updateStatus = async (id, status) => {
  const { data } = await axios.patch(
    `/api/bookings/${id}/status`,
    { status },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  
  if (data.success) {
    toast.success('Cập nhật trạng thái thành công');
    setBookings(prev => prev.map(b => (b._id === id ? data.booking : b)));
  }
};
```

**Logic backend**:
```javascript
export const updateBookingStatus = async (req, res) => {
  const ownerId = req.user._id;
  const { id } = req.params;
  const { status } = req.body; // "confirmed" | "cancelled" | "completed"
  
  // Kiểm tra trạng thái hợp lệ
  if (!["confirmed", "cancelled", "completed"].includes(status)) {
    return res.json({ success: false, message: "Trạng thái không hợp lệ" });
  }
  
  const booking = await Booking.findById(id);
  const hotel = await Hotel.findById(booking.hotel);
  
  // Kiểm tra quyền sở hữu
  if (hotel.owner.toString() !== ownerId.toString()) {
    return res.json({ success: false, message: "Không có quyền truy cập" });
  }
  
  // Không thể thay đổi booking đã hoàn thành
  if (booking.status === "completed") {
    return res.json({ success: false, message: "Đặt phòng đã hoàn thành" });
  }
  
  // Cập nhật
  booking.status = status;
  await booking.save();
  
  // Populate thông tin
  await booking.populate("user room hotel");
  
  // Tạo thông báo cho khách
  await Notification.create({
    user: booking.user._id,
    type: `booking_${status}`,
    title: "Cập nhật trạng thái đặt phòng",
    message: `Đặt phòng của bạn đã được ${status === 'confirmed' ? 'xác nhận' : status}`
  });
  
  res.json({ success: true, booking });
};
```

**Kết quả**:
- `status` chuyển từ `pending` → `confirmed`
- Email gửi cho khách hàng
- Thông báo được tạo

---

### 3. HOÀN THÀNH BOOKING (CONFIRMED → COMPLETED)

**Điều kiện**: 
- Booking phải ở trạng thái `confirmed`
- Khách hàng đã thanh toán (`isPaid === true`)

**Code frontend**:
```javascript
<button onClick={() => updateStatus(booking._id, 'completed')}>
  Hoàn thành
</button>
```

**Logic backend**:
```javascript
// Trong updateBookingStatus()
if (status === "completed" && !booking.isPaid) {
  return res.json({ 
    success: false, 
    message: "Không thể hoàn thành: Khách hàng chưa thanh toán" 
  });
}

booking.status = "completed";
await booking.save();
```

**Kết quả**:
- `status` = "completed"
- Phòng được giải phóng cho người khác đặt
- Thông tin khách được ẩn đi (privacy)

---

### 4. HỦY BOOKING (CHỦ KHÁCH SẠN)

**File**: `client/src/components/hotelsOwner/CancelBookingByOwnerModal.jsx`
**API**: `POST /api/bookings/:id/cancel-by-owner`

**Chính sách**: Chủ KS hủy = Hoàn 100% cho khách

**Request**:
```json
{
  "cancellationReason": "Phòng bị hỏng cần sửa chữa"
}
```

**Logic backend**:
```javascript
export const cancelBookingByOwner = async (req, res) => {
  const { id } = req.params;
  const ownerId = req.user._id;
  const { cancellationReason } = req.body;
  
  const booking = await Booking.findById(id).populate("room hotel user");
  const hotel = await Hotel.findById(booking.hotel._id);
  
  // Kiểm tra quyền
  if (hotel.owner.toString() !== ownerId.toString()) {
    return res.json({ success: false, message: "Không có quyền hủy" });
  }
  
  // Kiểm tra điều kiện
  if (booking.status === "cancelled") {
    return res.json({ success: false, message: "Đã hủy trước đó" });
  }
  
  if (booking.status === "completed") {
    return res.json({ success: false, message: "Không thể hủy đã hoàn thành" });
  }
  
  // Chủ KS hủy: LUÔN hoàn 100%
  const refundPercentage = 100;
  const refundAmount = booking.isPaid ? booking.totalPrice : 0;
  
  // Cập nhật
  booking.status = "cancelled";
  booking.cancelledAt = new Date();
  booking.cancelledBy = ownerId;
  booking.cancellationReason = cancellationReason || "Hủy bởi chủ khách sạn";
  booking.refundAmount = refundAmount;
  booking.refundPercentage = refundPercentage;
  await booking.save();
  
  // Gửi email cho khách
  await transporter.sendMail({
    to: booking.user.email,
    subject: "Thông báo hủy đặt phòng",
    html: `
      <h2>Đặt phòng đã bị hủy</h2>
      <p>Rất tiếc, đặt phòng của bạn đã bị hủy bởi khách sạn.</p>
      <p>Số tiền hoàn: ${refundAmount} VND (100%)</p>
    `
  });
  
  // Tạo thông báo
  await Notification.create({
    user: booking.user._id,
    type: "booking_cancelled",
    title: "Đặt phòng bị hủy",
    message: `Đặt phòng tại ${booking.hotel.name} đã bị hủy bởi khách sạn. Hoàn 100%`
  });
  
  res.json({ success: true, booking, refundInfo: { refundAmount, refundPercentage } });
};
```

**Kết quả**:
- `status` = "cancelled"
- `refundPercentage` = 100 (luôn luôn)
- `refundAmount` = toàn bộ số tiền (nếu đã thanh toán)
- Email gửi cho khách
- Thông báo được tạo

---

### 5. XEM DASHBOARD THỐNG KÊ

**File**: `client/src/pages/hotelsOwner/Dashboard.jsx`
**API**: `GET /api/owner/dashboard/stats`

**Thống kê hiển thị**:
1. **Tổng đặt phòng** (totalBookings)
2. **Tổng doanh thu** (totalRevenue)
3. **Tổng phòng** (totalRooms)
4. **Đánh giá trung bình** (averageRating)

**Biểu đồ**:
- **Line Chart**: Doanh thu theo tháng (6 tháng gần nhất)
- **Pie Chart**: Phân bố trạng thái booking
- **Bar Chart**: Doanh thu theo tháng

**Danh sách**:
- Booking gần đây (recentBookings)
- Đánh giá gần đây (recentReviews)
- Thông báo (notifications)

**Code frontend**:
```javascript
const fetchDashboardStats = async () => {
  const { data } = await axios.get('/api/owner/dashboard/stats', {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  if (data.success) {
    setStats(data.stats);
  }
};
```

---

## CÂU HỎI THƯỜNG GẶP (FAQ)

### Q1: Khi nào booking tự động chuyển sang "confirmed"?
**A**: Khi khách hàng thanh toán thành công (`isPaid = true`), hệ thống tự động chuyển `status` từ `pending` → `confirmed`.

```javascript
if (isPaid === true && booking.status === 'pending') {
  booking.status = 'confirmed';
}
```

### Q2: Tại sao không thể hoàn thành booking chưa thanh toán?
**A**: Đây là quy tắc nghiệp vụ để đảm bảo khách đã thanh toán trước khi hoàn thành.

```javascript
if (status === "completed" && !booking.isPaid) {
  return error("Không thể hoàn thành: Khách hàng chưa thanh toán");
}
```

### Q3: Chính sách hoàn tiền khi khách hủy?
**A**: 
- ≥ 7 ngày trước check-in: Hoàn 100%
- 3-7 ngày: Hoàn 50%
- 1-3 ngày: Hoàn 25%
- < 1 ngày: Không hoàn

### Q4: Chính sách hoàn tiền khi chủ KS hủy?
**A**: Luôn hoàn 100% cho khách hàng.

### Q5: Có thể hủy booking đã hoàn thành không?
**A**: Không. Booking đã hoàn thành không thể hủy hoặc thay đổi.

### Q6: Có thể xóa booking nào?
**A**: Chỉ xóa được booking đã hủy (`status === 'cancelled'`).

### Q7: Làm sao biết phòng trống?
**A**: Hệ thống kiểm tra xem có booking nào trùng ngày không:
```javascript
const bookings = await Booking.find({
  room,
  checkInDate: { $lte: checkOutDate },
  checkOutDate: { $gte: checkInDate },
});
return bookings.length === 0; // true = phòng trống
```

### Q8: Email được gửi khi nào?
**A**: 
- Khi tạo booking mới
- Khi xác nhận booking
- Khi hủy booking
- Khi hoàn thành booking

### Q9: Thông báo được tạo khi nào?
**A**:
- Khi có booking mới (gửi cho chủ KS)
- Khi cập nhật trạng thái (gửi cho khách)
- Khi hủy booking (gửi cho cả 2 bên)

### Q10: Tại sao thông tin khách bị ẩn khi hoàn thành?
**A**: Để bảo vệ quyền riêng tư của khách hàng sau khi giao dịch hoàn tất.

---

## TROUBLESHOOTING

### Vấn đề 1: Không thể đặt phòng
**Nguyên nhân**:
- Phòng đã được đặt trong khoảng thời gian đó
- Ngày check-out không hợp lệ
- Chưa đăng nhập

**Giải pháp**:
- Chọn ngày khác
- Kiểm tra lại thông tin
- Đăng nhập tài khoản

### Vấn đề 2: Không thể thanh toán
**Nguyên nhân**:
- Booking đã bị hủy
- Booking đã thanh toán rồi
- Lỗi kết nối payment gateway

**Giải pháp**:
- Kiểm tra trạng thái booking
- Thử lại sau vài phút
- Liên hệ support

### Vấn đề 3: Không thể hủy booking
**Nguyên nhân**:
- Booking đã hoàn thành
- Đã quá ngày check-in
- Booking đã bị hủy trước đó

**Giải pháp**:
- Kiểm tra trạng thái booking
- Liên hệ chủ khách sạn

### Vấn đề 4: Không thể hoàn thành booking
**Nguyên nhân**:
- Khách chưa thanh toán
- Booking không ở trạng thái confirmed

**Giải pháp**:
- Yêu cầu khách thanh toán trước
- Xác nhận booking trước khi hoàn thành

### Vấn đề 5: Không nhận được email
**Giải pháp**:
- Kiểm tra thư mục spam
- Xác nhận email đăng ký đúng
- Liên hệ support

---

## TÓM TẮT LUỒNG HOẠT ĐỘNG

### Luồng đặt phòng thành công:
```
1. Khách chọn phòng và điền form
2. Kiểm tra phòng trống (check-availability)
3. Tạo booking (status: pending, isPaid: false)
4. Khách thanh toán
5. Cập nhật isPaid = true
6. Status tự động chuyển sang confirmed
7. Khách check-in và check-out
8. Chủ KS đánh dấu completed
9. Hoàn thành
```

### Luồng hủy phòng (khách):
```
1. Khách vào My Bookings
2. Click "Hủy đơn"
3. Nhập lý do hủy
4. Hệ thống tính % hoàn tiền
5. Cập nhật status = cancelled
6. Gửi email thông báo
7. Tạo thông báo
8. Hoàn tiền (nếu có)
```

### Luồng hủy phòng (chủ KS):
```
1. Chủ KS vào Owner Bookings
2. Click "Hủy"
3. Nhập lý do hủy
4. Hệ thống tự động hoàn 100%
5. Cập nhật status = cancelled
6. Gửi email cho khách
7. Tạo thông báo
8. Hoàn tiền 100%
```

---

**Cập nhật**: December 2024
**Phiên bản**: 1.0
**Tác giả**: Hotel Booking System Team
