import React from 'react'
import { assets } from '../assets/assets'
import { translateRoomType } from '../utils/translations'

const StaticRating = () => (
    <div className="flex">
        {Array(5)
            .fill(0)
            .map((_, i) => (
                <svg
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="#facc15"
                    className="w-4 h-4"
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.173c.969 0 1.371 1.24.588 1.81l-3.378 2.454a1 1 0 00-.364 1.118l1.287 3.966c.3.921-.755 1.688-1.54 1.118l-3.379-2.454a1 1 0 00-1.175 0l-3.379 2.454c-.784.57-1.838-.197-1.539-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.173a1 1 0 00.95-.69l1.286-3.967z" />
                </svg>
            ))}
    </div>
)

const RelatedRooms = ({ rooms, currentRoomId, navigate, currency }) => {
    const relatedRooms = rooms.filter(r => r._id !== currentRoomId).slice(0, 10)

    if (relatedRooms.length === 0) return null

    return (
        <div className="mt-20 px-4 md:px-16 lg:px-24 xl:px-32 pb-16">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl md:text-3xl font-playfair font-semibold text-gray-800">
                    Các phòng khác
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            const container = document.getElementById('rooms-carousel');
                            container.scrollBy({ left: -400, behavior: 'smooth' });
                        }}
                        className="p-2 rounded-full bg-white border border-gray-300 hover:bg-gray-100 transition-all shadow-sm"
                        aria-label="Scroll left"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={() => {
                            const container = document.getElementById('rooms-carousel');
                            container.scrollBy({ left: 400, behavior: 'smooth' });
                        }}
                        className="p-2 rounded-full bg-white border border-gray-300 hover:bg-gray-100 transition-all shadow-sm"
                        aria-label="Scroll right"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>

            <div
                id="rooms-carousel"
                className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {relatedRooms.map((otherRoom) => {
                    const hasDiscount = otherRoom.discount && otherRoom.discount > 0;
                    const discountedPrice = hasDiscount
                        ? otherRoom.pricePerNight * (1 - otherRoom.discount / 100)
                        : otherRoom.pricePerNight;

                    return (
                        <div
                            key={otherRoom._id}
                            onClick={() => {
                                navigate(`/rooms/${otherRoom._id}`);
                                scrollTo(0, 0);
                            }}
                            className="min-w-[300px] max-w-[300px] bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group"
                        >
                            <div className="relative">
                                <img
                                    src={otherRoom.images[0]}
                                    alt={otherRoom.hotel.name}
                                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                {hasDiscount && (
                                    <p className="absolute top-3 right-3 px-3 py-1 text-xs bg-rose-500 text-white font-bold rounded-full shadow-lg">
                                        -{otherRoom.discount}%
                                    </p>
                                )}
                            </div>

                            <div className="p-4">
                                <p className="text-xs text-gray-500 uppercase tracking-wide">
                                    {otherRoom.hotel.city}
                                </p>
                                <h3 className="text-lg font-semibold text-gray-800 mt-1 line-clamp-1">
                                    {otherRoom.hotel.name}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    {translateRoomType(otherRoom.roomType)}
                                </p>

                                <div className="flex items-center mt-2">
                                    <StaticRating />
                                </div>

                                <div className="flex items-center gap-2 text-gray-500 mt-2 text-xs">
                                    <img src={assets.locationIcon} alt="location" className="w-3 h-3" />
                                    <span className="line-clamp-1">{otherRoom.hotel.address}</span>
                                </div>

                                <div className="mt-3 pt-3 border-t border-gray-200">
                                    {hasDiscount ? (
                                        <div>
                                            <p className="text-xs text-gray-500 line-through">
                                                {currency}{Number(otherRoom.pricePerNight).toLocaleString('vi-VN')}
                                            </p>
                                            <p className="text-lg font-semibold text-rose-600">
                                                {currency}{Number(discountedPrice).toLocaleString('vi-VN')}
                                                <span className="text-xs text-gray-500 font-normal"> / đêm</span>
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-lg font-semibold text-indigo-600">
                                            {currency}{Number(otherRoom.pricePerNight).toLocaleString('vi-VN')}
                                            <span className="text-xs text-gray-500 font-normal"> / đêm</span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    )
}

export default RelatedRooms
