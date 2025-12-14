import { useState } from 'react';

const PaymentMethodModal = ({ isOpen, onClose, onSelectMethod, bookingId, loading }) => {
    const [selectedMethod, setSelectedMethod] = useState(null);

    if (!isOpen) return null;

    const paymentMethods = [
        {
            id: 'stripe',
            name: 'Stripe',
            description: 'Thanh toán bằng thẻ quốc tế',
            icon: '💳',
            gradient: 'from-blue-500 to-indigo-600',
            bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-50',
            borderColor: 'border-blue-200',
            iconBg: 'bg-blue-100'
        },
        {
            id: 'momo',
            name: 'MoMo',
            description: 'Thanh toán qua ví MoMo',
            icon: '🎀',
            gradient: 'from-pink-500 to-rose-600',
            bgColor: 'bg-gradient-to-br from-pink-50 to-rose-50',
            borderColor: 'border-pink-200',
            iconBg: 'bg-pink-100'
        },
        {
            id: 'pay-at-hotel',
            name: 'Thanh toán khi trả phòng',
            description: 'Thanh toán trực tiếp tại khách sạn',
            icon: '🏨',
            gradient: 'from-green-500 to-emerald-600',
            bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50',
            borderColor: 'border-green-200',
            iconBg: 'bg-green-100'
        }
    ];

    const handleConfirm = () => {
        if (selectedMethod) {
            onSelectMethod(selectedMethod, bookingId);
        }
    };

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-gray-900/60 via-gray-900/50 to-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-slideUp">
                {/* Header với Gradient */}
                <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-8 py-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">Phương thức thanh toán</h2>
                            <p className="text-blue-100 text-sm">Chọn cách thanh toán phù hợp với bạn</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all"
                            disabled={loading}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="p-8 space-y-4">
                    {paymentMethods.map((method) => (
                        <div
                            key={method.id}
                            onClick={() => setSelectedMethod(method.id)}
                            className={`relative border-2 rounded-2xl p-5 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${selectedMethod === method.id
                                ? `${method.bgColor} border-transparent shadow-lg ring-2 ring-offset-2 ring-${method.gradient.split('-')[1]}-500`
                                : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
                                }`}
                        >
                            {/* Checkmark Badge */}
                            {selectedMethod === method.id && (
                                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full p-1.5 shadow-lg">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}

                            <div className="flex items-center gap-4">
                                {/* Icon với Background */}
                                <div className={`${method.iconBg} w-16 h-16 rounded-xl flex items-center justify-center text-3xl shadow-sm`}>
                                    {method.icon}
                                </div>

                                <div className="flex-1">
                                    <p className="font-bold text-gray-900 text-lg mb-0.5">{method.name}</p>
                                    <p className="text-sm text-gray-600">{method.description}</p>
                                </div>

                                {/* Radio Button */}
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedMethod === method.id
                                    ? 'border-blue-600 bg-blue-600'
                                    : 'border-gray-300'
                                    }`}>
                                    {selectedMethod === method.id && (
                                        <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Info Box */}
                <div className="mx-8 mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-blue-800">
                        <p className="font-semibold mb-1">Thanh toán an toàn & bảo mật</p>
                        <p className="text-blue-700">Thông tin của bạn được mã hóa và bảo vệ tuyệt đối</p>
                    </div>
                </div>

                {/* Buttons */}
                <div className="px-8 pb-8 flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!selectedMethod || loading}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                Đang xử lý...
                            </>
                        ) : (
                            <>
                                Xác nhận thanh toán
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </>
                        )}
                    </button>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
                
                .animate-slideUp {
                    animation: slideUp 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default PaymentMethodModal;