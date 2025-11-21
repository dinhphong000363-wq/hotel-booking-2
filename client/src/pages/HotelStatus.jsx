import { useState, useEffect } from 'react';
import { useAppContext } from '../conext/AppContext';
import toast from 'react-hot-toast';
import { cities } from '../assets/assets';
import { districts } from '../utils/vietnamDistricts';
import { streets, houseNumbers } from '../utils/vietnamStreets';

const HotelStatus = () => {
    const { axios, getToken, navigate, setHotelStatusUpdated } = useAppContext();
    const [hotel, setHotel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);

    // Edit form states
    const [editName, setEditName] = useState("");
    const [editContact, setEditContact] = useState("");
    const [editCity, setEditCity] = useState("");
    const [editDistrict, setEditDistrict] = useState("");
    const [editStreet, setEditStreet] = useState("");
    const [editHouseNumber, setEditHouseNumber] = useState("");
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchHotelStatus();
    }, []);

    const fetchHotelStatus = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            if (!token) {
                navigate('/');
                return;
            }

            const { data } = await axios.get('/api/hotels/owner', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success && data.hotel) {
                setHotel(data.hotel);
                // Set edit form values
                setEditName(data.hotel.name || "");
                setEditContact(data.hotel.contact || "");
                setEditCity(data.hotel.city || "");
                setEditDistrict(data.hotel.district || "");
                setEditStreet(data.hotel.street || "");
                setEditHouseNumber(data.hotel.houseNumber || "");
            } else {
                toast.error('Không tìm thấy thông tin khách sạn');
                navigate('/');
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra khi tải thông tin');
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelRegistration = async () => {
        try {
            const token = await getToken();
            const { data } = await axios.delete('/api/hotels/owner', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                toast.success(data.message);
                setHotelStatusUpdated(prev => prev + 1);
                navigate('/');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra khi hủy đăng ký');
        }
        setShowCancelModal(false);
    };

    const handleUpdateHotel = async (e) => {
        e.preventDefault();
        try {
            setUpdating(true);
            const token = await getToken();

            const fullAddress = `${editHouseNumber ? editHouseNumber + ', ' : ''}${editStreet ? editStreet + ', ' : ''}${editDistrict ? editDistrict + ', ' : ''}${editCity}`;

            const { data } = await axios.put('/api/hotels/owner/pending', {
                name: editName,
                contact: editContact,
                city: editCity,
                district: editDistrict,
                street: editStreet,
                houseNumber: editHouseNumber,
                fullAddress
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                toast.success(data.message);
                setHotel(data.hotel);
                setShowEditModal(false);
                setHotelStatusUpdated(prev => prev + 1);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra khi cập nhật thông tin');
        } finally {
            setUpdating(false);
        }
    };

    const availableDistricts = editCity ? (districts[editCity] || []) : [];
    const availableStreets = (editCity && editDistrict) ? (streets[editCity]?.[editDistrict] || []) : [];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (!hotel) {
        return null;
    }

    const getStatusBadge = () => {
        switch (hotel.status) {
            case 'pending':
                return (
                    <div className="flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full">
                        <svg className="h-5 w-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span className="font-semibold">Đang chờ phê duyệt</span>
                    </div>
                );
            case 'approved':
                return (
                    <div className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-semibold">Đã phê duyệt</span>
                    </div>
                );
            case 'rejected':
                return (
                    <div className="flex items-center gap-2 bg-red-100 text-red-800 px-4 py-2 rounded-full">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-semibold">Đã từ chối</span>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Quay lại trang chủ
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">Trạng thái đăng ký khách sạn</h1>
                </div>

                {/* Status Card */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    {/* Status Banner */}
                    <div className={`p-6 ${hotel.status === 'pending' ? 'bg-yellow-50' :
                        hotel.status === 'approved' ? 'bg-green-50' :
                            'bg-red-50'
                        }`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                    {hotel.name}
                                </h2>
                                {getStatusBadge()}
                            </div>
                        </div>

                        {hotel.status === 'pending' && (
                            <div className="mt-4">
                                <p className="text-sm text-yellow-700 mb-3">
                                    Khách sạn của bạn đang được admin xem xét. Vui lòng chờ thông báo kết quả.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowEditModal(true)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all text-sm"
                                    >
                                        Chỉnh sửa thông tin
                                    </button>
                                    <button
                                        onClick={() => setShowCancelModal(true)}
                                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all text-sm"
                                    >
                                        Hủy đăng ký
                                    </button>
                                </div>
                            </div>
                        )}

                        {hotel.status === 'approved' && (
                            <div className="mt-4">
                                <p className="text-sm text-green-700 mb-3">
                                    Chúc mừng! Khách sạn của bạn đã được phê duyệt. Bạn có thể bắt đầu quản lý phòng và nhận đặt phòng.
                                </p>
                                <button
                                    onClick={() => navigate('/owner')}
                                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-all"
                                >
                                    Đi đến bảng điều khiển
                                </button>
                            </div>
                        )}

                        {hotel.status === 'rejected' && (
                            <div className="mt-4">
                                <p className="text-sm text-red-700 mb-2">
                                    Rất tiếc, yêu cầu đăng ký khách sạn của bạn đã bị từ chối.
                                </p>
                                {hotel.rejectionReason && (
                                    <div className="bg-white rounded p-3 mt-2">
                                        <p className="text-sm font-semibold text-gray-700">Lý do:</p>
                                        <p className="text-sm text-gray-600 mt-1">{hotel.rejectionReason}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Hotel Information */}
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin đã đăng ký</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between py-3 border-b">
                                <span className="text-gray-600 font-medium">Tên khách sạn:</span>
                                <span className="text-gray-900 font-semibold">{hotel.name}</span>
                            </div>
                            <div className="flex justify-between py-3 border-b">
                                <span className="text-gray-600 font-medium">Số điện thoại:</span>
                                <span className="text-gray-900 font-semibold">{hotel.contact}</span>
                            </div>
                            <div className="flex flex-col py-3 border-b">
                                <span className="text-gray-600 font-medium mb-2">Địa chỉ:</span>
                                <span className="text-gray-900 font-semibold">
                                    {hotel.houseNumber && `${hotel.houseNumber}, `}
                                    {hotel.street && `${hotel.street}, `}
                                    {hotel.district && `${hotel.district}, `}
                                    {hotel.city}
                                </span>
                            </div>
                            <div className="flex justify-between py-3">
                                <span className="text-gray-600 font-medium">Ngày đăng ký:</span>
                                <span className="text-gray-900 font-semibold">
                                    {new Date(hotel.createdAt).toLocaleDateString('vi-VN')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Help Section */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex gap-3">
                        <svg className="h-6 w-6 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <h4 className="font-semibold text-blue-900 mb-1">Cần hỗ trợ?</h4>
                            <p className="text-sm text-blue-700">
                                Nếu bạn có bất kỳ câu hỏi nào về trạng thái đăng ký, vui lòng liên hệ với chúng tôi qua email hoặc hotline hỗ trợ.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold text-gray-900">Chỉnh sửa thông tin khách sạn</h2>
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleUpdateHotel} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên khách sạn</label>
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                                    <input
                                        type="text"
                                        value={editContact}
                                        onChange={(e) => setEditContact(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Thành phố</label>
                                    <select
                                        value={editCity}
                                        onChange={(e) => {
                                            setEditCity(e.target.value);
                                            setEditDistrict("");
                                            setEditStreet("");
                                        }}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        required
                                    >
                                        <option value="">Chọn thành phố</option>
                                        {cities.map((city) => (
                                            <option key={city} value={city}>{city}</option>
                                        ))}
                                    </select>
                                </div>

                                {editCity && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Quận/Huyện</label>
                                        <select
                                            value={editDistrict}
                                            onChange={(e) => {
                                                setEditDistrict(e.target.value);
                                                setEditStreet("");
                                            }}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            required
                                        >
                                            <option value="">Chọn quận/huyện</option>
                                            {availableDistricts.map((dist) => (
                                                <option key={dist} value={dist}>{dist}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {editDistrict && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Đường</label>
                                        <select
                                            value={editStreet}
                                            onChange={(e) => setEditStreet(e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            required
                                        >
                                            <option value="">Chọn đường</option>
                                            {availableStreets.length > 0 ? (
                                                availableStreets.map((str) => (
                                                    <option key={str} value={str}>{str}</option>
                                                ))
                                            ) : (
                                                <option value="" disabled>Chưa có dữ liệu đường</option>
                                            )}
                                        </select>
                                        {availableStreets.length === 0 && (
                                            <input
                                                type="text"
                                                placeholder="Nhập tên đường"
                                                value={editStreet}
                                                onChange={(e) => setEditStreet(e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                        )}
                                    </div>
                                )}

                                {editStreet && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Số nhà</label>
                                        <select
                                            value={editHouseNumber}
                                            onChange={(e) => setEditHouseNumber(e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            required
                                        >
                                            <option value="">Chọn số nhà</option>
                                            {houseNumbers.map((num) => (
                                                <option key={num} value={num}>{num}</option>
                                            ))}
                                        </select>
                                        <input
                                            type="text"
                                            placeholder="Hoặc nhập số nhà khác"
                                            value={editHouseNumber}
                                            onChange={(e) => setEditHouseNumber(e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                )}

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        disabled={updating}
                                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-all disabled:opacity-50"
                                    >
                                        {updating ? 'Đang cập nhật...' : 'Cập nhật'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowEditModal(false)}
                                        className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg transition-all"
                                    >
                                        Hủy
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Confirmation Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-red-100 rounded-full p-3">
                                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Xác nhận hủy đăng ký</h3>
                        </div>

                        <p className="text-gray-600 mb-6">
                            Bạn có chắc chắn muốn hủy đăng ký khách sạn <span className="font-semibold">{hotel.name}</span>?
                            Hành động này không thể hoàn tác.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={handleCancelRegistration}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-all"
                            >
                                Xác nhận hủy
                            </button>
                            <button
                                onClick={() => setShowCancelModal(false)}
                                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg transition-all"
                            >
                                Không
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HotelStatus;
