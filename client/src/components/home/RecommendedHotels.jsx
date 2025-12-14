import React from 'react'
import HotelCard from '../hotel/HotelCard'
import Title from '../common/Title'
import { useAppContext } from '../../context/AppContext'

const RecommendedHotels = () => {
    const { rooms, navigate } = useAppContext()

    // Lọc các phòng có giảm giá (discount > 0)
    const discountedRooms = rooms.filter(room => room.discount && room.discount > 0)

    // Nếu không có phòng giảm giá thì không hiển thị component này
    if (discountedRooms.length === 0) return null

    return (
        <div className="relative flex flex-col items-center px-6 md:px-16 lg:px-24 bg-gradient-to-b from-white to-slate-50 py-20 overflow-hidden">

            {/* Hiệu ứng nền nhẹ */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(255,228,230,0.3),transparent_60%)] pointer-events-none"></div>

            {/* Tiêu đề */}
            <Title
                title="Chương trình giảm giá ngày đông"
                subTitle="Chương trình giảm giá ngày đông được áp dụng cho các khách sạn được đánh giá cao và được khách hàng tin tưởng."
            />

            {/* Grid danh sách khách sạn */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8 mt-16 w-full z-10">
                {discountedRooms.slice(0, 5).map((room, index) => (
                    <div
                        key={room._id}
                        className="transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-rose-100/50 rounded-2xl"
                    >
                        <HotelCard room={room} index={index} />
                    </div>
                ))}
            </div>

            {/* Nút xem tất cả phòng giảm giá */}
            {discountedRooms.length > 5 && (
                <button
                    onClick={() => {
                        navigate('/discounted-rooms')
                        scrollTo(0, 0)
                    }}
                    className="mt-12 px-8 py-3 text-sm font-semibold tracking-wide 
                        border-2 border-rose-400 rounded-full 
                        bg-white text-rose-600 hover:bg-rose-500 hover:text-white 
                        transition-all shadow-sm hover:shadow-lg transform hover:scale-105"
                >
                    Xem tất cả phòng giảm giá
                </button>
            )}
        </div>
    )
}

export default RecommendedHotels