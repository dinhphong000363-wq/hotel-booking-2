import React, { useEffect, useState } from 'react'
import { useAppContext } from '../../conext/AppContext'
import toast from 'react-hot-toast'
import { assets } from '../../assets/assets'
import { translateRoomType } from '../../utils/translations'
import ConfirmModal from '../../components/ConfirmModal'

const HotelManagement = () => {
    const { axios, getToken, currency } = useAppContext();
    const [hotels, setHotels] = useState([]);
    const [filteredHotels, setFilteredHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'approved', 'rejected'
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [selectedHotel, setSelectedHotel] = useState(null);
    const [actionLoading, setActionLoading] = useState(null); // hotelId that's being processed

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

    // Filter and search hotels
    useEffect(() => {
        let filtered = hotels;

        // Filter by status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(hotel => hotel.status === statusFilter);
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(hotel =>
                hotel.name.toLowerCase().includes(query) ||
                hotel.city.toLowerCase().includes(query) ||
                hotel.address.toLowerCase().includes(query) ||
                (hotel.owner && hotel.owner.username.toLowerCase().includes(query)) ||
                (hotel.owner && hotel.owner.email.toLowerCase().includes(query))
            );
        }

        setFilteredHotels(filtered);
    }, [hotels, statusFilter, searchQuery]);

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

    const handleApprove = async (hotelId) => {
        setActionLoading(hotelId);
        try {
            const token = await getToken();
            const { data } = await axios.put(`/api/admin/hotels/${hotelId}/approve`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                toast.success('Đã duyệt khách sạn thành công');
                fetchHotels();
            } else {
                toast.error(data.message || 'Không thể duyệt khách sạn');
            }
        } catch (error) {
            toast.error(error.message || 'Có lỗi xảy ra');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (hotelId) => {
        setActionLoading(hotelId);
        try {
            const token = await getToken();
            const { data } = await axios.put(`/api/admin/hotels/${hotelId}/reject`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                toast.success('Đã từ chối khách sạn');
                fetchHotels();
            } else {
                toast.error(data.message || 'Không thể từ chối khách sạn');
            }
        } catch (error) {
            toast.error(error.message || 'Có lỗi xảy ra');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteClick = (hotel) => {
        setDeleteConfirm({
            hotelId: hotel._id,
            hotelName: hotel.name
        });
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;

        setDeleting(true);
        try {
            const token = await getToken();
            const { data } = await axios.delete(`/api/admin/hotels/${deleteConfirm.hotelId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                toast.success('Đã xóa khách sạn thành công');
                setDeleteConfirm(null);
                fetchHotels();
            } else {
                toast.error(data.message || 'Không thể xóa khách sạn');
            }
        } catch (error) {
            toast.error(error.message || 'Có lỗi xảy ra');
        } finally {
            setDeleting(false);
        }
    };

    const getStatusCounts = () => {
        return {
            all: hotels.length,
            pending: hotels.filter(h => h.status === 'pending').length,
            approved: hotels.filter(h => h.status === 'approved').length,
            rejected: hotels.filter(h => h.status === 'rejected').length,
        };
    };

    const statusCounts = getStatusCounts();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Đang tải...</div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Quản Lý Khách Sạn</h1>
                <div className="text-sm text-gray-500">
                    Tổng cộng: <span className="font-semibold text-gray-700">{hotels.length}</span> khách sạn
                </div>
            </div>

            {/* Search and Filter Section */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                {/* Search Bar */}
                <div className="mb-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên, thành phố, địa chỉ, chủ khách sạn..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                        <svg
                            className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {/* Status Filter Tabs */}
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={() => setStatusFilter('all')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${statusFilter === 'all'
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Tất cả ({statusCounts.all})
                    </button>
                    <button
                        onClick={() => setStatusFilter('pending')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${statusFilter === 'pending'
                                ? 'bg-yellow-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Chờ duyệt ({statusCounts.pending})
                    </button>
                    <button
                        onClick={() => setStatusFilter('approved')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${statusFilter === 'approved'
                                ? 'bg-green-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Đã duyệt ({statusCounts.approved})
                    </button>
                    <button
                        onClick={() => setStatusFilter('rejected')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${statusFilter === 'rejected'
                                ? 'bg-red-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Đã từ chối ({statusCounts.rejected})
                    </button>
                </div>
            </div>

            {/* Hotels Grid */}
            {filteredHotels.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                    {searchQuery || statusFilter !== 'all'
                        ? 'Không tìm thấy khách sạn nào phù hợp'
                        : 'Không có khách sạn nào'}
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredHotels.map((hotel) => (
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
                                <h3 className="text-xl font-semibold mb-2 text-gray-800 line-clamp-1">{hotel.name}</h3>

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
                                            <span className="text-indigo-600">{translateRoomType(hotel.roomType)}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Statistics Section */}
                                <div className="bg-gray-50 rounded-lg p-3 mb-4 space-y-2">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="bg-white rounded p-2">
                                            <p className="text-xs text-gray-500 mb-1">Số phòng</p>
                                            <p className="text-lg font-bold text-blue-600">{hotel.totalRooms || 0}</p>
                                        </div>
                                        <div className="bg-white rounded p-2">
                                            <p className="text-xs text-gray-500 mb-1">Đơn đặt phòng</p>
                                            <p className="text-lg font-bold text-green-600">{hotel.totalBookings || 0}</p>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded p-2">
                                        <p className="text-xs text-gray-500 mb-1">Tổng doanh thu</p>
                                        <p className="text-lg font-bold text-indigo-600">
                                            {currency}{Number(hotel.totalRevenue || 0).toLocaleString('vi-VN')}
                                        </p>
                                    </div>

                                    {/* Revenue by Month */}
                                    {hotel.revenueByMonth && hotel.revenueByMonth.length > 0 && (
                                        <div className="mt-2 pt-2 border-t border-gray-200">
                                            <p className="text-xs font-medium text-gray-700 mb-2">Doanh thu 6 tháng gần nhất:</p>
                                            <div className="space-y-1 max-h-32 overflow-y-auto">
                                                {hotel.revenueByMonth.map((month, index) => (
                                                    <div key={index} className="flex justify-between items-center text-xs">
                                                        <span className="text-gray-600">{month.month}</span>
                                                        <span className="font-semibold text-gray-800">
                                                            {currency}{Number(month.revenue || 0).toLocaleString('vi-VN')}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Owner Info */}
                                {hotel.owner && (
                                    <div className="pt-4 border-t border-gray-200 mb-4">
                                        <p className="text-xs text-gray-500 mb-2">Chủ khách sạn</p>
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={hotel.owner.avatar || assets.userIcon}
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

                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {hotel.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => handleApprove(hotel._id)}
                                                disabled={actionLoading === hotel._id}
                                                className="flex-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {actionLoading === hotel._id ? 'Đang xử lý...' : 'Duyệt'}
                                            </button>
                                            <button
                                                onClick={() => handleReject(hotel._id)}
                                                disabled={actionLoading === hotel._id}
                                                className="flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {actionLoading === hotel._id ? 'Đang xử lý...' : 'Từ chối'}
                                            </button>
                                        </>
                                    )}
                                    {hotel.status === 'approved' && (
                                        <button
                                            onClick={() => handleReject(hotel._id)}
                                            disabled={actionLoading === hotel._id}
                                            className="flex-1 px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {actionLoading === hotel._id ? 'Đang xử lý...' : 'Hủy duyệt'}
                                        </button>
                                    )}
                                    {hotel.status === 'rejected' && (
                                        <button
                                            onClick={() => handleApprove(hotel._id)}
                                            disabled={actionLoading === hotel._id}
                                            className="flex-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {actionLoading === hotel._id ? 'Đang xử lý...' : 'Duyệt lại'}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDeleteClick(hotel)}
                                        disabled={actionLoading === hotel._id}
                                        className="px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Xóa
                                    </button>
                                </div>

                                {/* Created Date */}
                                <div className="mt-3 pt-3 border-t border-gray-100">
                                    <p className="text-xs text-gray-400">
                                        Đăng ký: {new Date(hotel.createdAt).toLocaleDateString('vi-VN')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={handleDelete}
                title="Xác nhận xóa khách sạn"
                message={`Bạn có chắc chắn muốn xóa khách sạn ${deleteConfirm?.hotelName || ''}? Hành động này sẽ xóa tất cả phòng và đặt phòng liên quan. Hành động này không thể hoàn tác.`}
                confirmText="Xóa"
                variant="danger"
                loading={deleting}
                highlightText={deleteConfirm?.hotelName}
            />
        </div>
    );
};

export default HotelManagement;
