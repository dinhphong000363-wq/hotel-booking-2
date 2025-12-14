import { useState, useEffect } from 'react'
import { assets } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast';
import axios from 'axios';
import MapWithSearch from '../components/hotel/MapWithSearch';

const RegisterHotel = () => {
    const { axios: authAxios, getToken, navigate, setHotelStatusUpdated } = useAppContext();

    const [name, setName] = useState("");
    const [contact, setContact] = useState("");
    const [contactError, setContactError] = useState("");
    const [provinceCode, setProvinceCode] = useState("");
    const [provinceName, setProvinceName] = useState("");
    const [wardCode, setWardCode] = useState("");
    const [wardName, setWardName] = useState("");
    const [addressDetail, setAddressDetail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // API data
    const [provinces, setProvinces] = useState([]);
    const [wards, setWards] = useState([]);
    const [filteredWards, setFilteredWards] = useState([]);
    const [wardSearch, setWardSearch] = useState("");
    const [loadingProvinces, setLoadingProvinces] = useState(true);
    const [loadingWards, setLoadingWards] = useState(false);

    // Fetch provinces on mount
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                setLoadingProvinces(true);
                const response = await axios.get('https://provinces.open-api.vn/api/p/');
                setProvinces(response.data);
            } catch (error) {
                toast.error('Không thể tải danh sách tỉnh/thành phố');
                console.error('Error fetching provinces:', error);
            } finally {
                setLoadingProvinces(false);
            }
        };
        fetchProvinces();
    }, []);

    // Fetch wards when province changes
    useEffect(() => {
        const fetchWards = async () => {
            if (!provinceCode) {
                setWards([]);
                setFilteredWards([]);
                return;
            }

            try {
                setLoadingWards(true);
                const response = await axios.get(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=3`);
                // Flatten all wards from all districts
                const allWards = [];
                if (response.data.districts) {
                    response.data.districts.forEach(district => {
                        if (district.wards) {
                            district.wards.forEach(ward => {
                                allWards.push({
                                    ...ward,
                                    districtName: district.name
                                });
                            });
                        }
                    });
                }
                setWards(allWards);
                setFilteredWards(allWards);
            } catch (error) {
                toast.error('Không thể tải danh sách phường/xã');
                console.error('Error fetching wards:', error);
            } finally {
                setLoadingWards(false);
            }
        };
        fetchWards();
    }, [provinceCode]);

    // Filter wards based on search
    useEffect(() => {
        if (!wardSearch.trim()) {
            setFilteredWards(wards);
            return;
        }

        const searchLower = wardSearch.toLowerCase();
        const filtered = wards.filter(ward =>
            ward.name.toLowerCase().includes(searchLower) ||
            ward.districtName.toLowerCase().includes(searchLower)
        );
        setFilteredWards(filtered);
    }, [wardSearch, wards]);

    // Validate phone number
    const validatePhoneNumber = (phone) => {
        // Remove all spaces and special characters
        const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

        // Check if it's 10-11 digits
        if (!/^\d{10,11}$/.test(cleanPhone)) {
            return "Số điện thoại phải có 10-11 chữ số";
        }

        // Check if it starts with valid Vietnamese phone prefixes
        const validPrefixes = ['03', '05', '07', '08', '09', '01'];
        const prefix = cleanPhone.substring(0, 2);

        if (!validPrefixes.includes(prefix)) {
            return "Số điện thoại không hợp lệ";
        }

        return "";
    }

    // Handle contact change with validation
    const handleContactChange = (e) => {
        let value = e.target.value;

        // Only allow numbers
        value = value.replace(/[^\d]/g, '');

        // Limit to 11 digits
        if (value.length > 11) {
            value = value.slice(0, 11);
        }

        setContact(value);

        if (value.trim()) {
            const error = validatePhoneNumber(value);
            setContactError(error);
        } else {
            setContactError("");
        }
    }

    const onSubmitHandle = async (event) => {
        try {
            event.preventDefault();

            // Validate phone before submit
            const phoneError = validatePhoneNumber(contact);
            if (phoneError) {
                setContactError(phoneError);
                toast.error(phoneError);
                return;
            }

            setSubmitting(true);

            // Tạo địa chỉ đầy đủ
            const fullAddress = `${addressDetail}, ${wardName}, ${provinceName}`;

            const { data } = await authAxios.post(`/api/hotels`, {
                name,
                address: fullAddress,
                contact,
                city: provinceName,
                district: wardName,
                street: addressDetail,
                houseNumber: '',
                fullAddress
            }, { headers: { Authorization: `Bearer ${await getToken()}` } })

            if (data.success) {
                setSubmitted(true);
                toast.success(data.message)
                setHotelStatusUpdated(prev => prev + 1);
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message || 'Có lỗi xảy ra khi đăng ký khách sạn')
        } finally {
            setSubmitting(false);
        }
    }

    const handleGoBack = () => {
        navigate('/');
    }

    // Handle province change
    const handleProvinceChange = (e) => {
        const selectedCode = e.target.value;
        const selectedProvince = provinces.find(p => p.code.toString() === selectedCode);

        setProvinceCode(selectedCode);
        setProvinceName(selectedProvince ? selectedProvince.name : "");
        setWardCode(""); // Reset ward
        setWardName("");
        setWardSearch("");
        setWards([]);
        setFilteredWards([]);
    }

    // Handle ward change
    const handleWardChange = (e) => {
        const selectedCode = e.target.value;
        const selectedWard = wards.find(w => w.code.toString() === selectedCode);

        setWardCode(selectedCode);
        setWardName(selectedWard ? selectedWard.name : "");
    }

    // Get full address for preview
    const getFullAddress = () => {
        const parts = [];
        if (addressDetail) parts.push(addressDetail);
        if (wardName) parts.push(wardName);
        if (provinceName) parts.push(provinceName);
        return parts.join(', ');
    }

    const fullAddress = getFullAddress();

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 pt-20 pb-16 px-4 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-60 -left-40 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '700ms' }}></div>
                <div className="absolute -bottom-32 right-1/3 w-72 h-72 bg-pink-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1000ms' }}></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <div className="mb-12 text-center">
                    <button
                        onClick={handleGoBack}
                        className="inline-flex items-center gap-2 text-white hover:text-indigo-100 mb-6 transition-all hover:gap-3 group backdrop-blur-sm bg-white/10 px-4 py-2 rounded-full"
                    >
                        <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Quay lại trang chủ
                    </button>
                    <div className="inline-block mb-4">
                        <div className="bg-white/20 backdrop-blur-md rounded-2xl px-6 py-2 border border-white/30">
                            <span className="text-white/90 text-sm font-medium">🏨 Trở thành đối tác</span>
                        </div>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
                        Đăng ký khách sạn
                    </h1>
                    <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
                        Mở rộng kinh doanh và tiếp cận hàng nghìn khách hàng tiềm năng
                    </p>
                </div>

                {!submitted ? (
                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Left Side - Form */}
                        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-white/20 hover:shadow-indigo-500/20 transition-all duration-500">
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">📝 Thông tin khách sạn</h2>
                                <p className="text-gray-600">Vui lòng điền đầy đủ thông tin bên dưới</p>
                            </div>
                            <form onSubmit={onSubmitHandle} className="space-y-6">
                                {/* Hotel name */}
                                <div className="group">
                                    <label htmlFor="name" className="block font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                        <span className="text-xl">🏨</span>
                                        Tên khách sạn <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        placeholder="Nhập tên khách sạn của bạn"
                                        className="border-2 border-gray-200 rounded-xl w-full px-5 py-4 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all text-gray-800 placeholder:text-gray-400 hover:border-gray-300"
                                        onChange={(e) => setName(e.target.value)}
                                        value={name}
                                        required
                                    />
                                </div>

                                {/* Contact */}
                                <div className="group">
                                    <label htmlFor="contact" className="block font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                        <span className="text-xl">📞</span>
                                        Số điện thoại <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="contact"
                                        type="tel"
                                        placeholder="Ví dụ: 0912345678"
                                        maxLength={11}
                                        className={`border-2 rounded-xl w-full px-5 py-4 outline-none focus:ring-4 transition-all text-gray-800 placeholder:text-gray-400 ${contactError
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                                            : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-100 hover:border-gray-300'
                                            }`}
                                        onChange={handleContactChange}
                                        value={contact}
                                        required
                                    />
                                    {contactError && (
                                        <p className="text-sm text-red-600 mt-2 flex items-center gap-1 font-medium">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {contactError}
                                        </p>
                                    )}
                                    {!contactError && contact && (
                                        <p className="text-sm text-green-600 mt-2 flex items-center gap-1 font-medium">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            Số điện thoại hợp lệ
                                        </p>
                                    )}
                                </div>

                                {/* Province/City */}
                                <div className="group">
                                    <label htmlFor="province" className="block font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                        <span className="text-xl">🌆</span>
                                        Tỉnh/Thành phố <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="province"
                                        className="border-2 border-gray-200 rounded-xl w-full px-5 py-4 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all text-gray-800 hover:border-gray-300 cursor-pointer bg-white"
                                        onChange={handleProvinceChange}
                                        value={provinceCode}
                                        disabled={loadingProvinces}
                                        required
                                    >
                                        <option value="">
                                            {loadingProvinces ? 'Đang tải...' : 'Chọn tỉnh/thành phố'}
                                        </option>
                                        {provinces.map((province) => (
                                            <option key={province.code} value={province.code}>
                                                {province.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Ward with Search */}
                                <div className="group">
                                    <label htmlFor="ward" className="block font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                        <span className="text-xl">📍</span>
                                        Phường/Xã <span className="text-red-500">*</span>
                                    </label>

                                    {/* Search input */}
                                    {provinceCode && wards.length > 0 && (
                                        <div className="relative mb-3">
                                            <input
                                                type="text"
                                                placeholder="🔍 Tìm kiếm phường/xã..."
                                                className="border-2 border-gray-200 rounded-xl w-full pl-5 pr-4 py-3 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all text-sm text-gray-800 placeholder:text-gray-400 hover:border-gray-300"
                                                value={wardSearch}
                                                onChange={(e) => setWardSearch(e.target.value)}
                                            />
                                        </div>
                                    )}

                                    <select
                                        id="ward"
                                        className="border-2 border-gray-200 rounded-xl w-full px-5 py-4 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all text-gray-800 hover:border-gray-300 cursor-pointer bg-white"
                                        onChange={handleWardChange}
                                        value={wardCode}
                                        disabled={!provinceCode || loadingWards}
                                        required
                                    >
                                        <option value="">
                                            {!provinceCode ? 'Chọn tỉnh/thành phố trước' : loadingWards ? 'Đang tải...' : 'Chọn phường/xã'}
                                        </option>
                                        {filteredWards.map((ward) => (
                                            <option key={ward.code} value={ward.code}>
                                                {ward.name} - {ward.districtName}
                                            </option>
                                        ))}
                                    </select>
                                    {wardSearch && filteredWards.length === 0 && wards.length > 0 && (
                                        <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                                            <span>⚠️</span>
                                            Không tìm thấy phường/xã phù hợp
                                        </p>
                                    )}
                                </div>

                                {/* Address Detail */}
                                <div className="group">
                                    <label htmlFor="addressDetail" className="block font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                        <span className="text-xl">🏠</span>
                                        Số nhà, tên đường <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="addressDetail"
                                        type="text"
                                        placeholder="Ví dụ: 123 Nguyễn Huệ"
                                        className="border-2 border-gray-200 rounded-xl w-full px-5 py-4 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all text-gray-800 placeholder:text-gray-400 hover:border-gray-300"
                                        onChange={(e) => setAddressDetail(e.target.value)}
                                        value={addressDetail}
                                        disabled={!wardCode}
                                        required
                                    />
                                    <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                                        <span>💡</span>
                                        Nhập số nhà và tên đường của khách sạn
                                    </p>
                                </div>

                                {/* Address Preview */}
                                {fullAddress && (
                                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl p-5 shadow-sm">
                                        <p className="text-sm font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                                            <span className="text-lg">✅</span>
                                            Địa chỉ đầy đủ:
                                        </p>
                                        <p className="text-indigo-700 font-medium">
                                            {fullAddress}
                                        </p>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={submitting || !!contactError}
                                    className='w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold px-6 py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 text-lg'>
                                    {submitting ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        <>
                                            <span>🚀</span>
                                            Đăng ký ngay
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Right Side - Map Preview */}
                        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-white/20 hover:shadow-purple-500/20 transition-all duration-500">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                                <span className="text-3xl">🗺️</span>
                                Xem trước vị trí
                            </h3>
                            <p className="text-gray-600 mb-6">Vị trí khách sạn trên bản đồ</p>
                            {fullAddress ? (
                                <div className="space-y-4">
                                    <div className="rounded-2xl overflow-hidden shadow-lg ring-2 ring-indigo-100">
                                        <MapWithSearch address={fullAddress} isExpanded={true} />
                                    </div>
                                    <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                                        <p className="text-sm text-amber-800 flex items-start gap-2">
                                            <span className="text-lg">💡</span>
                                            <span>Vị trí trên bản đồ được tự động tìm kiếm dựa trên địa chỉ bạn nhập. Độ chính xác phụ thuộc vào thông tin địa chỉ.</span>
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-[600px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-300">
                                    <div className="text-center text-gray-500 p-8">
                                        <div className="bg-white rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-lg">
                                            <svg className="w-12 h-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <p className="font-bold text-gray-700 text-lg mb-2">Điền địa chỉ để xem vị trí</p>
                                        <p className="text-sm text-gray-500">Bản đồ sẽ hiển thị tự động khi bạn hoàn thành thông tin địa chỉ</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="max-w-5xl mx-auto">
                        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-12 border border-white/20">
                            {/* Success Message */}
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-8 text-center">
                                <div className="mb-6">
                                    <div className="bg-green-500 rounded-full w-24 h-24 flex items-center justify-center mx-auto shadow-xl animate-bounce">
                                        <svg className="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                </div>
                                <h3 className="text-4xl font-bold text-green-800 mb-4">
                                    🎉 Đăng ký thành công!
                                </h3>
                                <p className="text-green-700 text-lg mb-8">Cảm ơn bạn đã tin tưởng và đăng ký trên nền tảng của chúng tôi</p>

                                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-2xl p-6 mb-8 shadow-lg">
                                    <div className="flex items-center justify-center gap-3 mb-4">
                                        <div className="bg-yellow-400 rounded-full p-3">
                                            <svg className="h-7 w-7 text-yellow-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <span className="text-2xl font-bold text-yellow-900">Đang chờ duyệt</span>
                                    </div>
                                    <div className="bg-white/70 backdrop-blur rounded-xl p-5 text-left space-y-3">
                                        <p className="text-yellow-800 font-medium flex items-start gap-2">
                                            <span className="text-xl flex-shrink-0">✨</span>
                                            <span>Khách sạn <span className="font-bold text-yellow-900">"{name}"</span> đã được gửi yêu cầu đăng ký thành công!</span>
                                        </p>
                                        <p className="text-yellow-800 flex items-start gap-2">
                                            <span className="text-xl flex-shrink-0">⏳</span>
                                            <span>Vui lòng chờ quản trị viên xem xét và phê duyệt. Bạn sẽ nhận được thông báo qua email/SMS khi có kết quả.</span>
                                        </p>
                                        <p className="text-yellow-800 flex items-start gap-2">
                                            <span className="text-xl flex-shrink-0">📧</span>
                                            <span>Thời gian xử lý thường từ 1-3 ngày làm việc.</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-white rounded-2xl p-6 text-left shadow-md border-2 border-gray-100">
                                        <p className="font-bold text-gray-900 mb-4 text-xl flex items-center gap-2">
                                            <span>📋</span>
                                            Thông tin đã đăng ký:
                                        </p>
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                                                <span className="text-2xl">🏨</span>
                                                <div>
                                                    <p className="text-sm text-gray-600 font-medium">Tên khách sạn</p>
                                                    <p className="text-gray-900 font-semibold text-lg">{name}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                                                <span className="text-2xl">📍</span>
                                                <div>
                                                    <p className="text-sm text-gray-600 font-medium">Địa chỉ</p>
                                                    <p className="text-gray-900 font-semibold">{addressDetail}, {wardName}, {provinceName}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                                                <span className="text-2xl">📞</span>
                                                <div>
                                                    <p className="text-sm text-gray-600 font-medium">Số điện thoại</p>
                                                    <p className="text-gray-900 font-semibold text-lg">{contact}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Map preview in success */}
                                    <div className="rounded-2xl overflow-hidden shadow-xl ring-2 ring-green-200">
                                        <MapWithSearch address={`${addressDetail}, ${wardName}, ${provinceName}`} />
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleGoBack}
                                    className='w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold px-8 py-5 rounded-xl transition-all shadow-xl hover:shadow-2xl mt-8 text-lg hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3'>
                                    <span>🏠</span>
                                    Quay về trang chủ
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default RegisterHotel