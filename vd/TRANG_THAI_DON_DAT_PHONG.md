✅ Bạn đã hiểu ĐÚNG về logic hệ thống!
Để làm rõ hơn, đây là cách hệ thống hoạt động:

🔵 Góc nhìn của KHÁCH HÀNG (User):
Chưa thanh toán = status: "pending" + isPaid: false

Vừa đặt phòng, chưa thanh toán
Đã thanh toán = status: "confirmed" + isPaid: true

Đã thanh toán → tự động chuyển sang "confirmed"
Đã hủy = status: "cancelled"

Khách hủy hoặc chủ KS hủy → có hoàn tiền
Đã hoàn thành = status: "completed"

Sau khi checkout, chủ KS nhấn "Hoàn thành"
🏨 Góc nhìn của CHỦ KHÁCH SẠN (Owner):
Đang chờ xử lý = status: "pending"

Đơn mới, khách chưa thanh toán
Chủ KS cần xác nhận
Đã xác nhận = status: "confirmed"

Khách đã thanh toán HOẶC chủ KS đã xác nhận thủ công
Phòng được giữ chắc chắn
Đã hủy = status: "cancelled"

Khách hủy → hoàn tiền theo chính sách (0-100%)
Chủ KS hủy → hoàn 100%
Hoàn thành = status: "completed"

Khách đã checkout
Chủ KS nhấn "Hoàn thành" để giải phóng phòng cho người khác đặt
Điều kiện: Phải đã thanh toán (isPaid: true)
🔑 Điểm quan trọng:
Hệ thống có 4 trạng thái: pending, confirmed, cancelled, completed
Khi khách thanh toán thành công → tự động chuyển từ pending → confirmed
Chỉ có thể hoàn thành đơn khi đã thanh toán
Không thể hủy đơn đã hoàn thành

**Cập nhật**: December 2024  
**Phiên bản**: 2.0 - Chi tiết đầy đủ
Đối với người dùng khi đặt phòng sẽ có 3 trạng thái 
-chưa thanh toán
-đã thanh toán 
-đã hủy
-đặt phòng đã hoàn thành(xuất hiện cái này khi nhân viên quản lý khách sạn nhấn vào đã hoàn thành) 
còn đối vs bên phía khách sạn
- đang chờ xử lý (có nghĩa là chưa thanh toán)
- đã xác nhận là (khách hàng đã thanh toán)
- đã hủy (khách hàng hủy đặt phòng hoặc nhân viên hủy phòng đó và sẽ hoàn tiền lại cho khách hàng)
-hoàn thành(là sau khi khách hàng đã checkout xong lúc đó sẽ nhấn thủ công để phòng đó có thể để người khác book)
