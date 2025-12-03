import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const MoMoPayment = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const bookingId = searchParams.get('bookingId');
    const amount = searchParams.get('amount');

    const [phoneNumber, setPhoneNumber] = useState('');
    const [processing, setProcessing] = useState(false);
    const [step, setStep] = useState(1); // 1: nhập SĐT, 2: xác nhận OTP
    const [initialLoading, setInitialLoading] = useState(true);

    // Số tiền đã là USD, chuyển sang VNĐ (tỷ giá: 1 USD = 24,000 VNĐ)
    const amountInVND = amount ? (Number(amount) * 24000).toFixed(0) : '0';
    const amountInUSD = amount ? Number(amount).toFixed(2) : '0.00';

    useEffect(() => {
        if (!bookingId) {
            toast.error('Không tìm thấy thông tin đặt phòng');
            navigate('/my-bookings');
            return;
        }

        // Giả lập loading khi vào trang
        const timer = setTimeout(() => {
            setInitialLoading(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, [bookingId, navigate]);

    const handlePhoneChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/gi, '');
        if (value.length <= 10) {
            setPhoneNumber(value);
        }
    };

    const handleContinue = () => {
        if (phoneNumber.length !== 10) {
            toast.error('Vui lòng nhập số điện thoại hợp lệ (10 số)');
            return;
        }
        setStep(2);
    };

    const handleConfirmPayment = () => {
        setProcessing(true);

        // Giả lập xử lý thanh toán (2-3 giây)
        setTimeout(() => {
            toast.success('Thanh toán MoMo thành công!');

            // Loading thêm 1.5 giây trước khi chuyển trang
            setTimeout(() => {
                navigate(`/my-bookings?payment=success&bookingId=${bookingId}`);
            }, 1500);
        }, 2500);
    };

    const handleCancel = () => {
        navigate(-1); // Quay về trang trước
    };

    // Loading screen khi vào trang
    if (initialLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-600 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Đang tải trang thanh toán...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100 py-12 px-4">
            <div className="max-w-md mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full mb-4">
                        <span className="text-3xl">🎀</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Thanh toán MoMo</h1>
                    <p className="text-gray-600">Thanh toán nhanh chóng và an toàn với ví MoMo</p>
                </div>

                {/* Payment Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {amount && (
                        <div className="mb-6 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200">
                            <p className="text-sm text-gray-600">Số tiền thanh toán</p>
                            <p className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                                {Number(amountInVND).toLocaleString('vi-VN')} VNĐ
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                ≈ ${amountInUSD} USD
                            </p>
                        </div>
                    )}

                    {step === 1 ? (
                        <div className="space-y-5">
                            {/* Phone Number Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Số điện thoại MoMo
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                                        +84
                                    </span>
                                    <input
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={handlePhoneChange}
                                        placeholder="912345678"
                                        className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                                        disabled={processing}
                                    />
                                </div>
                                <p className="mt-2 text-xs text-gray-500">
                                    Nhập số điện thoại đã đăng ký với ví MoMo
                                </p>
                            </div>

                            {/* Features */}
                            <div className="space-y-3 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <span className="text-sm text-gray-700">Thanh toán nhanh chóng</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <span className="text-sm text-gray-700">Bảo mật tuyệt đối</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <span className="text-sm text-gray-700">Hoàn tiền nếu có sự cố</span>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="button"
                                    onClick={handleContinue}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all"
                                >
                                    Tiếp tục
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {/* Confirmation */}
                            <div className="text-center py-4">
                                <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                                    <svg className="w-10 h-10 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">Xác nhận thanh toán</h3>
                                <p className="text-gray-600 mb-4">
                                    Mở ứng dụng MoMo trên điện thoại <span className="font-semibold">+84{phoneNumber}</span> để xác nhận giao dịch
                                </p>
                            </div>

                            {/* Transaction Details */}
                            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Số điện thoại</span>
                                    <span className="font-medium">+84{phoneNumber}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Số tiền</span>
                                    <span className="font-medium text-pink-600">{Number(amountInVND).toLocaleString('vi-VN')} VNĐ</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Nội dung</span>
                                    <span className="font-medium">Thanh toán đặt phòng</span>
                                </div>
                            </div>

                            {/* Demo Notice */}
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                <p className="text-xs text-yellow-800 text-center">
                                    🎭 Đây là giao diện demo - Nhấn "Xác nhận" để hoàn tất
                                </p>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    disabled={processing}
                                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50"
                                >
                                    Quay lại
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmPayment}
                                    disabled={processing}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {processing ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        'Xác nhận thanh toán'
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Demo Notice */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                        🎭 Đây là giao diện demo - Không có giao dịch thực tế
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MoMoPayment;
