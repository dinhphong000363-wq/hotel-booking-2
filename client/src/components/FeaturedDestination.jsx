import React from 'react'
import HotelCard from './HotelCard'
import Title from './Title'
import { useAppContext } from '../conext/AppContext'

const FeaturedDestination = () => {
  const { rooms, navigate } = useAppContext()

  if (rooms.length === 0) return null

  return (
    <section className="flex flex-col items-center px-6 md:px-16 lg:px-24 bg-gradient-to-b from-white to-slate-50 py-24">
      {/* Section Title */}
      <Title
        title="Nơi đến được ưa chuộng"
        subTitle="Khám phá bộ sưu tập bất động sản đặc biệt được tuyển chọn kỹ lưỡng trên khắp thế giới — 
        nơi mang đến sự sang trọng vô song và những trải nghiệm khó quên."
      />

      {/* Grid Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-16 w-full max-w-6xl">
        {rooms.slice(0, 4).map((room, index) => (
          <div
            key={room._id}
            className="
              bg-white rounded-xl shadow-[0_4px_10px_rgba(0,0,0,0.05)] 
              border border-gray-100 overflow-hidden 
              transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)]
            "
          >
            <HotelCard room={room} index={index} />
          </div>
        ))}
      </div>

      {/* See more button */}
      <button
        onClick={() => {
          navigate('/rooms')
          scrollTo(0, 0)
        }}
        className="
          mt-16 px-6 py-3 text-sm font-semibold tracking-wide 
          border border-gray-300 rounded-full 
          bg-white hover:bg-black hover:text-white 
          transition-all shadow-sm hover:shadow-lg
        "
      >
        Xem tất cả các điểm đến
      </button>
    </section>
  )
}

export default FeaturedDestination
