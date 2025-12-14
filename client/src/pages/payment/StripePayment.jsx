import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const StripePayment = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const bookingId = searchParams.get('bookingId');
    const amount = searchParams.get('amount');

    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [processing, setProcessing] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    // Validation errors
    const [errors, setErrors] = useState({
        cardNumber: '',
        expiry: '',
        cvc: '',
        name: '',
        email: ''
    });

    // Số tiền đã là USD
    const amountInUSD = amount ? Number(amount).toFixed(2) : '0.00';
    // Chuyển đổi sang VNĐ để hiển thị (tỷ giá giả định: 1 USD = 24,000 VNĐ)
    const amountInVND = amount ? (Number(amount) * 24000).toFixed(0) : '0';

    useEffect(() => {
        if (!bookingId) {
            toast.error('Không tìm thấy thông tin đặt phòng');
            navigate('/my-bookings');
            return;
        }

        // Giả lập loading khi vào trang thanh toán
        const timer = setTimeout(() => {
            setInitialLoading(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, [bookingId, navigate]);

    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = (matches && matches[0]) || '';
        const parts = [];

        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }

        if (parts.length) {
            return parts.join(' ');
        } else {
            return value;
        }
    };

    const formatExpiry = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (v.length >= 2) {
            return v.slice(0, 2) + ' / ' + v.slice(2, 4);
        }
        return v;
    };

    const handleCardNumberChange = (e) => {
        const formatted = formatCardNumber(e.target.value);
        const digitsOnly = formatted.replace(/\s/g, '');

        if (digitsOnly.length <= 16) {
            setCardNumber(formatted);

            // Validate
            if (!digitsOnly) {
                setErrors(prev => ({ ...prev, cardNumber: 'Vui lòng nhập số thẻ' }));
            } else if (digitsOnly.length < 16) {
                setErrors(prev => ({ ...prev, cardNumber: 'Số thẻ phải có 16 số' }));
            } else if (!luhnCheck(digitsOnly)) {
                setErrors(prev => ({ ...prev, cardNumber: 'Số thẻ không hợp lệ' }));
            } else {
                setErrors(prev => ({ ...prev, cardNumber: '' }));
            }
        }
    };

    const handleExpiryChange = (e) => {
        const input = e.target.value;
        // Chỉ lấy số và loại bỏ ký tự khác
        const digitsOnly = input.replace(/[^0-9]/g, '');

        // Giới hạn tối đa 4 số
        const limitedDigits = digitsOnly.slice(0, 4);

        // Format với dấu /
        let formatted = limitedDigits;
        if (limitedDigits.length >= 2) {
            formatted = limitedDigits.slice(0, 2) + ' / ' + limitedDigits.slice(2);
        }

        setExpiry(formatted);

        // Validate
        if (!limitedDigits) {
            setErrors(prev => ({ ...prev, expiry: 'Vui lòng nhập ngày hết hạn' }));
        } else if (limitedDigits.length === 4) {
            const month = parseInt(limitedDigits.substring(0, 2));
            const year = parseInt('20' + limitedDigits.substring(2, 4));
            const now = new Date();
            const currentMonth = now.getMonth() + 1;
            const currentYear = now.getFullYear();

            if (month < 1 || month > 12) {
                setErrors(prev => ({ ...prev, expiry: 'Tháng phải từ 01-12' }));
            } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
                setErrors(prev => ({ ...prev, expiry: 'Thẻ đã hết hạn' }));
            } else {
                setErrors(prev => ({ ...prev, expiry: '' }));
            }
        } else if (limitedDigits.length > 0) {
            setErrors(prev => ({ ...prev, expiry: 'Định dạng MM/YY' }));
        }
    };

    const handleCvcChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/gi, '');
        if (value.length <= 3) {
            setCvc(value);

            // Validate
            if (!value) {
                setErrors(prev => ({ ...prev, cvc: 'Vui lòng nhập CVC' }));
            } else if (value.length < 3) {
                setErrors(prev => ({ ...prev, cvc: 'CVC phải có 3 số' }));
            } else {
                setErrors(prev => ({ ...prev, cvc: '' }));
            }
        }
    };

    // Hàm chuyển đổi tiếng Việt có dấu sang không dấu
    const removeVietnameseTones = (str) => {
        str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
        str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
        str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
        str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
        str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
        str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
        str = str.replace(/đ/g, "d");
        str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
        str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
        str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
        str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
        str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
        str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
        str = str.replace(/Đ/g, "D");
        return str;
    };

    const handleNameChange = (e) => {
        let value = e.target.value;
        // Chuyển thành chữ hoa
        value = value.toUpperCase();
        // Bỏ dấu tiếng Việt
        value = removeVietnameseTones(value);
        // Chỉ cho phép chữ cái và khoảng trắng
        value = value.replace(/[^A-Z\s]/g, '');
        setName(value);

        // Validate
        if (!value.trim()) {
            setErrors(prev => ({ ...prev, name: 'Vui lòng nhập tên trên thẻ' }));
        } else if (value.trim().length < 3) {
            setErrors(prev => ({ ...prev, name: 'Tên phải có ít nhất 3 ký tự' }));
        } else {
            setErrors(prev => ({ ...prev, name: '' }));
        }
    };

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmail(value);

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) {
            setErrors(prev => ({ ...prev, email: 'Vui lòng nhập email' }));
        } else if (!emailRegex.test(value)) {
            setErrors(prev => ({ ...prev, email: 'Email không hợp lệ' }));
        } else {
            setErrors(prev => ({ ...prev, email: '' }));
        }
    };

    // Luhn algorithm để validate số thẻ
    const luhnCheck = (cardNumber) => {
        const digits = cardNumber.replace(/\s/g, '');
        let sum = 0;
        let isEven = false;

        for (let i = digits.length - 1; i >= 0; i--) {
            let digit = parseInt(digits[i]);

            if (isEven) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }

            sum += digit;
            isEven = !isEven;
        }

        return sum % 10 === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check if there are any errors
        const hasErrors = Object.values(errors).some(error => error !== '');
        if (hasErrors || !cardNumber || !expiry || !cvc || !name || !email) {
            toast.error('Vui lòng điền đầy đủ và chính xác thông tin');
            return;
        }

        setProcessing(true);

        // Giả lập xử lý thanh toán (2-3 giây)
        setTimeout(() => {
            toast.success('Thanh toán thành công!');

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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Đang tải trang thanh toán...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        {/* Left: Back Button */}
                        <button
                            onClick={handleCancel}
                            disabled={processing}
                            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Quay về trang trước"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            <span className="font-medium">Quay lại</span>
                        </button>

                        {/* Center: Stripe Logo */}
                        <div className="absolute left-1/2 transform -translate-x-1/2">
                            <svg className="h-7" viewBox="0 0 60 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V5.57h3.76l.08 1.02a4.7 4.7 0 0 1 3.23-1.29c2.9 0 5.62 2.6 5.62 7.4 0 5.23-2.7 7.6-5.65 7.6zM40 8.95c-.95 0-1.54.34-1.97.81l.02 6.12c.4.44.98.78 1.95.78 1.52 0 2.54-1.65 2.54-3.87 0-2.15-1.04-3.84-2.54-3.84zM28.24 5.57h4.13v14.44h-4.13V5.57zm0-4.7L32.37 0v3.36l-4.13.88V.88zm-4.32 9.35v9.79H19.8V5.57h3.7l.12 1.22c1-1.77 3.07-1.41 3.62-1.22v3.79c-.52-.17-2.29-.43-3.32.86zm-8.55 4.72c0 2.43 2.6 1.68 3.12 1.46v3.36c-.55.3-1.54.54-2.89.54a4.15 4.15 0 0 1-4.27-4.24l.01-13.17 4.02-.86v3.54h3.14V9.1h-3.13v5.85zm-4.91.7c0 2.97-2.31 4.66-5.73 4.66a11.2 11.2 0 0 1-4.46-.93v-3.93c1.38.75 3.1 1.31 4.46 1.31.92 0 1.53-.24 1.53-1C6.26 13.77 0 14.51 0 9.95 0 7.04 2.28 5.3 5.62 5.3c1.36 0 2.72.2 4.09.75v3.88a9.23 9.23 0 0 0-4.1-1.06c-.86 0-1.44.25-1.44.93 0 1.85 6.29.97 6.29 5.88z" fill="#635BFF" />
                            </svg>
                        </div>

                        {/* Right: Empty space for balance */}
                        <div className="w-24"></div>
                    </div>
                </div>
            </div>

            {/* Main Content - 2 Column Layout */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">

                    {/* Left Column - Product Info */}
                    <div className="order-2 lg:order-1">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            {/* Company/Product Info */}
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-xl">🏨</span>
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">LLC Tumipi</h2>
                                    <span className="inline-block mt-1 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded">
                                        TEST MODE
                                    </span>
                                </div>
                            </div>

                            {/* Product Details */}
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-sm font-medium text-gray-900 mb-4">Đặt phòng khách sạn</h3>

                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Mã đặt phòng:</span>
                                        <span className="font-medium text-gray-900">{bookingId}</span>
                                    </div>

                                    {amount && (
                                        <>
                                            <div className="flex justify-between items-center py-2">
                                                <span className="text-base text-gray-600">Số tiền (USD):</span>
                                                <span className="text-xl font-semibold text-gray-900">
                                                    ${amountInUSD}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center py-2">
                                                <span className="text-sm text-gray-500">≈ {Number(amountInVND).toLocaleString('vi-VN')} VNĐ</span>
                                            </div>

                                            <div className="border-t-2 border-gray-300 pt-4 mt-4">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xl font-bold text-gray-900">Tổng cộng</span>
                                                    <div className="text-right">
                                                        <div className="text-3xl font-bold text-blue-600">
                                                            ${amountInUSD}
                                                        </div>
                                                        <div className="text-sm text-gray-500 mt-1">
                                                            USD
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Demo Notice */}
                            <div className="mt-6 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                                <div className="flex gap-2">
                                    <svg className="w-5 h-5 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <div>
                                        <div className="text-xs font-semibold text-yellow-800 mb-0.5">
                                            Giao diện Demo
                                        </div>
                                        <div className="text-xs text-yellow-700">
                                            Không có giao dịch thực tế
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Payment Form */}
                    <div className="order-1 lg:order-2">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Thanh toán bằng thẻ</h2>

                            <div className="space-y-4">
                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-normal text-gray-700 mb-1.5">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={handleEmailChange}
                                        placeholder="example@email.com"
                                        className={`w-full px-3 py-2.5 text-base bg-yellow-50 border rounded focus:outline-none focus:ring-1 transition-all ${errors.email
                                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                            }`}
                                        disabled={processing}
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                                    )}
                                </div>

                                {/* Card Information */}
                                <div>
                                    <label className="block text-sm font-normal text-gray-700 mb-1.5">
                                        Thông tin thẻ
                                    </label>
                                    <div className={`border rounded overflow-hidden focus-within:ring-1 transition-all ${errors.cardNumber || errors.expiry || errors.cvc
                                        ? 'border-red-500 focus-within:ring-red-500 focus-within:border-red-500'
                                        : 'border-gray-300 focus-within:ring-blue-500 focus-within:border-blue-500'
                                        }`}>
                                        {/* Card Number */}
                                        <div className="relative bg-yellow-50">
                                            <input
                                                type="text"
                                                value={cardNumber}
                                                onChange={handleCardNumberChange}
                                                placeholder="1234 5678 9012 3456"
                                                className="w-full px-3 py-2.5 text-base border-0 bg-yellow-50 focus:outline-none focus:ring-0"
                                                disabled={processing}
                                            />
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1.5">
                                                <div className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs font-semibold text-blue-600">
                                                    VISA
                                                </div>
                                            </div>
                                        </div>

                                        {/* Expiry and CVC */}
                                        <div className="grid grid-cols-2 border-t border-gray-300">
                                            <div className="relative border-r border-gray-300 bg-yellow-50">
                                                <input
                                                    type="text"
                                                    value={expiry}
                                                    onChange={handleExpiryChange}
                                                    placeholder="MM / YY"
                                                    className="w-full px-3 py-2.5 text-base border-0 bg-yellow-50 focus:outline-none focus:ring-0"
                                                    disabled={processing}
                                                />
                                            </div>
                                            <div className="relative bg-yellow-50">
                                                <input
                                                    type="text"
                                                    value={cvc}
                                                    onChange={handleCvcChange}
                                                    placeholder="CVC"
                                                    className="w-full px-3 py-2.5 text-base border-0 bg-yellow-50 focus:outline-none focus:ring-0"
                                                    disabled={processing}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    {(errors.cardNumber || errors.expiry || errors.cvc) && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {errors.cardNumber || errors.expiry || errors.cvc}
                                        </p>
                                    )}
                                </div>

                                {/* Cardholder Name */}
                                <div>
                                    <label className="block text-sm font-normal text-gray-700 mb-1.5">
                                        Tên trên thẻ
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={handleNameChange}
                                        className={`w-full px-3 py-2.5 text-base bg-yellow-50 border rounded focus:outline-none focus:ring-1 transition-all uppercase ${errors.name
                                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                            }`}
                                        disabled={processing}
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                                    )}
                                </div>

                                {/* Country */}
                                <div>
                                    <label className="block text-sm font-normal text-gray-700 mb-1.5">
                                        Quốc gia hoặc khu vực
                                    </label>
                                    <select className="w-full px-3 py-2.5 text-base bg-yellow-50 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all">
                                        <option>Việt Nam</option>
                                        <option>United States</option>
                                        <option>United Kingdom</option>
                                    </select>
                                </div>

                                {/* Pay Button */}
                                <button
                                    onClick={handleSubmit}
                                    disabled={
                                        processing ||
                                        !cardNumber ||
                                        !expiry ||
                                        !cvc ||
                                        !name ||
                                        !email ||
                                        Object.values(errors).some(error => error !== '')
                                    }
                                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-base font-medium rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {processing ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        <>
                                            Thanh toán
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </>
                                    )}
                                </button>

                                {/* Footer */}
                                <div className="pt-4 flex items-center justify-center gap-2 text-xs text-gray-600">
                                    <span>Được cung cấp bởi</span>
                                    <span className="font-semibold">stripe</span>
                                    <span>|</span>
                                    <a href="#" className="text-blue-600 hover:underline">Điều khoản</a>
                                    <a href="#" className="text-blue-600 hover:underline">Quyền riêng tư</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StripePayment;
