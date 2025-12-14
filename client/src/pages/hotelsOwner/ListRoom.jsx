import React, { useEffect, useState } from 'react'
import Title from '../../components/common/Title'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'
import { assets } from '../../assets/assets'
import ConfirmModal from '../../components/modals/ConfirmModal'
import { translateAmenity, translateRoomType } from '../../utils/translations'

const ListRoom = () => {
    const [rooms, setRooms] = useState([])
    const [editingRoom, setEditingRoom] = useState(null)
    const [deleteConfirm, setDeleteConfirm] = useState(null)
    const [editForm, setEditForm] = useState({
        roomType: '',
        pricePerNight: '',
        discount: '0',
        amenities: {
            'Free WiFi': false,
            'Free Breakfast': false,
            'Room Service': false,
            'Mountain View': false,
            'Pool Access': false,
        },
    })
    const [editImages, setEditImages] = useState({
        1: null,
        2: null,
        3: null,
        4: null,
    })
    const [loading, setLoading] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [viewMode, setViewMode] = useState('grid') // 'grid' or 'table'
    const { axios, getToken, user, currency, fetchRooms, hotelStatusUpdated } = useAppContext();

    const fetchRoom = async () => {
        try {
            const token = await getToken();
            const { data } = await axios.get('/api/rooms/owner', {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (data.success) {
                setRooms(data.rooms || []);
                await fetchRooms();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message || 'Có lỗi xảy ra khi tải danh sách phòng');
        }
    };

    const toggleAvailability = async (roomId) => {
        const token = await getToken();
        const { data } = await axios.post('/api/rooms/toggle-availability', { roomId }, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (data.success) {
            toast.success(data.message)
            await fetchRoom()
        } else {
            toast.error(data.message)
        }
    }

    const handleDeleteClick = (room) => {
        setDeleteConfirm({ roomId: room._id, roomType: room.roomType, roomTypeLabel: translateRoomType(room.roomType) });
    }

    const handleCloseDeleteConfirm = () => {
        setDeleteConfirm(null);
    }

    const handleDelete = async () => {
        if (!deleteConfirm) return;

        setDeleting(true);
        try {
            const token = await getToken();
            const { data } = await axios.delete(`/api/rooms/${deleteConfirm.roomId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (data.success) {
                toast.success('Đã xóa phòng thành công');
                handleCloseDeleteConfirm();
                await fetchRoom();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Không thể xóa phòng');
        } finally {
            setDeleting(false);
        }
    }

    const handleEdit = (room) => {
        setEditingRoom(room._id);
        setEditForm({
            roomType: room.roomType,
            pricePerNight: room.pricePerNight,
            discount: room.discount ? String(room.discount) : '0',
            amenities: {
                'Free WiFi': room.amenities.includes('Free WiFi'),
                'Free Breakfast': room.amenities.includes('Free Breakfast'),
                'Room Service': room.amenities.includes('Room Service'),
                'Mountain View': room.amenities.includes('Mountain View'),
                'Pool Access': room.amenities.includes('Pool Access'),
            },
        });
        const imageObj = {};
        room.images?.forEach((img, index) => {
            if (index < 4) {
                imageObj[index + 1] = img;
            }
        });
        setEditImages(imageObj);
    }

    const handleCloseEdit = () => {
        setEditingRoom(null);
        setEditForm({
            roomType: '',
            pricePerNight: '',
            discount: '0',
            amenities: {
                'Free WiFi': false,
                'Free Breakfast': false,
                'Room Service': false,
                'Mountain View': false,
                'Pool Access': false,
            },
        });
        setEditImages({ 1: null, 2: null, 3: null, 4: null });
    }

    const handleUpdate = async (roomId) => {
        if (!editForm.roomType || !editForm.pricePerNight) {
            toast.error('Vui lòng điền đầy đủ thông tin');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('roomType', editForm.roomType);
            formData.append('pricePerNight', editForm.pricePerNight);
            formData.append('discount', editForm.discount);

            const amenities = Object.keys(editForm.amenities || {}).filter(
                (key) => editForm.amenities[key]
            );
            formData.append('amenities', JSON.stringify(amenities));

            Object.keys(editImages).forEach((key) => {
                if (editImages[key] && typeof editImages[key] === 'object') {
                    formData.append('images', editImages[key]);
                }
            });

            const token = await getToken();
            const { data } = await axios.put(`/api/rooms/${roomId}`, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (data.success) {
                toast.success('Đã cập nhật phòng thành công');
                handleCloseEdit();
                await fetchRoom();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || error.message || 'Không thể cập nhật phòng');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (user) {
            fetchRoom()
        }
    }, [user, hotelStatusUpdated])

    return (
        <div className="space-y-6">
            <Title
                align="left"
                font="outfit"
                title="Danh sách phòng"
                subTitle="Quản lý tất cả các phòng đang được niêm yết — bạn có thể chỉnh sửa, cập nhật tình trạng, hoặc tạm ẩn khi cần."
            />

            {/* Stats Overview */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100 flex-1">
                    <div>
                        <p className="text-sm text-gray-600">Tổng số phòng</p>
                        <p className="text-3xl font-bold text-gray-900">{rooms.length}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Đang hoạt động</p>
                            <p className="text-2xl font-bold text-emerald-600">
                                {rooms.filter(r => r.isAvailable).length}
                            </p>
                        </div>
                        <div className="w-px h-12 bg-gray-300"></div>
                        <div>
                            <p className="text-sm text-gray-600">Tạm ẩn</p>
                            <p className="text-2xl font-bold text-gray-400">
                                {rooms.filter(r => !r.isAvailable).length}
                            </p>
                        </div>
                    </div>
                </div>

                {/* View Toggle */}
                <div className="flex items-center gap-2 bg-white rounded-xl p-1.5 border border-gray-200 shadow-sm">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${viewMode === 'grid'
                            ? 'bg-blue-500 text-white shadow-md'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        <span className="text-sm font-medium">Lưới</span>
                    </button>
                    <button
                        onClick={() => setViewMode('table')}
                        className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${viewMode === 'table'
                            ? 'bg-blue-500 text-white shadow-md'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                        <span className="text-sm font-medium">Bảng</span>
                    </button>
                </div>
            </div>

            {/* Rooms Display */}
            {rooms.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <p className="text-gray-500">Chưa có phòng nào</p>
                </div>
            ) : viewMode === 'table' ? (
                /* Table View */
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Phòng</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Giá/Đêm</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Giảm giá</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tiện nghi</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Trạng thái</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {rooms.map((item) => (
                                    <tr key={item._id} className={`hover:bg-gray-50 transition-colors ${!item.isAvailable ? 'opacity-60' : ''}`}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <img
                                                    src={item.images?.[0] || assets.uploadArea}
                                                    alt={item.roomType}
                                                    className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                                                />
                                                <div>
                                                    <p className="font-semibold text-gray-900">{translateRoomType(item.roomType)}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">ID: {item._id.slice(-6)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-blue-600">
                                                {currency}{Number(item.pricePerNight || 0).toLocaleString('vi-VN')}
                                            </p>
                                            {item.discount > 0 && (
                                                <p className="text-xs text-gray-400 line-through">
                                                    {currency}{Math.round(item.pricePerNight / (1 - item.discount / 100)).toLocaleString('vi-VN')}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {item.discount > 0 ? (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                                                    -{item.discount}%
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 text-sm">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1 max-w-xs">
                                                {item.amenities && item.amenities.length > 0 ? (
                                                    <>
                                                        {item.amenities.slice(0, 2).map((amenity, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs"
                                                            >
                                                                {translateAmenity(amenity)}
                                                            </span>
                                                        ))}
                                                        {item.amenities.length > 2 && (
                                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                                                +{item.amenities.length - 2}
                                                            </span>
                                                        )}
                                                    </>
                                                ) : (
                                                    <span className="text-xs text-gray-400">Không có</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={item.isAvailable}
                                                    onChange={() => toggleAvailability(item._id)}
                                                />
                                                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:bg-emerald-500 transition-all duration-300"></div>
                                                <span className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 peer-checked:translate-x-5"></span>
                                            </label>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all text-sm font-medium"
                                                    title="Sửa"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(item)}
                                                    className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all text-sm font-medium"
                                                    title="Xóa"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                /* Grid View */
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {rooms.map((item) => (
                        <div
                            key={item._id}
                            className={`bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-xl transition-all duration-300 group ${!item.isAvailable ? 'border-gray-200 opacity-75' : 'border-gray-100'
                                }`}
                        >
                            {/* Room Image */}
                            <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                                <img
                                    src={item.images?.[0] || assets.uploadArea}
                                    alt={item.roomType}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />

                                {/* Status Badge */}
                                <div className="absolute top-3 left-3">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm ${item.isAvailable
                                        ? 'bg-emerald-500/90 text-white'
                                        : 'bg-gray-500/90 text-white'
                                        }`}>
                                        <span className={`w-2 h-2 rounded-full ${item.isAvailable ? 'bg-white animate-pulse' : 'bg-gray-300'
                                            }`}></span>
                                        {item.isAvailable ? 'Đang hoạt động' : 'Tạm ẩn'}
                                    </span>
                                </div>

                                {/* Discount Badge */}
                                {item.discount > 0 && (
                                    <div className="absolute top-3 right-3">
                                        <span className="bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                                            -{item.discount}%
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Room Info */}
                            <div className="p-5">
                                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                                    {translateRoomType(item.roomType)}
                                </h3>

                                {/* Price */}
                                <div className="mb-4">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-bold text-blue-600">
                                            {currency}{Number(item.pricePerNight || 0).toLocaleString('vi-VN')}
                                        </span>
                                        <span className="text-sm text-gray-500">/ đêm</span>
                                    </div>
                                    {item.discount > 0 && (
                                        <p className="text-xs text-gray-400 line-through mt-1">
                                            {currency}{Math.round(item.pricePerNight / (1 - item.discount / 100)).toLocaleString('vi-VN')}
                                        </p>
                                    )}
                                </div>

                                {/* Amenities */}
                                <div className="mb-4">
                                    <p className="text-xs font-medium text-gray-500 mb-2">Tiện nghi:</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {item.amenities && item.amenities.length > 0 ? (
                                            item.amenities.slice(0, 3).map((amenity, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium"
                                                >
                                                    {translateAmenity(amenity)}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-xs text-gray-400">Không có</span>
                                        )}
                                        {item.amenities && item.amenities.length > 3 && (
                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs">
                                                +{item.amenities.length - 3}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Toggle Availability */}
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-4">
                                    <span className="text-sm font-medium text-gray-700">
                                        {item.isAvailable ? 'Hiển thị phòng' : 'Ẩn phòng'}
                                    </span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={item.isAvailable}
                                            onChange={() => toggleAvailability(item._id)}
                                        />
                                        <div className="w-12 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:bg-emerald-500 transition-all duration-300"></div>
                                        <span className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 peer-checked:translate-x-6"></span>
                                    </label>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(item)}
                                        className="flex-1 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all font-medium text-sm shadow-sm hover:shadow-md"
                                    >
                                        ✏️ Sửa
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(item)}
                                        className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all font-medium text-sm shadow-sm hover:shadow-md"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal xác nhận xóa */}
            <ConfirmModal
                isOpen={!!deleteConfirm}
                onClose={handleCloseDeleteConfirm}
                onConfirm={handleDelete}
                title="Xác nhận xóa phòng"
                message={`Bạn có chắc chắn muốn xóa phòng ${deleteConfirm?.roomTypeLabel || ''}? Hành động này không thể hoàn tác.`}
                confirmText="Xóa"
                variant="danger"
                loading={deleting}
                highlightText={deleteConfirm?.roomTypeLabel || deleteConfirm?.roomType}
            />

            {/* Modal sửa phòng */}
            {editingRoom && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full my-8">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-semibold text-gray-800">Sửa phòng</h2>
                                <button
                                    onClick={handleCloseEdit}
                                    className="text-gray-500 hover:text-gray-700 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all"
                                >
                                    ×
                                </button>
                            </div>

                            {/* Khu vực upload ảnh */}
                            <div className="mt-6">
                                <p className="text-gray-800 font-medium mb-2">Ảnh phòng</p>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {Object.keys(editImages || {}).map((key) => (
                                        <label
                                            htmlFor={`editRoomImage${key}`}
                                            key={key}
                                            className="relative group cursor-pointer"
                                        >
                                            <img
                                                src={
                                                    editImages[key]
                                                        ? typeof editImages[key] === 'string'
                                                            ? editImages[key]
                                                            : URL.createObjectURL(editImages[key])
                                                        : assets.uploadArea
                                                }
                                                alt={`room-upload-${key}`}
                                                className="w-full h-32 object-cover rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-500 transition-all duration-200 group-hover:scale-[1.03]"
                                            />
                                            <input
                                                type="file"
                                                accept="image/*"
                                                id={`editRoomImage${key}`}
                                                hidden
                                                onChange={(e) =>
                                                    setEditImages({ ...editImages, [key]: e.target.files[0] })
                                                }
                                            />
                                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 rounded-xl flex items-center justify-center text-white text-sm transition-all">
                                                Chọn ảnh
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Loại phòng và giá */}
                            <div className="grid sm:grid-cols-2 gap-6 mt-6">
                                <div>
                                    <label className="text-gray-800 font-medium">Loại phòng</label>
                                    <select
                                        value={editForm.roomType}
                                        onChange={(e) =>
                                            setEditForm({ ...editForm, roomType: e.target.value })
                                        }
                                        className="border border-gray-300 mt-2 rounded-lg p-3 w-full text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    >
                                        <option value="">-- Chọn loại phòng --</option>
                                        <option value="Single Bed">{translateRoomType('Single Bed')}</option>
                                        <option value="Double Bed">{translateRoomType('Double Bed')}</option>
                                        <option value="Luxury Room">{translateRoomType('Luxury Room')}</option>
                                        <option value="Family Suite">{translateRoomType('Family Suite')}</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-gray-800 font-medium">
                                        Giá <span className="text-xs text-gray-500">/ đêm</span>
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        className="border border-gray-300 mt-2 rounded-lg p-3 w-full text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        value={editForm.pricePerNight}
                                        onChange={(e) =>
                                            setEditForm({ ...editForm, pricePerNight: e.target.value })
                                        }
                                    />
                                </div>
                            </div>

                            {/* Giảm giá */}
                            <div className="mt-6">
                                <label className="text-gray-800 font-medium">Giảm giá</label>
                                <select
                                    value={editForm.discount}
                                    onChange={(e) =>
                                        setEditForm({ ...editForm, discount: e.target.value })
                                    }
                                    className="border border-gray-300 mt-2 rounded-lg p-3 w-full text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                >
                                    <option value="0">Không giảm giá</option>
                                    <option value="10">10%</option>
                                    <option value="20">20%</option>
                                    <option value="30">30%</option>
                                    <option value="40">40%</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                    Chọn mức giảm giá để phòng xuất hiện trong chương trình giảm giá ngày đông
                                </p>
                            </div>

                            {/* Tiện nghi */}
                            <div className="mt-6">
                                <p className="text-gray-800 font-medium mb-3">Tiện nghi</p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-gray-600">
                                    {Object.keys(editForm.amenities || {}).map((amenity, index) => (
                                        <label
                                            key={index}
                                            className="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={editForm.amenities?.[amenity] || false}
                                                onChange={() =>
                                                    setEditForm({
                                                        ...editForm,
                                                        amenities: {
                                                            ...editForm.amenities,
                                                            [amenity]: !editForm.amenities[amenity],
                                                        },
                                                    })
                                                }
                                                className="accent-blue-500 w-4 h-4"
                                            />
                                            <span className="capitalize">{translateAmenity(amenity)}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Nút Submit */}
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => handleUpdate(editingRoom)}
                                    disabled={loading}
                                    className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:shadow-lg transition-all hover:bg-blue-600 active:scale-[0.98] disabled:opacity-60 font-medium"
                                >
                                    {loading ? 'Đang cập nhật...' : 'Cập nhật'}
                                </button>
                                <button
                                    onClick={handleCloseEdit}
                                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-medium"
                                >
                                    Hủy
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ListRoom