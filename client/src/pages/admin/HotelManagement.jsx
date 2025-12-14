import React, { useEffect, useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'
import { assets } from '../../assets/assets'
import { translateRoomType } from '../../utils/translations'
import ConfirmModal from '../../components/modals/ConfirmModal'

const HotelManagement = () => {
    const { axios, getToken, currency } = useAppContext();
    const [hotels, setHotels] = useState([]);
    const [filteredHotels, setFilteredHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [selectedHotel, setSelectedHotel] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);

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

    useEffect(() => {
        let filtered = hotels;

        if (statusFilter !== 'all') {
            filtered = filtered.filter(hotel => hotel.status === statusFilter);
        }

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
            pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Chờ duyệt', icon: '⏳' },
            approved: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Đã duyệt', icon: '✓' },
            rejected: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', label: 'Từ chối', icon: '✕' },
        };
        const config = statusConfig[status] || statusConfig.pending;
        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full border ${config.bg} ${config.text} ${config.border}`}>
                <span>{config.icon}</span>
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Quản Lý Khách Sạn</h1>
                    <p className="text-sm text-gray-500 mt-1">Quản lý và phê duyệt các khách sạn trong hệ thống</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <div>
                        <p className="text-xs text-gray-600">Tổng số</p>
                        <p className="text-lg font-bold text-gray-900">{hotels.length}</p>
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                {/* Search Bar */}
                <div className="mb-5">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên, thành phố, địa chỉ..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-5 py-3 pl-12 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                        />
                        <svg
                            className="absolute left-4 top-3.5 w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* Status Filter Tabs */}
                <div className="flex gap-2 flex-wrap">
                    {[
                        { key: 'all', label: 'Tất cả', color: 'blue' },
                        { key: 'pending', label: 'Chờ duyệt', color: 'amber' },
                        { key: 'approved', label: 'Đã duyệt', color: 'emerald' },
                        { key: 'rejected', label: 'Đã từ chối', color: 'rose' }
                    ].map(({ key, label, color }) => (
                        <button
                            key={key}
                            onClick={() => setStatusFilter(key)}
                            className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                                statusFilter === key
                                    ? `bg-${color}-500 text-white shadow-lg shadow-${color}-500/30`
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {label} <span className="ml-1 font-bold">({statusCounts[key]})</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Hotels Grid */}
            {filteredHotels.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <p className="text-gray-500">
                        {searchQuery || statusFilter !== 'all'
                            ? 'Không tìm thấy khách sạn nào phù hợp'
                            : 'Không có khách sạn nào'}
                    </p>
                </div>
            ) : (
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {filteredHotels.map((hotel) => (
                        <div key={hotel._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group">
                            {/* Hotel Image */}
                            <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                                {hotel.roomImage ? (
                                    <img
                                        src={hotel.roomImage}
                                        alt={hotel.roomType || 'Room'}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                )}
                                <div className="absolute top-3 right-3">
                                    {getStatusBadge(hotel.status)}
                                </div>
                            </div>

                            {/* Hotel Info */}
                            <div className="p-5">
                                <h3 className="text-xl font-bold mb-3 text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                    {hotel.name}
                                </h3>

                                <div className="space-y-2 text-sm mb-4">
                                    <div className="flex items-start gap-2 text-gray-600">
                                        <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span className="line-clamp-1">{hotel.address}, {hotel.city}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        <span>{hotel.contact}</span>
                                    </div>
                                    {hotel.roomType && (
                                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                                            {translateRoomType(hotel.roomType)}
                                        </div>
                                    )}
                                </div>

                                {/* Statistics */}
                                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-3 mb-4">
                                    <div className="grid grid-cols-3 gap-2 mb-2">
                                        <div className="bg-white rounded-lg p-2 text-center shadow-sm">
                                            <p className="text-xs text-gray-500 mb-0.5">Phòng</p>
                                            <p className="text-lg font-bold text-blue-600">{hotel.totalRooms || 0}</p>
                                        </div>
                                        <div className="bg-white rounded-lg p-2 text-center shadow-sm">
                                            <p className="text-xs text-gray-500 mb-0.5">Đơn</p>
                                            <p className="text-lg font-bold text-emerald-600">{hotel.totalBookings || 0}</p>
                                        </div>
                                        <div className="bg-white rounded-lg p-2 text-center shadow-sm">
                                            <p className="text-xs text-gray-500 mb-0.5">Doanh thu</p>
                                            <p className="text-xs font-bold text-indigo-600">
                                                {currency}{(Number(hotel.totalRevenue || 0) / 1000000).toFixed(1)}M
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Owner Info */}
                                {hotel.owner && (
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-4">
                                        <img
                                            src={hotel.owner.avatar || assets.userIcon}
                                            alt={hotel.owner.username}
                                            className="w-10 h-10 rounded-full object-cover ring-2 ring-white"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 truncate text-sm">
                                                {hotel.owner.username}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">
                                                {hotel.owner.email}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-2">
                                    {hotel.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => handleApprove(hotel._id)}
                                                disabled={actionLoading === hotel._id}
                                                className="flex-1 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                                            >
                                                {actionLoading === hotel._id ? '...' : '✓ Duyệt'}
                                            </button>
                                            <button
                                                onClick={() => handleReject(hotel._id)}
                                                disabled={actionLoading === hotel._id}
                                                className="flex-1 px-3 py-2 bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                                            >
                                                {actionLoading === hotel._id ? '...' : '✕ Từ chối'}
                                            </button>
                                        </>
                                    )}
                                    {hotel.status === 'approved' && (
                                        <button
                                            onClick={() => handleReject(hotel._id)}
                                            disabled={actionLoading === hotel._id}
                                            className="flex-1 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                                        >
                                            {actionLoading === hotel._id ? '...' : 'Hủy duyệt'}
                                        </button>
                                    )}
                                    {hotel.status === 'rejected' && (
                                        <button
                                            onClick={() => handleApprove(hotel._id)}
                                            disabled={actionLoading === hotel._id}
                                            className="flex-1 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                                        >
                                            {actionLoading === hotel._id ? '...' : 'Duyệt lại'}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDeleteClick(hotel)}
                                        disabled={actionLoading === hotel._id}
                                        className="px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                                    >
                                        🗑️
                                    </button>
                                </div>

                                {/* Footer */}
                                <div className="mt-3 pt-3 border-t border-gray-100">
                                    <p className="text-xs text-gray-400">
                                        📅 Đăng ký: {new Date(hotel.createdAt).toLocaleDateString('vi-VN')}
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