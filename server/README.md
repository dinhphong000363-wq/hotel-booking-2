# hotel_bookinh
# hotel-booking



http://localhost:3000

<!-- 
    git status
    git add .
    git commit -m "chỉnh sửa lại giao diện"
    git push origin main



 -->
 <!-- 
git commit -m "chỉnh sửa lại thư mục, uodate giao diện, validate một số thứ,.."
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