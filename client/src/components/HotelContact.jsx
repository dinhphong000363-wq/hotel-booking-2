import React, { useState } from 'react'
import { assets } from '../assets/assets'
import toast from 'react-hot-toast'

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

const HotelContact = ({ hotel }) => {
    const [showContactModal, setShowContactModal] = useState(false)

    if (!hotel) return null

    const handleContactClick = () => {
        setShowContactModal(true)
    }

    const handleCopyEmail = () => {
        if (hotel.owner?.email) {
            navigator.clipboard.writeText(hotel.owner.email)
            toast.success('Đã sao chép email')
        }
    }

    const handleCopyPhone = () => {
        if (hotel.contactPhone) {
            navigator.clipboard.writeText(hotel.contactPhone)
            toast.success('Đã sao chép số điện thoại')
        }
    }

    return (
        <>
            <div className="flex flex-col items-start gap-4 px-4 md:px-16 lg:px-24 xl:px-32 py-10 bg-gradient-to-br from-gray-50 to-white rounded-2xl">
                <div className="flex gap-4 items-center">
                    <img
                        src={hotel.owner?.image || assets.userIcon}
                        alt="Host"
                        className="h-16 w-16 md:h-20 md:w-20 rounded-full object-cover border-2 border-indigo-200 shadow-md"
                    />
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Chủ khách sạn</p>
                        <p className="text-lg md:text-xl font-semibold text-gray-800">
                            {hotel.name}
                        </p>
                        <div className="flex items-center mt-1">
                            <StaticRating />
                            <p className="ml-2 text-sm text-gray-600">Hơn 200 đánh giá</p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleContactClick}
                    className="px-6 py-3 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-all cursor-pointer shadow-md hover:shadow-lg flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Liên hệ ngay
                </button>
            </div>

            {/* Contact Modal */}
            {showContactModal && (
                <div
                    className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4"
                    onClick={() => setShowContactModal(false)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-6 text-white">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-semibold">Thông tin liên hệ</h3>
                                <button
                                    onClick={() => setShowContactModal(false)}
                                    className="text-white hover:text-gray-200 text-2xl"
                                >
                                    ×
                                </button>
                            </div>
                            <p className="text-sm text-indigo-100 mt-2">
                                Liên hệ trực tiếp với {hotel.name}
                            </p>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Hotel Owner Info */}
                            <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                                <img
                                    src={hotel.owner?.image || assets.userIcon}
                                    alt="Owner"
                                    className="h-14 w-14 rounded-full object-cover border-2 border-gray-200"
                                />
                                <div>
                                    <p className="font-semibold text-gray-800">{hotel.owner?.username || 'Chủ khách sạn'}</p>
                                    <p className="text-sm text-gray-500">{hotel.name}</p>
                                </div>
                            </div>

                            {/* Email */}
                            {hotel.owner?.email && (
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-100 rounded-full">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Email</p>
                                            <p className="text-sm font-medium text-gray-800">{hotel.owner.email}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleCopyEmail}
                                        className="p-2 hover:bg-gray-200 rounded-lg transition-all"
                                        title="Sao chép email"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </button>
                                </div>
                            )}

                            {/* Phone */}
                            {hotel.contactPhone && (
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-100 rounded-full">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Số điện thoại</p>
                                            <p className="text-sm font-medium text-gray-800">{hotel.contactPhone}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleCopyPhone}
                                        className="p-2 hover:bg-gray-200 rounded-lg transition-all"
                                        title="Sao chép số điện thoại"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </button>
                                </div>
                            )}

                            {/* Address */}
                            {hotel.fullAddress && (
                                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="p-2 bg-orange-100 rounded-full">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500">Địa chỉ</p>
                                        <p className="text-sm font-medium text-gray-800">{hotel.fullAddress}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-3">
                            {hotel.owner?.email && (
                                <a
                                    href={`mailto:${hotel.owner.email}`}
                                    className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all text-center text-sm font-medium"
                                >
                                    Gửi Email
                                </a>
                            )}
                            {hotel.contactPhone && (
                                <a
                                    href={`tel:${hotel.contactPhone}`}
                                    className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-center text-sm font-medium"
                                >
                                    Gọi ngay
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default HotelContact
