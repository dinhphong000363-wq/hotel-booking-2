import React from 'react'
import HotelCard from './HotelCard'
import Title from './Title'
import { useAppContext } from '../conext/AppContext'

const RecommendedHotels = () => {
    const { rooms, navigate } = useAppContext()
    return rooms.length > 0 && (

        <div className="relative flex flex-col items-center px-6 md:px-16 lg:px-24 bg-gradient-to-b from-white to-slate-50 py-20 overflow-hidden">

            {/* Hiệu ứng nền nhẹ */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(255,228,230,0.3),transparent_60%)] pointer-events-none"></div>

            {/* Tiêu đề */}
            <Title
                title="Khách sạn được đề xuất"
                subTitle="Khám phá những điểm đến sang trọng và độc đáo — nơi mỗi kỳ nghỉ đều là một trải nghiệm đáng nhớ."
            />

            {/* Grid danh sách khách sạn */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-16 w-full z-10">
                {rooms.slice(0, 4).map((room, index) => (
                    <div
                        key={room._id}
                        className="transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-rose-100/50 rounded-2xl"
                    >
                        <HotelCard room={room} index={index} />
                    </div>
                ))}
            </div>
        </div>
    )
}

export default RecommendedHotels