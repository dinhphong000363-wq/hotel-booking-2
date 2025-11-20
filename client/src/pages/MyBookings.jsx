import React, { useEffect, useState } from 'react';
import Title from '../components/Title';
import { assets } from '../assets/assets';
import { useAppContext } from '../conext/AppContext';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';
import { translateRoomType, translatePaymentStatus, translatePaymentMethod, translateBookingStatus } from '../utils/translations';

const MyBookings = () => {
    const { axios, getToken, user, currency } = useAppContext();
    const [booking, setBookings] = useState([]);
    const [deleteConfirm, setDeleteConfirm] = useState(null); // { bookingId, hotelName }
    const [deleting, setDeleting] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchUserBookings = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/api/bookings/user', {
                headers: {
                    Authorization: `Bearer ${await getToken()}`,
                },
            });

            if (data.success) {
                setBookings(data.bookings);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message || 'Có lỗi xảy ra khi tải danh sách đặt phòng');
        } finally {
            setLoading(false);
        }
    };
    const handlePayment = async (bookingId) => {
        try {
            const { data } = await axios.post('api/bookings/stripe-payment', { bookingId },
                { headers: { Authorization: `Bearer ${await getToken()}` } })
            if (data.success) {
                window.location.href = data.url
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message || 'Có lỗi xảy ra khi xử lý thanh toán')
        }
    }

    // Mở modal xác nhận xóa
    const handleDeleteClick = (booking) => {
        setDeleteConfirm({
            bookingId: booking._id,
            hotelName: booking.hotel?.name || 'Khách sạn chưa xác định'
        });
    }

    // Đóng modal xác nhận xóa
    const handleCloseDeleteConfirm = () => {
        setDeleteConfirm(null);
    }

    // Xóa đơn đặt phòng
    const handleDelete = async () => {
        if (!deleteConfirm) return;

        setDeleting(true);
        try {
            const { data } = await axios.delete(`/api/bookings/${deleteConfirm.bookingId}`, {
                headers: {
                    Authorization: `Bearer ${await getToken()}`,
                },
            });

            if (data.success) {
                toast.success('Đã xóa đơn đặt phòng thành công');
                handleCloseDeleteConfirm();
                // Cập nhật danh sách bookings sau khi xóa
                setBookings(booking.filter(b => b._id !== deleteConfirm.bookingId));
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Không thể xóa đơn đặt phòng');
        } finally {
            setDeleting(false);
        }
    }

    useEffect(() => {
        if (user) {
            fetchUserBookings();
        }
    }, [user]);

    // Fetch lại data mỗi khi component mount (khi quay lại từ thanh toán)
    useEffect(() => {
        if (user) {
            fetchUserBookings();
        }
    }, []);

    return (
        <div className="py-28 md:pb-35 md:pt-32 px-4 md:px-16 lg:px-24 xl:px-32">
            <Title
                title="Đặt phòng của tôi"
                subTitle="Dễ dàng quản lý các đặt phòng khách sạn trước đây, hiện tại và sắp tới của bạn tại một nơi. Lên kế hoạch cho chuyến đi của bạn một cách liền mạch chỉ với vài cú nhấp chuột."
                align="left"
            />

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-primary"></div>
                </div>
            ) : (
                <div className="max-w-6xl mt-8 w-full text-gray-800">
                    <div className="hidden md:grid md:grid-cols-[3fr_2fr_1fr] w-full border-b border-gray-300 font-medium text-base py-3">
                        <div className="w-1/3">Khách sạn</div>
                        <div className="w-1/3">Ngày & Giờ</div>
                        <div className="w-1/3">Thanh toán</div>
                    </div>

                    {booking.map((booking) => (
                        <div
                            key={booking._id}
                            className="grid grid-cols-1 md:grid-cols-[3fr_2fr_1fr] w-full border-b border-gray-300 py-6 first:border-t"
                        >
                            {/* Hotel Details */}
                            <div className="flex flex-col md:flex-row">
                                <img
                                    src={booking.room?.images?.[0] || assets.noImage}
                                    alt="hotel-img"
                                    className="w-full md:w-44 rounded shadow object-cover"
                                />

                                <div className="flex flex-col gap-1.5 mt-3 md:mt-0 md:ml-4">
                                    <p className="font-playfair text-2xl">
                                        {booking.hotel?.name || 'Khách sạn chưa xác định'}
                                        <span className="font-inter text-sm text-gray-600">
                                            ({translateRoomType(booking.room?.roomType) || 'Loại phòng chưa rõ'})
                                        </span>
                                    </p>

                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                        <img
                                            src={assets.locationIcon}
                                            alt="location-icon"
                                            className="w-4 h-4"
                                        />
                                        <span>{booking.hotel?.address || 'Chưa có địa chỉ'}</span>
                                    </div>

                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                        <img
                                            src={assets.guestsIcon}
                                            alt="guests-icon"
                                            className="w-4 h-4"
                                        />
                                        <span>Số khách: {booking.guests || 0}</span>
                                    </div>

                                    <p className="text-base">Tổng cộng: {currency}{Number(booking.totalPrice || 0).toLocaleString('vi-VN')}</p>
                                </div>
                            </div>

                            {/* date */}
                            <div className="flex flex-row items-start md:items-center gap-8 md:gap-12 mt-3">
                                <div>
                                    <p className="font-medium">Ngày nhận phòng:</p>
                                    <p className="text-gray-500 text-sm">
                                        {booking.checkInDate
                                            ? new Date(booking.checkInDate).toLocaleDateString('vi-VN')
                                            : 'Không có dữ liệu'}
                                    </p>
                                </div>
                                <div>
                                    <p className="font-medium">Ngày trả phòng:</p>
                                    <p className="text-gray-500 text-sm">
                                        {booking.checkOutDate
                                            ? new Date(booking.checkOutDate).toLocaleDateString('vi-VN')
                                            : 'Không có dữ liệu'}
                                    </p>
                                </div>
                            </div>

                            {/* payment */}
                            <div className="flex flex-col items-start justify-center pt-3 gap-2">
                                <div className="flex items-center gap-2">
                                    <div
                                        className={`h-3 w-3 rounded-full ${booking.isPaid ? 'bg-green-500' : 'bg-red-500'
                                            }`}
                                    ></div>
                                    <p
                                        className={`text-sm ${booking.isPaid ? 'text-green-500' : 'text-red-500'
                                            }`}
                                    >
                                        {translatePaymentStatus(booking.isPaid)}
                                    </p>
                                </div>
                                {!booking.isPaid && (
                                    <button onClick={() => handlePayment(booking._id)} className="px-4 py-1.5 text-xs border border-gray-400 rounded-full hover:bg-gray-50 transition-all cursor-pointer">
                                        Thanh toán ngay
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDeleteClick(booking)}
                                    className="px-4 py-1.5 text-xs border border-red-400 text-red-600 rounded-full hover:bg-red-50 transition-all cursor-pointer"
                                >
                                    Xóa đơn
                                </button>
                                <p className="text-xs text-gray-500">
                                    Phương thức: {translatePaymentMethod(booking.paymentMethod) || 'Chưa xác định'}
                                </p>
                                <p className="text-xs text-gray-500">
                                    Trạng thái: {translateBookingStatus(booking.status)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal xác nhận xóa */}
            <ConfirmModal
                isOpen={!!deleteConfirm}
                onClose={handleCloseDeleteConfirm}
                onConfirm={handleDelete}
                title="Xác nhận xóa đơn đặt phòng"
                message={`Bạn có chắc chắn muốn xóa đơn đặt phòng tại ${deleteConfirm?.hotelName || ''}? Hành động này không thể hoàn tác.`}
                confirmText="Xóa đơn"
                variant="info"
                loading={deleting}
                highlightText={deleteConfirm?.hotelName}
            />
        </div>
    );
};

export default MyBookings;
