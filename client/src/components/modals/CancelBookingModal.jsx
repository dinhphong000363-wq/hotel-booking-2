import React, { useState, useEffect } from 'react';
import { translateRoomType } from '../../utils/translations';

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
        <div className="fixed inset-0 backdrop-blur-sm bg-white/20 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-100">
                {/* Header */}
                <div className="bg-gradient-to-br from-red-500 via-orange-500 to-pink-500 p-8 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3.5 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-white drop-shadow-lg">Hủy đặt phòng</h2>
                                <p className="text-white/90 text-sm mt-1">Xác nhận hủy đặt phòng của bạn</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="p-2.5 hover:bg-white/20 rounded-xl transition-all duration-200 disabled:opacity-50 backdrop-blur-sm"
                        >
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    {/* Booking Info */}
                    {booking && (
                        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-5 space-y-4 border border-blue-100 shadow-sm">
                            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                <div className="w-1.5 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
                                Thông tin đặt phòng
                            </h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="bg-white/60 backdrop-blur-sm p-3 rounded-xl">
                                    <p className="text-gray-600 text-xs mb-1">Khách sạn</p>
                                    <p className="font-semibold text-gray-900">{booking.hotel?.name}</p>
                                </div>
                                <div className="bg-white/60 backdrop-blur-sm p-3 rounded-xl">
                                    <p className="text-gray-600 text-xs mb-1">Loại phòng</p>
                                    <p className="font-semibold text-gray-900">{translateRoomType(booking.room?.roomType)}</p>
                                </div>
                                <div className="bg-white/60 backdrop-blur-sm p-3 rounded-xl">
                                    <p className="text-gray-600 text-xs mb-1">Ngày nhận phòng</p>
                                    <p className="font-semibold text-gray-900">
                                        {new Date(booking.checkInDate).toLocaleDateString('vi-VN')}
                                    </p>
                                </div>
                                <div className="bg-white/60 backdrop-blur-sm p-3 rounded-xl">
                                    <p className="text-gray-600 text-xs mb-1">Ngày trả phòng</p>
                                    <p className="font-semibold text-gray-900">
                                        {new Date(booking.checkOutDate).toLocaleDateString('vi-VN')}
                                    </p>
                                </div>
                                <div className="bg-white/60 backdrop-blur-sm p-3 rounded-xl">
                                    <p className="text-gray-600 text-xs mb-1">Tổng tiền</p>
                                    <p className="font-bold text-gray-900 text-lg">
                                        ${booking.totalPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </p>
                                </div>
                                <div className="bg-white/60 backdrop-blur-sm p-3 rounded-xl">
                                    <p className="text-gray-600 text-xs mb-1">Trạng thái thanh toán</p>
                                    <p className={`font-semibold ${booking.isPaid ? 'text-green-600' : 'text-orange-600'}`}>
                                        {booking.isPaid ? '✓ Đã thanh toán' : '○ Chưa thanh toán'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Cancellation Policy */}
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 border border-blue-200 shadow-sm">
                        <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2 text-lg">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Chính sách hủy phòng
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3 bg-white/60 backdrop-blur-sm p-3 rounded-xl">
                                <span className="text-green-600 text-xl flex-shrink-0">✓</span>
                                <span className="text-sm text-gray-700">Hủy trước <strong className="text-green-700">7 ngày (168 giờ)</strong>: Hoàn <strong className="text-green-700">100%</strong></span>
                            </div>
                            <div className="flex items-start gap-3 bg-white/60 backdrop-blur-sm p-3 rounded-xl">
                                <span className="text-yellow-600 text-xl flex-shrink-0">✓</span>
                                <span className="text-sm text-gray-700">Hủy trước <strong className="text-yellow-700">3 ngày (72 giờ)</strong>: Hoàn <strong className="text-yellow-700">50%</strong></span>
                            </div>
                            <div className="flex items-start gap-3 bg-white/60 backdrop-blur-sm p-3 rounded-xl">
                                <span className="text-orange-600 text-xl flex-shrink-0">✓</span>
                                <span className="text-sm text-gray-700">Hủy trước <strong className="text-orange-700">1 ngày (24 giờ)</strong>: Hoàn <strong className="text-orange-700">25%</strong></span>
                            </div>
                            <div className="flex items-start gap-3 bg-white/60 backdrop-blur-sm p-3 rounded-xl">
                                <span className="text-red-600 text-xl flex-shrink-0">✗</span>
                                <span className="text-sm text-gray-700">Hủy trong ngày check-in: <strong className="text-red-700">Không hoàn (0%)</strong></span>
                            </div>
                        </div>
                    </div>

                    {/* Refund Info */}
                    <div className={`rounded-2xl p-6 border-2 shadow-lg ${refundInfo.percentage >= 100 ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300' :
                        refundInfo.percentage >= 50 ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-300' :
                            refundInfo.percentage >= 25 ? 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-300' :
                                'bg-gradient-to-br from-red-50 to-pink-50 border-red-300'
                        }`}>
                        <h3 className="font-bold text-gray-900 mb-3 text-lg">Số tiền được hoàn</h3>
                        <div className="flex items-baseline gap-3">
                            <span className="text-4xl font-bold text-gray-900">
                                ${refundInfo.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <span className={`text-2xl font-bold px-3 py-1 rounded-lg ${refundInfo.percentage >= 100 ? 'bg-green-600 text-white' :
                                refundInfo.percentage >= 50 ? 'bg-yellow-600 text-white' :
                                    refundInfo.percentage >= 25 ? 'bg-orange-600 text-white' :
                                        'bg-red-600 text-white'
                                }`}>
                                {refundInfo.percentage}%
                            </span>
                        </div>
                        {!booking?.isPaid && (
                            <p className="text-sm text-gray-600 mt-3 bg-white/50 p-2 rounded-lg">
                                * Bạn chưa thanh toán nên không có giao dịch hoàn tiền
                            </p>
                        )}
                        {booking?.isPaid && refundInfo.amount > 0 && (
                            <p className="text-sm text-gray-600 mt-3 bg-white/50 p-2 rounded-lg">
                                * Số tiền hoàn sẽ được xử lý trong vòng 5-7 ngày làm việc
                            </p>
                        )}
                    </div>

                    {/* Reason Input */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Lý do hủy (không bắt buộc)
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Nhập lý do hủy đặt phòng của bạn..."
                            rows={4}
                            disabled={loading}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200"
                        />
                    </div>

                    {/* Warning */}
                    <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-2xl p-4 flex gap-3 shadow-sm">
                        <svg className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div className="text-sm text-yellow-800">
                            <p className="font-bold mb-1">Lưu ý quan trọng:</p>
                            <p>Sau khi xác nhận hủy, bạn không thể hoàn tác hành động này. Vui lòng kiểm tra kỹ thông tin trước khi tiếp tục.</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 border-t-2 border-gray-200 flex gap-4">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 px-6 py-3.5 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                        Quay lại
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={loading}
                        className="flex-1 px-6 py-3.5 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl hover:from-red-700 hover:to-orange-700 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
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