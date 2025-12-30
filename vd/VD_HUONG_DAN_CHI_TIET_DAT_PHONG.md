# HƯỚNG DẪN CHI TIẾT TỪNG BƯỚC ĐẶT PHÒNG (DÀNH CHO NGƯỜI KHÔNG BIẾT CODE)

## 📍 LUỒNG ĐẶT PHÒNG CỦA KHÁCH HÀNG

---

## BƯỚC 1: KHÁCH VÀO TRANG CHI TIẾT PHÒNG

### 🌐 URL: `/rooms/:id`
**Ví dụ**: `http://localhost:5173/rooms/abc123`

### 📁 File xử lý: `client/src/pages/RoomsTails.jsx`

**Dòng 79-82**: Lấy ID phòng từ URL
```javascript
const RoomsTails = () => {
    const { id } = useParams();  // ← Lấy ID phòng từ URL
    // ...
} 
```

**Dòng 83-91**: Khai báo các biến cần thiết
```javascript
const [checkInDate, setCheckInDate] = useState(null);      // Ngày nhận phòng
const [checkOutDate, setCheckOutDate] = useState(null);    // Ngày trả phòng
const [guests, setGuests] = useState(1);                   // Số khách
const [isAvailable, setIsAvailable] = useState(false);     // Phòng có trống không?
```

---

## BƯỚC 2: KHÁCH ĐIỀN FORM ĐẶT PHÒNG

### 📍 Vị trí trong file: `client/src/pages/RoomsTails.jsx`

**Dòng 540-590**: Form đặt phòng (HTML)
```javascript
<form onSubmit={onSubmitHandle}>  {/* ← Khi nhấn nút sẽ gọi hàm onSubmitHandle */}
    
    {/* Ô nhập ngày nhận phòng */}
    <input
        onChange={(e) => setCheckInDate(e.target.value)}  // ← Lưu ngày nhận phòng
        type="date"
        id="checkInDate"
        required
    />
    
    {/* Ô nhập ngày trả phòng */}
    <input
        onChange={(e) => setCheckOutDate(e.target.value)}  // ← Lưu ngày trả phòng
        type="date"
        id="checkOutDate"
        required
    />
    
    {/* Ô nhập số khách */}
    <input 
        onChange={(e) => setGuests(e.target.value)}  // ← Lưu số khách
        type="number"
        id="guests"
        required
    />
    
    {/* Nút submit */}
    <button type="submit">
        {isAvailable ? 'Đặt ngay' : 'Kiểm tra tình trạng'}
        {/* ↑ Nếu phòng trống hiện "Đặt ngay", chưa trống hiện "Kiểm tra tình trạng" */}
    </button>
</form>
```

**Giải thích**:
- Khi khách điền ngày → Lưu vào `checkInDate`, `checkOutDate`
- Khi khách điền số khách → Lưu vào `guests`
- Khi khách nhấn nút → Gọi hàm `onSubmitHandle`

---

## BƯỚC 3: KHÁCH NHẤN NÚT "KIỂM TRA TÌNH TRẠNG"

### 📍 Vị trí: `client/src/pages/RoomsTails.jsx`

**Dòng 235-250**: Hàm xử lý khi nhấn nút
```javascript
const onSubmitHandle = async (e) => {
    e.preventDefault();  // ← Ngăn trang reload
    
    if (!isAvailable) {
        // ← Nếu CHƯA kiểm tra phòng trống
        await CheckAvailability();  // → Gọi hàm kiểm tra
    } else {
        // ← Nếu ĐÃ kiểm tra và phòng trống
        await handleBooking();  // → Gọi hàm đặt phòng
    }
};
```

**Giải thích**:
- Lần đầu nhấn: `isAvailable = false` → Gọi `CheckAvailability()`
- Lần 2 nhấn (nếu phòng trống): `isAvailable = true` → Gọi `handleBooking()`

---

## BƯỚC 4: KIỂM TRA PHÒNG TRỐNG

### 📍 Vị trí: `client/src/pages/RoomsTails.jsx`

**Dòng 127-155**: Hàm kiểm tra phòng trống
```javascript
const CheckAvailability = async () => {
    try {
        // 1. Kiểm tra đã điền đủ thông tin chưa
        if (!checkInDate || !checkOutDate) {
            toast.error('Vui lòng chọn ngày nhận và trả phòng');
            return;
        }
        
        // 2. Kiểm tra ngày hợp lệ
        if (checkInDate >= checkOutDate) {
            toast.error('Ngày nhận phòng phải nhỏ hơn Ngày trả phòng');
            return;
        }

        // 3. GỌI API kiểm tra phòng trống
        const { data } = await axios.post('/api/bookings/check-availability', {
            room: id,              // ← ID phòng
            checkInDate,           // ← Ngày nhận
            checkOutDate,          // ← Ngày trả
        });

        // 4. Xử lý kết quả
        if (data.success) {
            if (data.isAvailable) {
                setIsAvailable(true);  // ← Đánh dấu phòng trống
                toast.success('Phòng còn trống, bạn có thể đặt ngay');
            } else {
                setIsAvailable(false);
                toast.error('Phòng không có sẵn');
            }
        }
    } catch (error) {
        toast.error('Có lỗi xảy ra');
    }
};
```

### 🔗 API được gọi: `POST /api/bookings/check-availability`

**Request gửi đi**:
```json
{
  "room": "abc123",
  "checkInDate": "2024-01-15",
  "checkOutDate": "2024-01-20"
}
```

---

## BƯỚC 5: SERVER KIỂM TRA PHÒNG TRỐNG

### 📁 File: `server/controllers/bookingControllers.js`

**Dòng 7-20**: Hàm kiểm tra phòng trống
```javascript
const checkAvailability = async ({ checkInDate, checkOutDate, room }) => {
    try {
        // Tìm tất cả booking của phòng này có trùng ngày
        const bookings = await Booking.find({
            room,  // ← Phòng này
            checkInDate: { $lte: checkOutDate },   // ← Ngày nhận <= ngày trả của khách
            checkOutDate: { $gte: checkInDate },   // ← Ngày trả >= ngày nhận của khách
        });

        // Nếu không có booking nào trùng = phòng trống
        const isAvailable = bookings.length === 0;
        return isAvailable;  // ← true = trống, false = đã có người đặt
    } catch (error) {
        console.error(error.message);
    }
};
```

**Giải thích logic**:
- Tìm booking có ngày trùng với ngày khách muốn đặt
- Nếu `bookings.length === 0` → Không có ai đặt → Phòng trống
- Nếu `bookings.length > 0` → Có người đặt rồi → Phòng đầy

**Dòng 22-37**: API endpoint
```javascript
export const checkAvailabilityAPI = async (req, res) => {
    try {
        const { room, checkInDate, checkOutDate } = req.body;  // ← Lấy data từ request

        // Gọi hàm kiểm tra
        const isAvailable = await checkAvailability({
            checkInDate,
            checkOutDate,
            room,
        });

        // Trả kết quả về cho client
        res.json({ success: true, isAvailable });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
```

**Response trả về**:
```json
{
  "success": true,
  "isAvailable": true  // ← true = phòng trống
}
```

---

## BƯỚC 6: KHÁCH NHẤN NÚT "ĐẶT NGAY"

### 📍 Vị trí: `client/src/pages/RoomsTails.jsx`

**Dòng 158-180**: Hàm đặt phòng
```javascript
const handleBooking = async () => {
    try {
        // GỌI API tạo booking
        const { data } = await axios.post(
            '/api/bookings/book',
            { 
                room: id,                           // ← ID phòng
                checkInDate,                        // ← Ngày nhận
                checkOutDate,                       // ← Ngày trả
                guests,                             // ← Số khách
                paymentMethod: 'Pay At Hotel'       // ← Phương thức thanh toán
            },
            { 
                headers: { 
                    Authorization: `Bearer ${await getToken()}`  // ← Token đăng nhập
                } 
            }
        );

        // Xử lý kết quả
        if (data.success) {
            toast.success('Đặt phòng thành công');
            navigate('/my-bookings');  // ← Chuyển đến trang "Đặt phòng của tôi"
            scrollTo(0, 0);
        } else {
            toast.error(data.message);
        }
    } catch (error) {
        toast.error('Có lỗi xảy ra khi đặt phòng');
    }
};
```

### 🔗 API được gọi: `POST /api/bookings/book`

**Request gửi đi**:
```json
{
  "room": "abc123",
  "checkInDate": "2024-01-15",
  "checkOutDate": "2024-01-20",
  "guests": 2,
  "paymentMethod": "Pay At Hotel"
}
```

---

## BƯỚC 7: SERVER TẠO BOOKING MỚI

### 📁 File: `server/controllers/bookingControllers.js`

**Dòng 39-130**: Hàm tạo booking (QUAN TRỌNG NHẤT)


```javascript
export const createBooking = async (req, res) => {
    try {
        // 1. LẤY THÔNG TIN TỪ REQUEST
        const { room, checkInDate, checkOutDate, guests } = req.body;
        const user = req.user._id;  // ← ID người dùng đã đăng nhập

        // 2. KIỂM TRA PHÒNG TRỐNG LẦN CUỐI
        const isAvailable = await checkAvailability({
            checkInDate,
            checkOutDate,
            room,
        });
        
        if (!isAvailable) {
            return res.json({ success: false, message: "Phòng không có sẵn" });
        }

        // 3. LẤY THÔNG TIN PHÒNG VÀ KHÁCH SẠN
        const roomData = await Room.findById(room).populate("hotel");
        
        // 4. TÍNH GIÁ PHÒNG (có discount không?)
        let pricePerNight = roomData.pricePerNight;  // Giá gốc
        
        if (roomData.discount && roomData.discount > 0) {
            // Nếu có giảm giá
            pricePerNight = roomData.pricePerNight * (1 - roomData.discount / 100);
            // Ví dụ: 1,000,000 * (1 - 20/100) = 800,000
        }

        // 5. TÍNH SỐ ĐÊM VÀ TỔNG TIỀN
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const timeDiff = checkOut.getTime() - checkIn.getTime();
        const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));  // Số đêm
        
        const totalPrice = pricePerNight * nights;  // Tổng tiền
        // Ví dụ: 800,000 * 5 đêm = 4,000,000

        // 6. TẠO BOOKING MỚI TRONG DATABASE
        const booking = await Booking.create({
            user,                           // ID khách hàng
            room,                           // ID phòng
            hotel: roomData.hotel._id,      // ID khách sạn
            guests: +guests,                // Số khách
            checkInDate,                    // Ngày nhận
            checkOutDate,                   // Ngày trả
            totalPrice,                     // Tổng tiền
            status: "pending",              // ← Trạng thái: Chờ xử lý
            isPaid: false                   // ← Chưa thanh toán
        });

        // 7. GỬI EMAIL CHO KHÁCH HÀNG
        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: req.user.email,
            subject: 'Hotel Booking Detail',
            html: `
                <h2>Your Booking Details</h2>
                <p>Dear ${req.user.username},</p>
                <p>Thank you for your booking!</p>
                <ul>
                    <li><strong>Booking ID:</strong> ${booking._id}</li>
                    <li><strong>Hotel:</strong> ${roomData.hotel.name}</li>
                    <li><strong>Check-in:</strong> ${booking.checkInDate}</li>
                    <li><strong>Total:</strong> ${totalPrice} VND</li>
                </ul>
            `
        };
        await transporter.sendMail(mailOption);

        // 8. TẠO THÔNG BÁO CHO CHỦ KHÁCH SẠN
        const hotel = await Hotel.findById(roomData.hotel._id).populate("owner");
        
        if (hotel && hotel.owner) {
            await Notification.create({
                user: hotel.owner._id,           // ← Gửi cho chủ KS
                type: "booking_new",
                title: "Đặt phòng mới",
                message: `Có đặt phòng mới từ ${req.user.username}`,
                relatedId: booking._id.toString(),
            });
        }

        // 9. TRẢ KẾT QUẢ THÀNH CÔNG
        res.json({ success: true, message: "Đã tạo đặt phòng thành công" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Không thể tạo đặt phòng" });
    }
};
```

**Kết quả sau khi tạo booking**:
- ✅ Booking mới được lưu vào database
- ✅ `status` = "pending" (Chờ xử lý)
- ✅ `isPaid` = false (Chưa thanh toán)
- ✅ Email gửi cho khách hàng
- ✅ Thông báo gửi cho chủ khách sạn
- ✅ Khách được chuyển đến trang `/my-bookings`

---

## BƯỚC 8: KHÁCH XEM BOOKING VỪA TẠO

### 🌐 URL: `/my-bookings`

### 📁 File: `client/src/pages/MyBookings.jsx`

**Dòng 24-45**: Hàm lấy danh sách booking
```javascript
const fetchUserBookings = async () => {
    try {
        setLoading(true);
        
        // GỌI API lấy danh sách booking
        const { data } = await axios.get('/api/bookings/user', {
            headers: {
                Authorization: `Bearer ${await getToken()}`,
            },
        });

        // Hiển thị danh sách
        if (data.success) {
            setBookings(data.bookings);  // ← Lưu vào state
        } else {
            toast.error(data.message);
        }
    } catch (error) {
        toast.error('Có lỗi xảy ra');
    } finally {
        setLoading(false);
    }
};
```

### 🔗 API được gọi: `GET /api/bookings/user`

---

## BƯỚC 9: SERVER TRẢ VỀ DANH SÁCH BOOKING

### 📁 File: `server/controllers/bookingControllers.js`

**Dòng 133-147**: Hàm lấy booking của user
```javascript
export const getUserBookings = async (req, res) => {
    try {
        const user = req.user._id;  // ← ID người dùng đã đăng nhập

        // Tìm tất cả booking của user này
        const bookings = await Booking.find({ user })
            .populate("room hotel")      // ← Lấy thêm thông tin phòng và khách sạn
            .sort({ createdAt: -1 });    // ← Sắp xếp mới nhất lên đầu

        // Trả về danh sách
        res.json({ success: true, bookings });
    } catch (error) {
        res.json({ success: false, message: "Không thể tải danh sách" });
    }
};
```

**Response trả về**:
```json
{
  "success": true,
  "bookings": [
    {
      "_id": "booking123",
      "user": "user123",
      "room": {
        "_id": "room123",
        "roomType": "Deluxe",
        "images": ["url1", "url2"]
      },
      "hotel": {
        "_id": "hotel123",
        "name": "Grand Hotel",
        "address": "123 Main St"
      },
      "checkInDate": "2024-01-15",
      "checkOutDate": "2024-01-20",
      "totalPrice": 4000000,
      "guests": 2,
      "status": "pending",
      "isPaid": false
    }
  ]
}
```

---

## BƯỚC 10: HIỂN THỊ BOOKING TRÊN GIAO DIỆN

### 📍 Vị trí: `client/src/pages/MyBookings.jsx`

**Dòng 250-450**: Hiển thị từng booking
```javascript
{booking.map((bookingItem, index) => (
    <div key={bookingItem._id}>
        {/* Hình ảnh phòng */}
        <img src={bookingItem.room?.images?.[0]} alt="hotel" />
        
        {/* Tên khách sạn */}
        <h2>{bookingItem.hotel?.name}</h2>
        
        {/* Loại phòng */}
        <span>{translateRoomType(bookingItem.room?.roomType)}</span>
        
        {/* Ngày nhận/trả */}
        <p>Nhận: {new Date(bookingItem.checkInDate).toLocaleDateString('vi-VN')}</p>
        <p>Trả: {new Date(bookingItem.checkOutDate).toLocaleDateString('vi-VN')}</p>
        
        {/* Tổng tiền */}
        <p>${bookingItem.totalPrice}</p>
        
        {/* Trạng thái thanh toán */}
        {bookingItem.isPaid ? (
            <span>✓ Đã thanh toán</span>
        ) : (
            <span>○ Chưa thanh toán</span>
        )}
        
        {/* Trạng thái booking */}
        <span>{translateBookingStatus(bookingItem.status)}</span>
        
        {/* Các nút hành động */}
        {!bookingItem.isPaid && (
            <button onClick={() => handlePaymentClick(bookingItem)}>
                Thanh toán
            </button>
        )}
        
        {bookingItem.status !== 'cancelled' && (
            <button onClick={() => handleCancelClick(bookingItem)}>
                Hủy đơn
            </button>
        )}
    </div>
))}
```

---

## 📊 TÓM TẮT LUỒNG HOẠT ĐỘNG

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Khách vào trang chi tiết phòng                           │
│    File: client/src/pages/RoomsTails.jsx                    │
│    URL: /rooms/:id                                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Khách điền form (ngày nhận, ngày trả, số khách)         │
│    Dòng 540-590 trong RoomsTails.jsx                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Khách nhấn "Kiểm tra tình trạng"                         │
│    Hàm: onSubmitHandle() - Dòng 235                         │
│    → Gọi CheckAvailability() - Dòng 127                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Gửi request đến server                                   │
│    API: POST /api/bookings/check-availability               │
│    Request: { room, checkInDate, checkOutDate }             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Server kiểm tra phòng trống                              │
│    File: server/controllers/bookingControllers.js           │
│    Hàm: checkAvailability() - Dòng 7-20                     │
│    Logic: Tìm booking trùng ngày → Nếu không có = trống    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. Server trả kết quả về                                    │
│    Response: { success: true, isAvailable: true }           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. Nút đổi thành "Đặt ngay"                                 │
│    isAvailable = true                                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 8. Khách nhấn "Đặt ngay"                                    │
│    Hàm: handleBooking() - Dòng 158                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 9. Gửi request tạo booking                                  │
│    API: POST /api/bookings/book                             │
│    Request: { room, checkInDate, checkOutDate, guests }     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 10. Server tạo booking mới                                  │
│     File: server/controllers/bookingControllers.js          │
│     Hàm: createBooking() - Dòng 39-130                      │
│     - Kiểm tra phòng trống lần cuối                         │
│     - Tính giá (có discount không?)                         │
│     - Tính số đêm và tổng tiền                              │
│     - Tạo booking: status=pending, isPaid=false             │
│     - Gửi email cho khách                                   │
│     - Tạo thông báo cho chủ KS                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 11. Chuyển khách đến trang "Đặt phòng của tôi"             │
│     URL: /my-bookings                                        │
│     File: client/src/pages/MyBookings.jsx                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 12. Hiển thị booking vừa tạo                                │
│     - Hình ảnh phòng                                        │
│     - Tên khách sạn                                         │
│     - Ngày nhận/trả                                         │
│     - Tổng tiền                                             │
│     - Trạng thái: "Chờ xử lý" + "Chưa thanh toán"          │
│     - Nút "Thanh toán" và "Hủy đơn"                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 CÁC FILE QUAN TRỌNG VÀ DÒNG CODE

### 1. Trang chi tiết phòng (Đặt phòng)
**File**: `client/src/pages/RoomsTails.jsx`
- **Dòng 79-91**: Khai báo biến (checkInDate, checkOutDate, guests, isAvailable)
- **Dòng 127-155**: Hàm kiểm tra phòng trống `CheckAvailability()`
- **Dòng 158-180**: Hàm đặt phòng `handleBooking()`
- **Dòng 235-250**: Hàm xử lý submit form `onSubmitHandle()`
- **Dòng 540-590**: Form HTML (input ngày, số khách, nút submit)

### 2. Trang đặt phòng của tôi
**File**: `client/src/pages/MyBookings.jsx`
- **Dòng 24-45**: Hàm lấy danh sách booking `fetchUserBookings()`
- **Dòng 250-450**: Hiển thị từng booking (HTML)

### 3. Server xử lý booking
**File**: `server/controllers/bookingControllers.js`
- **Dòng 7-20**: Hàm kiểm tra phòng trống `checkAvailability()`
- **Dòng 22-37**: API kiểm tra phòng trống `checkAvailabilityAPI()`
- **Dòng 39-130**: API tạo booking mới `createBooking()` ⭐ QUAN TRỌNG NHẤT
- **Dòng 133-147**: API lấy danh sách booking `getUserBookings()`

### 4. Định nghĩa routes
**File**: `server/routes/bookingRoutes.js`
- **Dòng 12**: `POST /check-availability` → `checkAvailabilityAPI`
- **Dòng 13**: `POST /book` → `createBooking`
- **Dòng 14**: `GET /user` → `getUserBookings`

### 5. Model Booking
**File**: `server/models/Booking.js`
- **Dòng 3-40**: Định nghĩa cấu trúc booking (schema)
- Các trường: user, room, hotel, checkInDate, checkOutDate, totalPrice, guests, status, isPaid

---

## 💡 GIẢI THÍCH CHO NGƯỜI KHÔNG BIẾT CODE

### Khi khách nhấn "Kiểm tra tình trạng":
1. **Frontend** (RoomsTails.jsx dòng 127) gọi hàm `CheckAvailability()`
2. Hàm này gửi request đến **Backend** (API: `/api/bookings/check-availability`)
3. **Backend** (bookingControllers.js dòng 7) tìm trong database xem có booking nào trùng ngày không
4. Nếu không có → Phòng trống → Trả về `isAvailable: true`
5. **Frontend** nhận kết quả → Đổi nút thành "Đặt ngay"

### Khi khách nhấn "Đặt ngay":
1. **Frontend** (RoomsTails.jsx dòng 158) gọi hàm `handleBooking()`
2. Hàm này gửi request đến **Backend** (API: `/api/bookings/book`)
3. **Backend** (bookingControllers.js dòng 39):
   - Kiểm tra phòng trống lần cuối
   - Tính giá (có giảm giá không?)
   - Tính tổng tiền = giá × số đêm
   - Tạo booking mới trong database
   - Gửi email cho khách
   - Tạo thông báo cho chủ KS
4. **Frontend** nhận kết quả → Chuyển đến trang `/my-bookings`

---

**Cập nhật**: December 2024
**Dành cho**: Người không biết code
