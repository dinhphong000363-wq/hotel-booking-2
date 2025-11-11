import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { assets, facilityIcons, roomCommonData, roomsDummyData } from '../assets/assets'
import { useAppContext } from '../conext/AppContext'
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
const RoomsTails = () => {
    const { id } = useParams();
    const { rooms, getToken, axios, navigate } = useAppContext();
    const [room, setRoom] = useState(null);
    const [mainImage, setMainImage] = useState(null);
    const [checkInDate, setCheckInDate] = useState(null);
    const [checkOutDate, setCheckOutDate] = useState(null);
    const [guests, setGuests] = useState(1);
    const [isAvailable, setIsAvailable] = useState(false);
    // ✅ 1. Hàm kiểm tra phòng
    const CheckAvailability = async () => {
        try {
            if (!checkInDate || !checkOutDate) {
                toast.error('Vui lòng chọn ngày nhận và trả phòng');
                return;
            }
            if (checkInDate >= checkOutDate) {
                toast.error('Ngày nhận phòng phải nhỏ hơn Ngày trả phòng');
                return;
            }

            const { data } = await axios.post('/api/bookings/check-availability', {
                room: id,
                checkInDate,
                checkOutDate,
            });

            if (data.success) {
                if (data.isAvailable) {
                    setIsAvailable(true);
                    toast.success('Phòng còn trống, bạn có thể đặt ngay');
                } else {
                    setIsAvailable(false);
                    toast.error('Phòng không có sẵn');
                }
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // ✅ 2. Hàm đặt phòng thực sự
    const handleBooking = async () => {
        try {
            const { data } = await axios.post(
                '/api/bookings/book',
                { room: id, checkInDate, checkOutDate, guests, paymentMethod: 'Pay At Hotel' },
                { headers: { Authorization: `Bearer ${await getToken()}` } }
            );

            if (data.success) {
                toast.success(data.message || 'Đặt phòng thành công');
                navigate('/my-bookings');
                scrollTo(0, 0);
            } else {
                toast.error(data.message || 'Đặt phòng thất bại');
            }
        } catch (error) {
            toast.error(error.message || 'Có lỗi xảy ra khi đặt phòng');
        }
    };

    // ✅ 3. Xử lý khi nhấn nút (check hoặc book)
    const onSubmitHandle = async (e) => {
        e.preventDefault();

        if (!isAvailable) {
            // Nếu chưa kiểm tra hoặc phòng chưa trống → kiểm tra trước
            await CheckAvailability();
        } else {
            // Nếu phòng trống rồi → tiến hành book
            await handleBooking();
        }
    };

    // Load room
    useEffect(() => {
        const r = rooms.find(r => r._id === id);
        if (r) {
            setRoom(r);
            setMainImage(r.images[0]);
        }
    }, [rooms, id]);
    return (
        room && (
            <div className="py-28 md:py-35 px-4 md:px-16 lg:px-24 xl:px-32">
                {/* Room Details */}
                <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
                    <h1 className="text-3xl md:text-4xl font-playfair">
                        {room.hotel.name}{' '}
                        <span className="font-inter text-sm">
                            ({room.roomType})
                        </span>
                    </h1>

                    <p className="text-xs font-inter py-1.5 px-3 text-white bg-orange-500 rounded-full">
                        20% OFF
                    </p>
                </div>

                {/* Room Rating */}
                <div className="flex items-center gap-1 mt-2">
                    <StaticRating />
                    <p className="ml-2">200+ reviews</p>
                </div>

                {/* Room Address */}
                <div className="flex items-center gap-1 text-gray-500 mt-2">
                    <img src={assets.locationIcon} alt="location-icon" />
                    <span>{room.hotel.address}</span>
                </div>

                {/* Images */}
                {/* Image Gallery */}
                <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Ảnh chính bên trái */}
                    <div className="w-full h-[500px]">
                        <img
                            src={mainImage}
                            alt="Main Room"
                            className="w-full h-full rounded-xl object-cover shadow-md"
                        />
                    </div>

                    {/* Lưới ảnh phụ bên phải */}
                    <div className="grid grid-cols-2 grid-rows-2 gap-4 h-[500px]">
                        {room.images.slice(0, 4).map((image, index) => (
                            <img
                                key={index}
                                src={image}
                                onClick={() => setMainImage(image)}
                                alt={`Room ${index}`}
                                className={`w-full h-full object-cover rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.02] ${mainImage === image
                                    ? 'outline outline-[3px] outline-orange-500'
                                    : ''
                                    }`}
                            />
                        ))}
                    </div>
                </div>



                {/* Room Description + Amenities */}
                <div className="flex flex-col md:flex-row md:justify-between mt-10">
                    <div className="flex flex-col">
                        <h1 className="text-3xl md:text-4xl font-playfair">
                            Experience Luxury Like Never Before
                        </h1>

                        <div className="flex flex-wrap items-center mt-3 mb-6 gap-4">
                            {room.amenities.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100"
                                >
                                    <img
                                        src={facilityIcons[item]}
                                        alt={item}
                                        className="w-5 h-5"
                                    />
                                    <p className="text-xs">{item}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Room Price */}
                <p className="text-2xl font-medium mt-6">
                    ${room.pricePerNight} / Night
                </p>
                {/* form */}
                <form
                    onSubmit={onSubmitHandle}
                    className="flex flex-col md:flex-row items-start md:items-center justify-between 
               bg-white shadow-[0px_0px_20px_rgba(0,0,0,0.15)] p-6 rounded-xl 
               mx-auto mt-16 max-w-6xl"
                >
                    <div className="flex flex-col md:flex-row flex-wrap items-start md:items-center 
                    gap-4 md:gap-10 text-gray-500">
                        <div className='flex flex-col'>
                            <label htmlFor="checkInDate" className="font-medium">
                                Check-In
                            </label>
                            <input
                                onChange={(e) => setCheckInDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                type="date"
                                id="checkInDate"
                                placeholder="Check-In"
                                className="w-full rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none"
                                required
                            />
                        </div>
                        <div className='w-px h-15 bg-gray-300/70 max-md:hidden'></div>
                        <div className='flex flex-col'>
                            <label htmlFor="checkOutDate" className="font-medium">
                                Check-Out
                            </label>
                            <input
                                onChange={(e) => setCheckOutDate(e.target.value)}
                                min={checkInDate}
                                disabled={!checkInDate}
                                type="date"
                                id="checkOutDate"
                                placeholder="Check-Out"
                                className="w-full rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none"
                                required
                            />
                        </div>
                        <div className='w-px h-15 bg-gray-300/70 max-md:hidden'></div>
                        <div className='flex flex-col'>
                            <label htmlFor="guests" className="font-medium">
                                Guests
                            </label>
                            <input onChange={(e) => setGuests(e.target.value)} value={guests} type="number" id='guests' placeholder='1' className='max-w-20 rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none' required />
                        </div>
                    </div>
                    <button type='submit' className='bg-primary hover:bg-primary-dull active:scale-95 transition-all text-white rounded-md max-md:w-full max-md:mt-6 md:px-25 py-3 md:py-4 text-base cursor-pointer'>
                        {isAvailable ? 'book now' : 'Check Availability'}
                    </button>
                </form>
                {/* rooms common */}
                <div className="mt-25 space-y-4">
                    {roomCommonData.map((spec, index) => (
                        <div key={index} className="flex items-start gap-2">
                            <img
                                src={spec.icon}
                                alt={`${spec.title}-icon`}
                                className="w-6 h-6"
                            />
                            <div>
                                <p className="text-base">{spec.title}</p>
                                <p className="text-gray-500">{spec.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
                {/* content */}
                <div className='max-w-3x1 border-y border-gray-300 my-15 py-10 text-gray-500'>
                    <p>Khách sẽ được phân bổ ở tầng trệt tùy theo tình trạng phòng trống.
                        Bạn sẽ có một căn hộ hai phòng ngủ thoải mái mang đậm phong cách thành phố.
                        Giá trên áp dụng cho hai khách, vui lòng ghi rõ số lượng khách tại ô dành cho khách để biết giá chính xác cho nhóm.
                        Khách sẽ được phân bổ ở tầng trệt tùy theo tình trạng phòng trống.
                        Bạn sẽ có một căn hộ hai phòng ngủ thoải mái mang đậm phong cách thành phố.</p>
                </div>
                {/* contact */}
                <div className="flex flex-col items-start gap-4">
                    <div className="flex gap-4">
                        <img
                            src={room.hotel.owner.image}
                            alt="Host"
                            className="h-14 w-14 md:h-18 md:w-18 rounded-full"
                        />
                        <div>
                            <p className="text-lg md:text-xl">
                                Hosted by {room.hotel.name}
                            </p>
                            <div className="flex items-center mt-1">
                                <StaticRating />
                                <p className="ml-2">200+ reviews</p>
                            </div>
                        </div>
                    </div>

                    <button
                        className="px-4 py-2.5 mt-4 rounded text-white bg-primary hover:bg-primary-dull transition-all cursor-pointer"
                    >
                        Contact Now
                    </button>
                </div>



            </div>

        )
    )
}

export default RoomsTails
