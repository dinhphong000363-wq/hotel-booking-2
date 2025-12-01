import React, { useEffect, useState } from 'react'
import Title from '../../components/Title'
import { useAppContext } from '../../conext/AppContext'
import toast from 'react-hot-toast'
import { assets } from '../../assets/assets'
import ConfirmModal from '../../components/ConfirmModal'
import { translateAmenity, translateRoomType } from '../../utils/translations'

const ListRoom = () => {
    const [rooms, setRooms] = useState([])
    const [editingRoom, setEditingRoom] = useState(null)
    const [deleteConfirm, setDeleteConfirm] = useState(null) // { roomId, roomType }
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
    const { axios, getToken, user, currency, fetchRooms } = useAppContext();

    //fetch room of the hotel owner
    const fetchRoom = async () => {
        try {
            const token = await getToken(); // ✅ thêm dòng này
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
    // Chuyển đổi tình trạng phòng trống
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

    // Mở modal xác nhận xóa
    const handleDeleteClick = (room) => {
        setDeleteConfirm({ roomId: room._id, roomType: room.roomType, roomTypeLabel: translateRoomType(room.roomType) });
    }

    // Đóng modal xác nhận xóa
    const handleCloseDeleteConfirm = () => {
        setDeleteConfirm(null);
    }

    // Xóa phòng
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

    // Mở form sửa phòng
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
        // Set existing images
        const imageObj = {};
        room.images?.forEach((img, index) => {
            if (index < 4) {
                imageObj[index + 1] = img;
            }
        });
        setEditImages(imageObj);
    }

    // Đóng form sửa
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

    // Cập nhật phòng
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

            // Chỉ thêm ảnh mới nếu có
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
    }, [user])

    return (
        <div className="relative">
            <Title
                align="left"
                font="outfit"
                title="Danh sách phòng"
                subTitle="Quản lý tất cả các phòng đang được niêm yết — bạn có thể chỉnh sửa, cập nhật tình trạng, hoặc tạm ẩn khi cần."
            />

            <p className="text-gray-600 mt-8 font-medium tracking-wide">Tất cả phòng</p>

            <div className="w-full max-w-5xl bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl shadow-md overflow-hidden mt-4">
                <div className="overflow-y-auto max-h-96 custom-scrollbar">
                    <table className="w-full border-collapse">
                        <thead className="bg-gradient-to-r from-slate-100 to-slate-50 text-gray-800 sticky top-0 z-10">
                            <tr>
                                <th className="py-4 px-6 text-left font-semibold">Hình ảnh</th>
                                <th className="py-4 px-6 text-left font-semibold">Tên phòng</th>
                                <th className="py-4 px-6 text-left font-semibold max-sm:hidden">Tiện nghi</th>
                                <th className="py-4 px-6 text-left font-semibold">Giá / Đêm</th>
                                <th className="py-4 px-6 text-center font-semibold">Trạng thái</th>
                                <th className="py-4 px-6 text-center font-semibold">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rooms.map((item, index) => (
                                <tr
                                    key={index}
                                    className="border-t border-gray-100 hover:bg-slate-50/70 transition-all duration-200"
                                >
                                    <td className="py-4 px-6">
                                        <img
                                            src={item.images?.[0] || assets.uploadArea}
                                            alt={item.roomType}
                                            className="w-20 h-20 object-cover rounded-lg shadow-sm"
                                        />
                                    </td>
                                    <td className="py-4 px-6 text-gray-800 font-medium capitalize">
                                        {translateRoomType(item.roomType)}
                                    </td>
                                    <td className="py-4 px-6 text-gray-500 max-sm:hidden">
                                        {item.amenities?.map(translateAmenity).join(', ') || 'Không có'}
                                    </td>
                                    <td className="py-4 px-6 text-gray-700 font-semibold">
                                        {currency} {Number(item.pricePerNight || 0).toLocaleString('vi-VN')}
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        {/* Toggle switch đẹp lung linh */}
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={item.isAvailable}
                                                onChange={() => toggleAvailability(item._id)}
                                            />
                                            <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:bg-blue-600 transition-all duration-300"></div>
                                            <span className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 peer-checked:translate-x-6"></span>
                                        </label>
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="px-3 py-1.5 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all cursor-pointer"
                                            >
                                                Sửa
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(item)}
                                                className="px-3 py-1.5 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all cursor-pointer"
                                            >
                                                Xóa
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

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
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-semibold text-gray-800">Sửa phòng</h2>
                                <button
                                    onClick={handleCloseEdit}
                                    className="text-gray-500 hover:text-gray-700 text-2xl"
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
                                                className="w-full h-32 object-cover rounded-xl border-2 border-dashed border-gray-300 hover:border-primary transition-all duration-200 group-hover:scale-[1.03]"
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
                                        className="border border-gray-300 mt-2 rounded-lg p-3 w-full text-gray-700 focus:ring-2 focus:ring-primary outline-none transition-all"
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
                                        className="border border-gray-300 mt-2 rounded-lg p-3 w-full text-gray-700 focus:ring-2 focus:ring-primary outline-none transition-all"
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
                                    className="border border-gray-300 mt-2 rounded-lg p-3 w-full text-gray-700 focus:ring-2 focus:ring-primary outline-none transition-all"
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
                                            className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
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
                                                className="accent-primary w-4 h-4"
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
                                    className="flex-1 px-6 py-3 bg-primary text-white rounded-lg shadow-md hover:shadow-lg transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60"
                                >
                                    {loading ? 'Đang cập nhật...' : 'Cập nhật'}
                                </button>
                                <button
                                    onClick={handleCloseEdit}
                                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
                                >
                                    Hủy
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom scrollbar style */}
            <style>{`
            .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: rgba(156, 163, 175, 0.5);
            border-radius: 9999px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background-color: rgba(107, 114, 128, 0.7);
            }
        `}</style>
        </div>


    )
}

export default ListRoom