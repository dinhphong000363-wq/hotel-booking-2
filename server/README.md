# hotel_bookinh
# hotel-booking



http://localhost:3000

<!-- 
    git status
    git add .
    git commit -m "thêm được cái gg map ở trang detail, chỉnh sửa lại cái đăng kí khách sạn , tiếp theo là hoàn thiện cái gg map ở trang đăng kí khách sạn vs lại dùng api việt nam hay vì 2 file json , chỉnh sửa lại chức năng thanh toán ,  chatbot và một số chức năng còn thiếu của trang web"
    git push origin main



 -->
 <!-- 
 chức năng giảm giá 
 form đăng kí khách sạn , cập nhật thêm cái gg map
 tìm hiểu rõ về booking , thanh toán
  -->


  <!-- 
  
  1. KHÁCH ĐẶT PHÒNG
   ↓
   Status: Pending (Đang chờ xử lý)
   isPaid: false
   Nút: [Xác nhận] [Hủy]
   
2. KHÁCH THANH TOÁN (Optional - có thể thanh toán sau)
   ↓
   Status: Pending (vẫn Pending!)
   isPaid: true ← Chỉ thay đổi cái này
   Nút: [Xác nhận] [Hủy] ← Vẫn giữ nguyên
   
3. OWNER NHẤN "XÁC NHẬN"
   ↓
   Status: Confirmed (Đã xác nhận)
   isPaid: true/false (tùy khách đã TT chưa)
   Nút: [Hoàn thành] [Hủy]
   
4. KHÁCH CHECK-OUT → OWNER NHẤN "HOÀN THÀNH"
   ↓
   Status: Completed (Hoàn thành)
   isPaid: true (phải đã TT mới hoàn thành)
   Nút: (Không còn nút nào)

   -->