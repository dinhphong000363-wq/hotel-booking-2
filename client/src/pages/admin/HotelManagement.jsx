import React, { useEffect, useState } from 'react'
import { useAppContext } from '../../conext/AppContext'
import toast from 'react-hot-toast'
import { assets } from '../../assets/assets'

const HotelManagement = () => {
    const { axios, getToken } = useAppContext();
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchHotels = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            const { data } = await axios.get('/api/admin/hotels', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                setHotels(data.hotels || []);
            } else {
                toast.error(data.message || 'Không thể tải danh sách khách sạn');
            }
        } catch (error) {
            toast.error(error.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHotels();
    }, []);

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Chờ duyệt' },
            approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Đã duyệt' },
            rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Đã từ chối' },
        };
        const config = statusConfig[status] || statusConfig.pending;
        return (
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Đang tải...</div>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Quản Lý Khách Sạn</h1>
            
            {hotels.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                    Không có khách sạn nào
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {hotels.map((hotel) => (
                        <div key={hotel._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                            {/* Room Image */}
                            <div className="relative h-48 bg-gray-200">
                                {hotel.roomImage ? (
                                    <img
                                        src={hotel.roomImage}
                                        alt={hotel.roomType || 'Room'}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <img src={assets.uploadArea} alt="No image" className="w-16 h-16 opacity-50" />
                                    </div>
                                )}
                                {/* Status Badge */}
                                <div className="absolute top-2 right-2">
                                    {getStatusBadge(hotel.status)}
                                </div>
                            </div>

                            {/* Hotel Info */}
                            <div className="p-4">
                                <h3 className="text-xl font-semibold mb-2 text-gray-800">{hotel.name}</h3>
                                
                                <div className="space-y-2 text-sm text-gray-600 mb-4">
                                    <div className="flex items-start gap-2">
                                        <img src={assets.locationIcon} alt="location" className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span className="line-clamp-1">{hotel.address}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">Thành phố:</span>
                                        <span>{hotel.city}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">Liên hệ:</span>
                                        <span>{hotel.contact}</span>
                                    </div>
                                    {hotel.roomType && (
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">Loại phòng:</span>
                                            <span className="text-indigo-600">{hotel.roomType}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Owner Info */}
                                {hotel.owner && (
                                    <div className="pt-4 border-t border-gray-200">
                                        <p className="text-xs text-gray-500 mb-2">Chủ khách sạn</p>
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={hotel.owner.image}
                                                alt={hotel.owner.username}
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-800 truncate">
                                                    {hotel.owner.username}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">
                                                    {hotel.owner.email}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Created Date */}
                                <div className="mt-4 pt-3 border-t border-gray-100">
                                    <p className="text-xs text-gray-400">
                                        Đăng ký: {new Date(hotel.createdAt).toLocaleDateString('vi-VN')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default HotelManagement;

