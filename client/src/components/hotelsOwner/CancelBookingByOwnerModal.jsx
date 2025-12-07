import { useState } from 'react';

const CancelBookingByOwnerModal = ({ isOpen, onClose, onConfirm, booking, loading }) => {
    const [reason, setReason] = useState('');

    const handleConfirm = () => {
        if (!reason.trim()) {
            return;
        }
        onConfirm(reason);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-red-500/20 via-orange-500/20 to-pink-500/20 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-slideUp border-2 border-white/50">
                {/* Header */}
                <div className="bg-gradient-to-r from-red-500 via-orange-500 to-pink-500 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white drop-shadow-md">⚠️ Hủy đặt phòng</h2>
                                <p className="text-white text-opacity-90 text-sm">Hủy đặt phòng với tư cách chủ khách sạn</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-xl transition-all disabled:opacity-50 hover:rotate-90 duration-300"
                        >
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                    {/* Booking Info */}
                    {booking && (
                        <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-5 space-y-3 border border-gray-200 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-lg">
                                <span>📋</span> Thông tin đặt phòng
                            </h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="bg-white rounded-xl p-3 shadow-sm">
                                    <p className="text-gray-600 text-xs mb-1">👤 Khách hàng</p>
                                    <p className="font-semibold text-gray-900">{booking.user?.username}</p>
                                </div>
                                <div className="bg-white rounded-xl p-3 shadow-sm">
                                    <p className="text-gray-600 text-xs mb-1">📧 Email</p>
                                    <p className="font-semibold text-gray-900 truncate">{booking.user?.email}</p>
                                </div>
                                <div className="bg-white rounded-xl p-3 shadow-sm">
                                    <p className="text-gray-600 text-xs mb-1">🏠 Loại phòng</p>
                                    <p className="font-semibold text-gray-900">{booking.room?.roomType}</p>
                                </div>
                                <div className="bg-white rounded-xl p-3 shadow-sm">
                                    <p className="text-gray-600 text-xs mb-1">👥 Số khách</p>
                                    <p className="font-semibold text-gray-900">{booking.guests}</p>
                                </div>
                                <div className="bg-white rounded-xl p-3 shadow-sm">
                                    <p className="text-gray-600 text-xs mb-1">📅 Ngày nhận phòng</p>
                                    <p className="font-semibold text-gray-900">
                                        {new Date(booking.checkInDate).toLocaleDateString('vi-VN')}
                                    </p>
                                </div>
                                <div className="bg-white rounded-xl p-3 shadow-sm">
                                    <p className="text-gray-600 text-xs mb-1">📅 Ngày trả phòng</p>
                                    <p className="font-semibold text-gray-900">
                                        {new Date(booking.checkOutDate).toLocaleDateString('vi-VN')}
                                    </p>
                                </div>
                                <div className="bg-white rounded-xl p-3 shadow-sm">
                                    <p className="text-gray-600 text-xs mb-1">💰 Tổng tiền</p>
                                    <p className="font-bold text-green-600 text-lg">
                                        ${booking.totalPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </p>
                                </div>
                                <div className="bg-white rounded-xl p-3 shadow-sm">
                                    <p className="text-gray-600 text-xs mb-1">💳 Thanh toán</p>
                                    <p className={`font-semibold ${booking.isPaid ? 'text-green-600' : 'text-orange-600'}`}>
                                        {booking.isPaid ? '✅ Đã thanh toán' : '⏳ Chưa thanh toán'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Owner Cancellation Policy */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border-2 border-green-300 shadow-sm">
                        <h3 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Chính sách hoàn tiền
                        </h3>
                        <p className="text-sm text-green-800 leading-relaxed">
                            Khi chủ khách sạn hủy đặt phòng, khách hàng sẽ được hoàn <strong className="text-green-900 text-base">100%</strong> số tiền đã thanh toán (nếu có).
                        </p>
                    </div>

                    {/* Refund Info */}
                    {booking?.isPaid && (
                        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-5 border-2 border-blue-300 shadow-lg">
                            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                💵 Số tiền hoàn cho khách
                            </h3>
                            <div className="flex items-baseline gap-2 mb-3">
                                <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    ${booking.totalPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                                <span className="text-xl font-bold text-green-600">
                                    (100%)
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 bg-white/60 rounded-lg p-2">
                                ⏰ Số tiền hoàn sẽ được xử lý trong vòng <strong>5-7 ngày làm việc</strong>
                            </p>
                        </div>
                    )}

                    {/* Reason Input - REQUIRED */}
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-5 border-2 border-orange-200">
                        <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                            ✍️ Lý do hủy <span className="text-red-500 text-lg">*</span>
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Vui lòng nhập lý do hủy đặt phòng (bắt buộc)..."
                            rows={4}
                            disabled={loading}
                            className="w-full px-4 py-3 border-2 border-orange-300 rounded-xl focus:ring-4 focus:ring-red-200 focus:border-red-400 resize-none disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200 bg-white shadow-inner"
                        />
                        {!reason.trim() && (
                            <p className="text-sm text-red-600 mt-2 flex items-center gap-1 font-medium">
                                <span>⚠️</span> Lý do hủy là bắt buộc
                            </p>
                        )}
                    </div>

                    {/* Warning */}
                    <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-2xl p-5 shadow-sm">
                        <div className="flex gap-3">
                            <svg className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <div className="text-sm text-yellow-900">
                                <p className="font-bold mb-2 text-base">⚡ Lưu ý quan trọng:</p>
                                <ul className="space-y-2">
                                    <li className="flex items-start gap-2">
                                        <span className="text-yellow-600 mt-0.5">📧</span>
                                        <span>Khách hàng sẽ nhận được email thông báo hủy</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-yellow-600 mt-0.5">💰</span>
                                        <span>Khách hàng sẽ được hoàn 100% nếu đã thanh toán</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-yellow-600 mt-0.5">⛔</span>
                                        <span className="font-semibold">Hành động này không thể hoàn tác</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-t-2 border-gray-200 flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transform hover:scale-105 duration-200"
                    >
                        ◀️ Quay lại
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={loading || !reason.trim()}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 via-orange-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:via-orange-700 hover:to-pink-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 duration-200"
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

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
                .animate-slideUp {
                    animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
            `}</style>
        </div>
    );
};

export default CancelBookingByOwnerModal;