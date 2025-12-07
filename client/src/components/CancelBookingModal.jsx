import React, { useState, useEffect } from 'react';

const CancelBookingModal = ({ isOpen, onClose, onConfirm, booking, loading }) => {
    const [reason, setReason] = useState('');
    const [refundInfo, setRefundInfo] = useState({ percentage: 0, amount: 0 });

    useEffect(() => {
        if (booking && isOpen) {
            calculateRefund();
        }
    }, [booking, isOpen]);

    const calculateRefund = () => {
        if (!booking) return;

        const now = new Date();
        const checkInDate = new Date(booking.checkInDate);
        const hoursUntilCheckIn = (checkInDate - now) / (1000 * 60 * 60);

        let percentage = 0;
        if (hoursUntilCheckIn >= 168) { // 7 ngày
            percentage = 100;
        } else if (hoursUntilCheckIn >= 72) { // 3 ngày
            percentage = 50;
        } else if (hoursUntilCheckIn >= 24) { // 1 ngày
            percentage = 25;
        } else {
            percentage = 0;
        }

        const amount = booking.isPaid ? (booking.totalPrice * percentage) / 100 : 0;
        setRefundInfo({ percentage, amount });
    };

    const handleConfirm = () => {
        onConfirm(reason);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Hủy đặt phòng</h2>
                                <p className="text-white text-opacity-90 text-sm">Xác nhận hủy đặt phòng của bạn</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all disabled:opacity-50"
                        >
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Booking Info */}
                    {booking && (
                        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                            <h3 className="font-semibold text-gray-900 mb-3">Thông tin đặt phòng</h3>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <p className="text-gray-600">Khách sạn</p>
                                    <p className="font-medium text-gray-900">{booking.hotel?.name}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Loại phòng</p>
                                    <p className="font-medium text-gray-900">{booking.room?.roomType}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Ngày nhận phòng</p>
                                    <p className="font-medium text-gray-900">
                                        {new Date(booking.checkInDate).toLocaleDateString('vi-VN')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Ngày trả phòng</p>
                                    <p className="font-medium text-gray-900">
                                        {new Date(booking.checkOutDate).toLocaleDateString('vi-VN')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Tổng tiền</p>
                                    <p className="font-medium text-gray-900">
                                        ${booking.totalPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Trạng thái thanh toán</p>
                                    <p className="font-medium text-gray-900">
                                        {booking.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Cancellation Policy */}
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Chính sách hủy phòng
                        </h3>
                        <ul className="space-y-2 text-sm text-blue-800">
                            <li className="flex items-start gap-2">
                                <span className="text-green-600 mt-0.5">✓</span>
                                <span>Hủy trước 7 ngày (168 giờ): Hoàn <strong>100%</strong></span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-yellow-600 mt-0.5">✓</span>
                                <span>Hủy trước 3 ngày (72 giờ): Hoàn <strong>50%</strong></span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-orange-600 mt-0.5">✓</span>
                                <span>Hủy trước 1 ngày (24 giờ): Hoàn <strong>25%</strong></span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-red-600 mt-0.5">✗</span>
                                <span>Hủy trong ngày check-in: <strong>Không hoàn (0%)</strong></span>
                            </li>
                        </ul>
                    </div>

                    {/* Refund Info */}
                    <div className={`rounded-xl p-4 border-2 ${refundInfo.percentage >= 100 ? 'bg-green-50 border-green-300' :
                        refundInfo.percentage >= 50 ? 'bg-yellow-50 border-yellow-300' :
                            refundInfo.percentage >= 25 ? 'bg-orange-50 border-orange-300' :
                                'bg-red-50 border-red-300'
                        }`}>
                        <h3 className="font-semibold text-gray-900 mb-2">Số tiền được hoàn</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-gray-900">
                                ${refundInfo.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <span className={`text-lg font-semibold ${refundInfo.percentage >= 100 ? 'text-green-600' :
                                refundInfo.percentage >= 50 ? 'text-yellow-600' :
                                    refundInfo.percentage >= 25 ? 'text-orange-600' :
                                        'text-red-600'
                                }`}>
                                ({refundInfo.percentage}%)
                            </span>
                        </div>
                        {!booking?.isPaid && (
                            <p className="text-sm text-gray-600 mt-2">
                                * Bạn chưa thanh toán nên không có giao dịch hoàn tiền
                            </p>
                        )}
                        {booking?.isPaid && refundInfo.amount > 0 && (
                            <p className="text-sm text-gray-600 mt-2">
                                * Số tiền hoàn sẽ được xử lý trong vòng 5-7 ngày làm việc
                            </p>
                        )}
                    </div>

                    {/* Reason Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Lý do hủy (không bắt buộc)
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Nhập lý do hủy đặt phòng của bạn..."
                            rows={4}
                            disabled={loading}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                    </div>

                    {/* Warning */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex gap-3">
                        <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div className="text-sm text-yellow-800">
                            <p className="font-semibold mb-1">Lưu ý quan trọng:</p>
                            <p>Sau khi xác nhận hủy, bạn không thể hoàn tác hành động này. Vui lòng kiểm tra kỹ thông tin trước khi tiếp tục.</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 p-6 rounded-b-2xl flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Quay lại
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={loading}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl hover:from-red-700 hover:to-orange-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                <span>Đang xử lý...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Xác nhận hủy</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CancelBookingModal;
