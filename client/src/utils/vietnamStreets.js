// Dữ liệu đường phố phổ biến cho các quận/huyện ở Việt Nam
export const streets = {
  "Hà Nội": {
    "Quận Ba Đình": [
      "Điện Biên Phủ",
      "Hoàng Diệu",
      "Phan Đình Phùng",
      "Láng Hạ",
      "Giảng Võ",
      "Đội Cấn",
      "Nguyễn Trãi",
      "Kim Mã",
      "Liễu Giai",
      "Đào Tấn"
    ],
    "Quận Hoàn Kiếm": [
      "Hàng Bông",
      "Hàng Gai",
      "Hàng Đào",
      "Hàng Ngang",
      "Hàng Đường",
      "Lý Thái Tổ",
      "Tràng Tiền",
      "Hàng Bài",
      "Đinh Tiên Hoàng",
      "Lê Thái Tổ"
    ],
    "Quận Cầu Giấy": [
      "Nguyễn Phong Sắc",
      "Hoàng Quốc Việt",
      "Phạm Hùng",
      "Trần Duy Hưng",
      "Dịch Vọng",
      "Xuân Thủy",
      "Cầu Giấy",
      "Mỹ Đình",
      "Phạm Văn Đồng",
      "Láng Thượng"
    ],
    "Quận Đống Đa": [
      "Tôn Đức Thắng",
      "Láng",
      "Khâm Thiên",
      "Tây Sơn",
      "Nguyễn Lương Bằng",
      "Giải Phóng",
      "Láng Hạ",
      "Chùa Bộc",
      "Thái Hà",
      "Đê La Thành"
    ],
    "Quận Hai Bà Trưng": [
      "Bạch Mai",
      "Minh Khai",
      "Lê Duẩn",
      "Trần Khát Chân",
      "Đại Cồ Việt",
      "Nguyễn Du",
      "Bùi Thị Xuân",
      "Hai Bà Trưng",
      "Lê Đại Hành",
      "Phố Huế"
    ]
  },
  "Hồ Chí Minh": {
    "Quận 1": [
      "Nguyễn Huệ",
      "Đồng Khởi",
      "Lê Lợi",
      "Nguyễn Du",
      "Pasteur",
      "Điện Biên Phủ",
      "Hai Bà Trưng",
      "Lý Tự Trọng",
      "Đinh Tiên Hoàng",
      "Nguyễn Thị Minh Khai"
    ],
    "Quận 3": [
      "Võ Văn Tần",
      "Nguyễn Đình Chiểu",
      "Cách Mạng Tháng 8",
      "Lý Chính Thắng",
      "Nguyễn Văn Trỗi",
      "Lê Văn Sỹ",
      "Hoàng Văn Thụ",
      "Điện Biên Phủ",
      "Nguyễn Thị Minh Khai",
      "Trần Quốc Thảo"
    ],
    "Quận 7": [
      "Nguyễn Thị Thập",
      "Nguyễn Lương Bằng",
      "Huỳnh Tấn Phát",
      "Nguyễn Văn Linh",
      "Lê Văn Lương",
      "Phạm Hữu Lầu",
      "Tôn Dật Tiên",
      "Đường số 1",
      "Đường số 2",
      "Đường số 3"
    ],
    "Quận Bình Thạnh": [
      "Xô Viết Nghệ Tĩnh",
      "Bạch Đằng",
      "Điện Biên Phủ",
      "Nguyễn Xí",
      "Lê Quang Định",
      "Phan Đăng Lưu",
      "Đinh Bộ Lĩnh",
      "Nguyễn Hữu Cảnh",
      "Bùi Đình Túy",
      "Phạm Văn Đồng"
    ]
  },
  "Đà Nẵng": {
    "Quận Hải Châu": [
      "Bạch Đằng",
      "Trần Phú",
      "Lê Duẩn",
      "Nguyễn Văn Linh",
      "Phan Đăng Lưu",
      "Điện Biên Phủ",
      "Hoàng Diệu",
      "Lý Tự Trọng",
      "Nguyễn Chí Thanh",
      "Lê Đình Dương"
    ],
    "Quận Thanh Khê": [
      "Điện Biên Phủ",
      "Nguyễn Văn Linh",
      "Lê Đình Dương",
      "Tôn Đức Thắng",
      "Nguyễn Lương Bằng",
      "Lê Duẩn",
      "Trần Cao Vân",
      "Nguyễn Văn Thoại",
      "Đống Đa",
      "Hải Hồ"
    ]
  },
  "Hải Phòng": {
    "Quận Hồng Bàng": [
      "Lạch Tray",
      "Điện Biên Phủ",
      "Trần Phú",
      "Lý Tự Trọng",
      "Máy Chai",
      "Bạch Đằng",
      "Lê Lợi",
      "Nguyễn Đức Cảnh",
      "Hoàng Văn Thụ",
      "Trần Hưng Đạo"
    ],
    "Quận Ngô Quyền": [
      "Lạch Tray",
      "Điện Biên Phủ",
      "Trần Phú",
      "Lý Tự Trọng",
      "Bạch Đằng",
      "Lê Lợi",
      "Hoàng Văn Thụ",
      "Nguyễn Đức Cảnh",
      "Trần Hưng Đạo",
      "Lạch Tray"
    ]
  }
};

// Số nhà phổ biến (có thể mở rộng)
export const houseNumbers = Array.from({ length: 500 }, (_, i) => (i + 1).toString());

