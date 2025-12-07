import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { assets } from '../assets/assets';
import { useAppContext } from '../conext/AppContext';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';
import PaymentMethodModal from '../components/PaymentMethodModal';
import CancelBookingModal from '../components/CancelBookingModal';
import { translateRoomType, translatePaymentMethod, translateBookingStatus } from '../utils/translations';
import Footer from '../components/Footer';

const MyBookings = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { axios, getToken, user, currency } = useAppContext();
    const [booking, setBookings] = useState([]);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [paymentModal, setPaymentModal] = useState({ isOpen: false, bookingId: null, amount: null });
    const [processingPayment, setProcessingPayment] = useState(false);
    const [cancelModal, setCancelModal] = useState({ isOpen: false, booking: null });
    const [cancelling, setCancelling] = useState(false);

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

    const handlePaymentClick = (bookingItem) => {
        setPaymentModal({
            isOpen: true,
            bookingId: bookingItem._id,
            amount: bookingItem.totalPrice
        });
    };

    const handleSelectPaymentMethod = async (method, bookingId) => {
        setProcessingPayment(true);

        try {
            const bookingItem = booking.find(b => b._id === bookingId);

            if (method === 'stripe') {
                navigate(`/payment/stripe?bookingId=${bookingId}&amount=${bookingItem.totalPrice}`);
            } else if (method === 'momo') {
                navigate(`/payment/momo?bookingId=${bookingId}&amount=${bookingItem.totalPrice}`);
            } else if (method === 'pay-at-hotel') {
                const { data } = await axios.patch(
                    `/api/bookings/${bookingId}`,
                    { paymentMethod: 'pay-at-hotel' },
                    { headers: { Authorization: `Bearer ${await getToken()}` } }
                );

                if (data.success) {
                    toast.success('Đã chọn thanh toán khi trả phòng');
                    setPaymentModal({ isOpen: false, bookingId: null, amount: null });
                    fetchUserBookings();
                } else {
                    toast.error(data.message);
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setProcessingPayment(false);
        }
    };

    const handleCancelClick = (bookingItem) => {
        // Kiểm tra điều kiện hủy
        if (bookingItem.status === 'cancelled') {
            toast.error('Đặt phòng đã được hủy trước đó');
            return;
        }

        if (bookingItem.status === 'completed') {
            toast.error('Không thể hủy đặt phòng đã hoàn thành');
            return;
        }

        // Kiểm tra nếu đã quá ngày trả phòng
        const now = new Date();
        const checkOutDate = new Date(bookingItem.checkOutDate);

        if (now >= checkOutDate) {
            toast.error('Không thể hủy sau ngày trả phòng');
            return;
        }

        setCancelModal({ isOpen: true, booking: bookingItem });
    };

    const handleCloseCancelModal = () => {
        setCancelModal({ isOpen: false, booking: null });
    };

    const handleConfirmCancel = async (reason) => {
        if (!cancelModal.booking) return;

        setCancelling(true);
        try {
            const { data } = await axios.post(
                `/api/bookings/${cancelModal.booking._id}/cancel`,
                { cancellationReason: reason },
                {
                    headers: {
                        Authorization: `Bearer ${await getToken()}`,
                    },
                }
            );

            if (data.success) {
                toast.success(`Đã hủy đặt phòng thành công! Hoàn ${data.refundInfo.refundPercentage}%`);
                handleCloseCancelModal();
                fetchUserBookings();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Không thể hủy đặt phòng');
        } finally {
            setCancelling(false);
        }
    };

    const handleDeleteClick = (booking) => {
        setDeleteConfirm({
            bookingId: booking._id,
            hotelName: booking.hotel?.name || 'Khách sạn chưa xác định'
        });
    }

    const handleCloseDeleteConfirm = () => {
        setDeleteConfirm(null);
    }

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
            console.log('🔄 Fetching user bookings...');
            fetchUserBookings();
        }
    }, [user]);

    useEffect(() => {
        const paymentStatus = searchParams.get('payment');
        const bookingId = searchParams.get('bookingId');

        if (paymentStatus === 'success' && bookingId) {
            const updatePaymentStatus = async () => {
                try {
                    const { data } = await axios.patch(
                        `/api/bookings/${bookingId}`,
                        { isPaid: true },
                        { headers: { Authorization: `Bearer ${await getToken()}` } }
                    );

                    if (data.success) {
                        toast.success('Thanh toán thành công! 🎉');
                        fetchUserBookings();
                    }
                } catch (error) {
                    console.error('Error updating payment status:', error);
                }
            };

            updatePaymentStatus();
            navigate('/my-bookings', { replace: true });
        }
    }, [searchParams]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-28 md:pb-35 md:pt-32 px-4 md:px-16 lg:px-24 xl:px-32">
            {/* Header Section */}
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                                Đặt phòng của tôi
                            </h1>
                            <p className="text-gray-600 max-w-2xl">
                                Dễ dàng quản lý các đặt phòng khách sạn trước đây, hiện tại và sắp tới của bạn tại một nơi.
                                Lên kế hoạch cho chuyến đi của bạn một cách liền mạch chỉ với vài cú nhấp chuột.
                            </p>
                        </div>
                        <button
                            onClick={fetchUserBookings}
                            disabled={loading}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-blue-500/30 whitespace-nowrap"
                        >
                            <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Làm mới
                        </button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-600 rounded-lg">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-blue-900">{booking.length}</p>
                                    <p className="text-sm text-blue-700">Tổng đặt phòng</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-4 border border-green-200">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-green-600 rounded-lg">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-green-900">{booking.filter(b => b.isPaid).length}</p>
                                    <p className="text-sm text-green-700">Đã thanh toán</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-orange-50 to-amber-100 rounded-xl p-4 border border-orange-200">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-orange-600 rounded-lg">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-orange-900">{booking.filter(b => !b.isPaid).length}</p>
                                    <p className="text-sm text-orange-700">Chờ thanh toán</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="flex flex-col justify-center items-center h-96 bg-white rounded-2xl shadow-xl">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mb-4"></div>
                        <p className="text-gray-600 font-medium">Đang tải đặt phòng...</p>
                    </div>
                ) : booking.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Chưa có đặt phòng nào</h3>
                        <p className="text-gray-600 mb-6">Bắt đầu khám phá và đặt phòng khách sạn ngay hôm nay!</p>
                        <button
                            onClick={() => navigate('/rooms')}
                            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30"
                        >
                            Khám phá khách sạn
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {booking.map((bookingItem, index) => (
                            <div
                                key={bookingItem._id}
                                className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="flex flex-col lg:flex-row">
                                    {/* Image Section */}
                                    <div className="lg:w-80 relative overflow-hidden">
                                        <img
                                            src={bookingItem.room?.images?.[0] || assets.noImage}
                                            alt="hotel"
                                            className="w-full h-64 lg:h-full object-cover"
                                        />
                                        {/* Status Badges */}
                                        <div className="absolute top-4 right-4 space-y-2">
                                            {/* Booking Status Badge */}
                                            {bookingItem.status === 'cancelled' && (
                                                <div className="px-4 py-2 bg-red-500 text-white rounded-full text-sm font-semibold shadow-lg flex items-center gap-2">
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                    </svg>
                                                    Đã hủy
                                                </div>
                                            )}
                                            {/* Payment Status Badge */}
                                            {bookingItem.status !== 'cancelled' && (
                                                bookingItem.isPaid ? (
                                                    <div className="px-4 py-2 bg-green-500 text-white rounded-full text-sm font-semibold shadow-lg flex items-center gap-2">
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                        Đã thanh toán
                                                    </div>
                                                ) : (
                                                    <div className="px-4 py-2 bg-orange-500 text-white rounded-full text-sm font-semibold shadow-lg flex items-center gap-2">
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                                        </svg>
                                                        Chưa thanh toán
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>

                                    {/* Content Section */}
                                    <div className="flex-1 p-6 lg:p-8">
                                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                                            {/* Hotel Info */}
                                            <div className="flex-1">
                                                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                                                    {bookingItem.hotel?.name || 'Khách sạn chưa xác định'}
                                                </h2>
                                                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
                                                    {translateRoomType(bookingItem.room?.roomType) || 'Loại phòng chưa rõ'}
                                                </span>

                                                <div className="space-y-3 mb-4">
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        <span className="text-sm">{bookingItem.hotel?.address || 'Chưa có địa chỉ'}</span>
                                                    </div>

                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                        </svg>
                                                        <span className="text-sm">Số khách: {bookingItem.guests || 0}</span>
                                                    </div>
                                                </div>

                                                {/* Date Info */}
                                                <div className="grid grid-cols-2 gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                                                    <div>
                                                        <p className="text-xs text-gray-600 mb-1">Nhận phòng</p>
                                                        <p className="font-semibold text-gray-900">
                                                            {bookingItem.checkInDate
                                                                ? new Date(bookingItem.checkInDate).toLocaleDateString('vi-VN', {
                                                                    day: '2-digit',
                                                                    month: '2-digit',
                                                                    year: 'numeric'
                                                                })
                                                                : 'N/A'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-600 mb-1">Trả phòng</p>
                                                        <p className="font-semibold text-gray-900">
                                                            {bookingItem.checkOutDate
                                                                ? new Date(bookingItem.checkOutDate).toLocaleDateString('vi-VN', {
                                                                    day: '2-digit',
                                                                    month: '2-digit',
                                                                    year: 'numeric'
                                                                })
                                                                : 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions Section */}
                                            <div className="lg:w-72 space-y-4">
                                                {/* Price */}
                                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                                                    <p className="text-sm text-gray-600 mb-1">Tổng thanh toán</p>
                                                    <p className="text-3xl font-bold text-green-600">
                                                        {currency}{Number(bookingItem.totalPrice || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </p>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="space-y-2">
                                                    {bookingItem.status === 'cancelled' ? (
                                                        /* Cancelled Booking Info */
                                                        <>
                                                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-2">
                                                                <div className="flex items-center gap-2 text-red-700 font-semibold">
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                    </svg>
                                                                    Đặt phòng đã hủy
                                                                </div>
                                                                {bookingItem.cancelledAt && (
                                                                    <p className="text-sm text-red-600">
                                                                        Hủy lúc: {new Date(bookingItem.cancelledAt).toLocaleString('vi-VN')}
                                                                    </p>
                                                                )}
                                                                {bookingItem.refundAmount > 0 && (
                                                                    <p className="text-sm text-red-600">
                                                                        Hoàn: ${bookingItem.refundAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({bookingItem.refundPercentage}%)
                                                                    </p>
                                                                )}
                                                                {bookingItem.cancellationReason && (
                                                                    <p className="text-sm text-red-600">
                                                                        Lý do: {bookingItem.cancellationReason}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            {/* Delete button for cancelled bookings */}
                                                            <button
                                                                onClick={() => handleDeleteClick(bookingItem)}
                                                                className="w-full px-4 py-3 bg-white border-2 border-red-200 text-red-600 rounded-xl hover:bg-red-50 hover:border-red-300 transition-all font-semibold flex items-center justify-center gap-2"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                                Xóa đơn
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            {bookingItem.status === 'completed' ? (
                                                                /* Completed Booking - Only show delete button */
                                                                <>
                                                                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                                                        <div className="flex items-center gap-2 text-green-700 font-semibold">
                                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                            </svg>
                                                                            Đặt phòng đã hoàn thành
                                                                        </div>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => handleDeleteClick(bookingItem)}
                                                                        className="w-full px-4 py-3 bg-white border-2 border-red-200 text-red-600 rounded-xl hover:bg-red-50 hover:border-red-300 transition-all font-semibold flex items-center justify-center gap-2"
                                                                    >
                                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                        </svg>
                                                                        Xóa đơn
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                /* Active Bookings - Show payment, cancel, delete buttons */
                                                                <>
                                                                    {!bookingItem.isPaid && (
                                                                        <button
                                                                            onClick={() => handlePaymentClick(bookingItem)}
                                                                            className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
                                                                        >
                                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                                            </svg>
                                                                            Thanh toán ngay
                                                                        </button>
                                                                    )}
                                                                    <button
                                                                        onClick={() => handleCancelClick(bookingItem)}
                                                                        className="w-full px-4 py-3 bg-white border-2 border-orange-300 text-orange-600 rounded-xl hover:bg-orange-50 hover:border-orange-400 transition-all font-semibold flex items-center justify-center gap-2"
                                                                    >
                                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                        </svg>
                                                                        Hủy đặt phòng
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteClick(bookingItem)}
                                                                        className="w-full px-4 py-3 bg-white border-2 border-red-200 text-red-600 rounded-xl hover:bg-red-50 hover:border-red-300 transition-all font-semibold flex items-center justify-center gap-2"
                                                                    >
                                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                        </svg>
                                                                        Xóa đơn
                                                                    </button>
                                                                </>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modals */}
            <CancelBookingModal
                isOpen={cancelModal.isOpen}
                onClose={handleCloseCancelModal}
                onConfirm={handleConfirmCancel}
                booking={cancelModal.booking}
                loading={cancelling}
            />

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

            <PaymentMethodModal
                isOpen={paymentModal.isOpen}
                onClose={() => setPaymentModal({ isOpen: false, bookingId: null, amount: null })}
                onSelectMethod={handleSelectPaymentMethod}
                bookingId={paymentModal.bookingId}
                loading={processingPayment}
            />

            <Footer />
        </div>
    );
};

export default MyBookings;