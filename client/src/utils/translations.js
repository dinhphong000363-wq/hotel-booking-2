export const amenityLabels = {
    'Free WiFi': 'Wi-Fi miễn phí',
    'Free Breakfast': 'Bữa sáng miễn phí',
    'Room Service': 'Dịch vụ phòng',
    'Mountain View': 'Tầm nhìn ra núi',
    'Pool Access': 'Lối vào hồ bơi',
    'Clean & Safe Stay': 'Lưu trú sạch sẽ & an toàn',
    'Enhanced Cleaning': 'Vệ sinh tăng cường',
    'Excellent Location': 'Vị trí tuyệt vời',
    'Smooth Check-In': 'Nhận phòng nhanh chóng',
};

export const roomTypeLabels = {
    'Single Bed': 'Phòng một giường',
    'Double Bed': 'Phòng giường đôi',
    'Luxury Room': 'Phòng cao cấp',
    'Family Suite': 'Phòng gia đình',
};

export const bookingStatusLabels = {
    pending: 'Đang chờ xử lý',
    confirmed: 'Đã xác nhận',
    cancelled: 'Đã hủy',
    completed: 'Hoàn thành',
};

export const paymentMethodLabels = {
    Stripe: 'Stripe',
    'Pay At Hotel': 'Thanh toán tại khách sạn',
};

export const translateAmenity = (value) => amenityLabels[value] || value;

export const translateRoomType = (value) => roomTypeLabels[value] || value;

export const translateBookingStatus = (value) =>
    bookingStatusLabels[value] || value;

export const translatePaymentStatus = (isPaid) =>
    isPaid ? 'Đã thanh toán' : 'Chưa thanh toán';

export const translatePaymentMethod = (method) =>
    paymentMethodLabels[method] || method;

