import React from 'react'
import { assets } from '../../assets/assets'
import { Link } from "react-router-dom";
import { useAppContext } from '../../context/AppContext';


const HotelCard = ({ room, index }) => {
    const { currency } = useAppContext();
    const hasDiscount = room.discount > 0;
    const discountedPrice = hasDiscount
        ? room.pricePerNight * (1 - room.discount / 100)
        : room.pricePerNight;

    return (
        <Link to={`/rooms/${room._id}`} onClick={() => scrollTo(0, 0)}
            className="relative max-w-70 w-full rounded-xl overflow-hidden bg-white text-gray-500/90 shadow-[0px_4px_4px_rgba(0,0,0,0.05)]"
            key={room._id}>
            <img
                src={room.images[0]}
                alt=""
                className="w-full h-48 object-cover rounded-t-xl"
            />

            {/* Badge giảm giá */}
            {hasDiscount && (
                <p className="px-3 py-1 absolute top-3 right-3 text-xs bg-rose-500 text-white font-bold rounded-full shadow-lg">
                    -{room.discount}%
                </p>
            )}

            {!hasDiscount && index % 2 === 0 && (
                <p className="px-3 py-1 absolute top-3 left-3 text-xs bg-white text-gray-800 font-medium rounded-full">
                    Bán chạy
                </p>
            )}

            <div className="p-4 pt-5">
                <div className="flex items-center justify-between">
                    <p className='font-playfair text-xl font-medium text-gray-800 '>{room.hotel?.name || 'Unknown Hotel'}</p>
                    <div className="flex items-center gap-1">
                        <img src={assets.starIconOutlined} alt="star-icon" /> 4.5
                    </div>
                </div>
                <div className='flex items-center gap-1 text-sm'>
                    <img src={assets.locationIcon} alt="location-icon" />
                    <span>{room.hotel?.address || 'Unknown Address'}</span>
                </div>

                <div className='flex items-center justify-between mt-4'>
                    <div>
                        {hasDiscount ? (
                            <div>
                                <p className='text-sm text-gray-500 line-through'>
                                    {currency}{Number(room.pricePerNight || 0).toLocaleString('vi-VN')}
                                </p>
                                <p>
                                    <span className='text-xl text-rose-600 font-semibold'>
                                        {currency}{Number(discountedPrice).toLocaleString('vi-VN')}
                                    </span>
                                    <span className='text-sm text-gray-500'>/đêm</span>
                                </p>
                            </div>
                        ) : (
                            <p>
                                <span className='text-xl text-gray-800'>
                                    {currency}{Number(room.pricePerNight || 0).toLocaleString('vi-VN')}
                                </span>
                                /đêm
                            </p>
                        )}
                    </div>
                    <button
                        className="px-4 py-2 text-sm font-medium 
             border border-gray-300 rounded-lg 
             bg-white text-gray-700
             hover:bg-indigo-500 hover:text-white hover:border-indigo-500
             transition-all duration-300 ease-in-out 
             cursor-pointer hover:scale-105 shadow-sm"
                    >
                        Đặt ngay
                    </button>

                </div>
            </div>
        </Link>
    )
}

export default HotelCard