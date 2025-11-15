import React from 'react'
import { useAppContext } from '../conext/AppContext'
import HotelCard from '../components/HotelCard'
import Title from '../components/Title'

const DiscountedRooms = () => {
    const { rooms, navigate, currency } = useAppContext()
    
    // Lọc các phòng có giảm giá (discount > 0)
    const discountedRooms = rooms.filter(room => room.discount && room.discount > 0)

    return (
        <div className="relative flex flex-col items-center px-6 md:px-16 lg:px-24 bg-gradient-to-b from-white to-slate-50 py-20 min-h-screen">
            {/* Hiệu ứng nền nhẹ */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(255,228,230,0.3),transparent_60%)] pointer-events-none"></div>

            {/* Tiêu đề */}
            <Title
                title="Tất cả phòng giảm giá"
                subTitle={`Khám phá ${discountedRooms.length} phòng đang có chương trình giảm giá đặc biệt. Đặt ngay để nhận ưu đãi tốt nhất!`}
            />

            {discountedRooms.length === 0 ? (
                <div className="mt-16 text-center z-10">
                    <p className="text-gray-500 text-lg">Hiện tại không có phòng nào đang giảm giá.</p>
                    <button
                        onClick={() => {
                            navigate('/rooms')
                            scrollTo(0, 0)
                        }}
                        className="mt-6 px-6 py-3 text-sm font-semibold tracking-wide 
                            border-2 border-indigo-400 rounded-full 
                            bg-white text-indigo-600 hover:bg-indigo-500 hover:text-white 
                            transition-all shadow-sm hover:shadow-lg"
                    >
                        Xem tất cả phòng
                    </button>
                </div>
            ) : (
                <>
                    {/* Grid danh sách phòng giảm giá */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-16 w-full z-10">
                        {discountedRooms.map((room, index) => (
                            <div
                                key={room._id}
                                className="transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-rose-100/50 rounded-2xl"
                            >
                                <HotelCard room={room} index={index} />
                            </div>
                        ))}
                    </div>

                    {/* Thống kê */}
                    <div className="mt-12 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg z-10">
                        <p className="text-center text-gray-600">
                            <span className="font-semibold text-rose-600">{discountedRooms.length}</span> phòng đang có chương trình giảm giá
                        </p>
                    </div>
                </>
            )}
        </div>
    )
}

export default DiscountedRooms

