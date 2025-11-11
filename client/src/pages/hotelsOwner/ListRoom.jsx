import React, { useEffect, useState } from 'react'
import Title from '../../components/Title'
import { useAppContext } from '../../conext/AppContext'
import toast from 'react-hot-toast'

const ListRoom = () => {
    const [rooms, setRooms] = useState([])
    const { axios, getToken, user, currency } = useAppContext();

    //fetch room of the hotel owner
    const fetchRoom = async () => {
        try {
            const token = await getToken(); // ✅ thêm dòng này
            const { data } = await axios.get('/api/rooms/owner', {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (data.success) {
                setRooms(data.rooms || []);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
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
            fetchRoom()
        } else {
            toast.error(data.message)

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
                                <th className="py-4 px-6 text-left font-semibold">Tên phòng</th>
                                <th className="py-4 px-6 text-left font-semibold max-sm:hidden">Tiện nghi</th>
                                <th className="py-4 px-6 text-left font-semibold">Giá / Đêm</th>
                                <th className="py-4 px-6 text-center font-semibold">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rooms.map((item, index) => (
                                <tr
                                    key={index}
                                    className="border-t border-gray-100 hover:bg-slate-50/70 transition-all duration-200"
                                >
                                    <td className="py-4 px-6 text-gray-800 font-medium capitalize">
                                        {item.roomType}
                                    </td>
                                    <td className="py-4 px-6 text-gray-500 max-sm:hidden">
                                        {item.amenities.join(', ')}
                                    </td>
                                    <td className="py-4 px-6 text-gray-700 font-semibold">
                                        {currency} {item.pricePerNight}
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
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Custom scrollbar style */}
            <style jsx>{`
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