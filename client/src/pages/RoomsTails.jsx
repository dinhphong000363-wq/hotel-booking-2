import React, { useCallback, useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { assets, facilityIcons, roomCommonData } from '../assets/assets'
import { useAppContext } from '../conext/AppContext'
import { translateAmenity, translateRoomType } from '../utils/translations'
import toast from 'react-hot-toast'
import MapWithSearch from '../components/MapWithSearch'
import MapModal from '../components/MapModal'
import HotelContact from '../components/HotelContact'
import RelatedRooms from '../components/RelatedRooms'

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
    const { rooms, getToken, axios, navigate, user, currency } = useAppContext();
    const [room, setRoom] = useState(null);
    const [mainImage, setMainImage] = useState(null);
    const [checkInDate, setCheckInDate] = useState(null);
    const [checkOutDate, setCheckOutDate] = useState(null);
    const [guests, setGuests] = useState(1);
    const [isAvailable, setIsAvailable] = useState(false);
    const [favoriteCount, setFavoriteCount] = useState(0);
    const [isFavorited, setIsFavorited] = useState(false);
    const [favoriteLoading, setFavoriteLoading] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [userRating, setUserRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);
    const [mapExpanded, setMapExpanded] = useState(false);
    const [showMapModal, setShowMapModal] = useState(false);
    const mapSectionRef = useRef(null);
    const averageDisplay = Number(averageRating || 0).toFixed(1);

    const StarIcon = ({ filled, className = "w-5 h-5" }) => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            className={className}
            fill={filled ? "#facc15" : "none"}
            stroke="#facc15"
            strokeWidth="1.5"
        >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.173c.969 0 1.371 1.24.588 1.81l-3.378 2.454a1 1 0 00-.364 1.118l1.287 3.966c.3.921-.755 1.688-1.54 1.118l-3.379-2.454a1 1 0 00-1.175 0l-3.379 2.454c-.784.57-1.838-.197-1.539-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.173a1 1 0 00.95-.69l1.286-3.967z" />
        </svg>
    );
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
            toast.error(error.message || 'Có lỗi xảy ra khi tải thông tin phòng');
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

    const fetchFavorites = useCallback(async () => {
        if (!id) return;

        try {
            const { data } = await axios.get(`/api/favorites/room/${id}`);
            if (data.success) {
                setFavoriteCount(data.count || 0);
            }
        } catch (error) {
            console.error(error);
        }

        if (user) {
            try {
                const token = await getToken();
                const { data: statusData } = await axios.get(`/api/favorites/user/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (statusData.success) {
                    setIsFavorited(statusData.isFavorited);
                }
            } catch (error) {
                console.error(error);
            }
        } else {
            setIsFavorited(false);
        }
    }, [axios, getToken, id, user]);

    const fetchReviews = useCallback(async () => {
        if (!id) return;

        try {
            const { data } = await axios.get(`/api/reviews/room/${id}`);
            if (data.success) {
                setReviews(data.reviews || []);
                setAverageRating(data.averageRating || 0);

                if (user) {
                    const existingReview = data.reviews?.find((review) => review.user?._id === user.id);
                    if (existingReview) {
                        setUserRating(existingReview.rating);
                        setComment(existingReview.comment || '');
                    } else {
                        setUserRating(0);
                        setComment('');
                    }
                } else {
                    setUserRating(0);
                    setComment('');
                }
            }
        } catch (error) {
            console.error(error);
        }
    }, [axios, id, user]);

    const handleToggleFavorite = async () => {
        if (!user) {
            toast.error('Vui lòng đăng nhập để lưu phòng yêu thích');
            return;
        }

        if (favoriteLoading) return;

        setFavoriteLoading(true);
        try {
            const token = await getToken();
            const { data } = await axios.post(
                '/api/favorites/toggle',
                { roomId: id },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (data.success) {
                setIsFavorited(data.isFavorited);
                setFavoriteCount(data.count || 0);
            } else {
                toast.error(data.message || 'Không thể cập nhật yêu thích');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Không thể cập nhật yêu thích');
        } finally {
            setFavoriteLoading(false);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            toast.error('Vui lòng đăng nhập để đánh giá');
            return;
        }

        if (!userRating) {
            toast.error('Vui lòng chọn số sao trước khi gửi');
            return;
        }

        setSubmittingReview(true);
        try {
            const token = await getToken();
            const { data } = await axios.post(
                '/api/reviews',
                { roomId: id, rating: userRating, comment },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (data.success) {
                toast.success(data.message || 'Đã gửi đánh giá');
                setReviews(data.reviews || []);
                setAverageRating(data.averageRating || 0);

                if (user) {
                    const updatedReview = data.reviews?.find((review) => review.user?._id === user.id);
                    if (updatedReview) {
                        setUserRating(updatedReview.rating);
                        setComment(updatedReview.comment || '');
                    }
                }
            } else {
                toast.error(data.message || 'Không thể gửi đánh giá');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Không thể gửi đánh giá');
        } finally {
            setSubmittingReview(false);
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

    useEffect(() => {
        fetchFavorites();
        fetchReviews();
    }, [fetchFavorites, fetchReviews]);
    if (!room) return null;

    return (
        <>
            <div className="py-28 md:py-35 px-4 md:px-16 lg:px-24 xl:px-32">
                {/* Room Details */}
                <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
                    <h1 className="text-3xl md:text-4xl font-playfair">
                        {room.hotel.name}{' '}
                        <span className="font-inter text-sm">
                            ({translateRoomType(room.roomType)})
                        </span>
                    </h1>

                    {room.discount && room.discount > 0 && (
                        <p className="text-xs font-inter py-1.5 px-3 text-white bg-rose-500 rounded-full font-bold shadow-lg">
                            Giảm {room.discount}%
                        </p>
                    )}
                </div>

                {/* Room Rating */}
                <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((value) => (
                            <StarIcon
                                key={value}
                                filled={value <= Math.round(averageRating)}
                                className="w-4 h-4"
                            />
                        ))}
                    </div>
                    <p className="text-sm text-gray-600">
                        {reviews.length > 0
                            ? `${averageDisplay}/5 · ${reviews.length} đánh giá`
                            : 'Chưa có đánh giá'}
                    </p>
                </div>

                {/* Favorite */}
                <div className="flex items-center gap-3 mt-4">
                    <button
                        type="button"
                        onClick={handleToggleFavorite}
                        disabled={favoriteLoading}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all cursor-pointer ${isFavorited
                            ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-200/60 hover:bg-red-600'
                            : 'border-gray-300 text-gray-600 hover:bg-gray-100'
                            } ${favoriteLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            className="w-5 h-5"
                            fill={isFavorited ? "#fff" : "none"}
                            stroke={isFavorited ? "#fff" : "#ef4444"}
                            strokeWidth="1.8"
                        >
                            <path d="M16.5 3a5.5 5.5 0 00-4.5 2.364A5.5 5.5 0 007.5 3 5.5 5.5 0 002 8.5c0 6.364 9.056 12.086 9.427 12.323a1 1 0 001.146 0C12.944 20.586 22 14.864 22 8.5A5.5 5.5 0 0016.5 3z" />
                        </svg>
                        <span>{favoriteLoading ? 'Đang lưu...' : isFavorited ? 'Đã yêu thích' : 'Yêu thích'}</span>
                        <span className="text-xs font-medium opacity-80">
                            ({favoriteCount})
                        </span>
                    </button>
                    <p className="text-sm text-gray-500">
                        {favoriteCount > 0
                            ? `${favoriteCount} người đã yêu thích phòng này`
                            : 'Hãy là người đầu tiên yêu thích phòng này'}
                    </p>
                </div>

                {/* Room Address */}
                <div className="flex items-center gap-2 text-gray-500 mt-2">
                    <img src={assets.locationIcon} alt="location-icon" className="w-4 h-4" />
                    <span
                        className="cursor-pointer hover:text-indigo-600 transition-colors"
                        onClick={() => {
                            if (mapSectionRef.current) {
                                mapSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                setTimeout(() => {
                                    setMapExpanded(true);
                                }, 500);
                            }
                        }}
                    >
                        {room.hotel.fullAddress || room.hotel.address}
                    </span>
                    <button
                        onClick={() => {
                            const address = encodeURIComponent(room.hotel.fullAddress || room.hotel.address);
                            window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
                        }}
                        className="ml-2 px-3 py-1 text-xs bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-all flex items-center gap-1"
                        title="Mở Google Maps"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Mở Maps
                    </button>
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
                                    ? 'ring-2 ring-orange-500'
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
                            Trải nghiệm đẳng cấp chưa từng có
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
                                    <p className="text-xs">{translateAmenity(item)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Room Price */}
                <div className="mt-6">
                    {room.discount && room.discount > 0 ? (
                        <div>
                            <p className="text-lg text-gray-500 line-through">
                                {currency}{Number(room.pricePerNight || 0).toLocaleString('vi-VN')} / đêm
                            </p>
                            <p className="text-2xl font-semibold text-rose-600 mt-1">
                                {currency}{Number(room.pricePerNight * (1 - room.discount / 100)).toLocaleString('vi-VN')} / đêm
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                                Tiết kiệm {currency}{Number(room.pricePerNight * (room.discount / 100)).toLocaleString('vi-VN')} mỗi đêm
                            </p>
                        </div>
                    ) : (
                        <p className="text-2xl font-medium">
                            {currency}{Number(room.pricePerNight || 0).toLocaleString('vi-VN')} / đêm
                        </p>
                    )}
                </div>
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
                                Ngày nhận phòng
                            </label>
                            <input
                                onChange={(e) => setCheckInDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                type="date"
                                id="checkInDate"
                                placeholder="Ngày nhận phòng"
                                className="w-full rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none"
                                required
                            />
                        </div>
                        <div className='w-px h-15 bg-gray-300/70 max-md:hidden'></div>
                        <div className='flex flex-col'>
                            <label htmlFor="checkOutDate" className="font-medium">
                                Ngày trả phòng
                            </label>
                            <input
                                onChange={(e) => setCheckOutDate(e.target.value)}
                                min={checkInDate}
                                disabled={!checkInDate}
                                type="date"
                                id="checkOutDate"
                                placeholder="Ngày trả phòng"
                                className="w-full rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none"
                                required
                            />
                        </div>
                        <div className='w-px h-15 bg-gray-300/70 max-md:hidden'></div>
                        <div className='flex flex-col'>
                            <label htmlFor="guests" className="font-medium">
                                Số khách
                            </label>
                            <input onChange={(e) => setGuests(e.target.value)} value={guests} type="number" id='guests' placeholder='1' className='max-w-20 rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none' required />
                        </div>
                    </div>
                    <button type='submit' className='bg-primary hover:bg-primary-dull active:scale-95 transition-all text-white rounded-md max-md:w-full max-md:mt-6 md:px-25 py-3 md:py-4 text-base cursor-pointer'>
                        {isAvailable ? 'Đặt ngay' : 'Kiểm tra tình trạng'}
                    </button>
                </form>

                {/* Reviews */}
                <section className="mt-16">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <h2 className="text-2xl font-semibold text-gray-800">Đánh giá & bình luận</h2>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((value) => (
                                    <StarIcon
                                        key={value}
                                        filled={value <= Math.round(averageRating)}
                                        className="w-4 h-4"
                                    />
                                ))}
                            </div>
                            <span className="text-sm text-gray-500">
                                {reviews.length > 0
                                    ? `${averageDisplay}/5 · ${reviews.length} đánh giá`
                                    : 'Chưa có đánh giá'}
                            </span>
                        </div>
                    </div>

                    {reviews.length > 0 ? (
                        <div className="mt-6 space-y-4">
                            {reviews.map((review) => (
                                <div
                                    key={review._id}
                                    className="border border-gray-200 rounded-2xl p-5 bg-white shadow-[0_6px_20px_rgba(15,23,42,0.08)]"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={review.user?.image || assets.userIcon}
                                                alt={review.user?.username || 'Ẩn danh'}
                                                className="w-12 h-12 rounded-full object-cover border border-gray-200"
                                            />
                                            <div>
                                                <p className="font-medium text-gray-800">
                                                    {review.user?.username || 'Ẩn danh'}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map((value) => (
                                                <StarIcon
                                                    key={value}
                                                    filled={value <= review.rating}
                                                    className="w-4 h-4"
                                                />
                                            ))}
                                            <span className="ml-2 text-sm font-medium text-gray-600">
                                                {review.rating}/5
                                            </span>
                                        </div>
                                    </div>
                                    {review.comment && (
                                        <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                                            {review.comment}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="mt-6 text-sm text-gray-500 bg-gray-50 border border-dashed border-gray-200 rounded-2xl px-4 py-6 text-center">
                            Chưa có đánh giá nào cho phòng này. Hãy là người đầu tiên chia sẻ trải nghiệm của bạn!
                        </p>
                    )}

                    <div className="mt-8 border border-indigo-100 rounded-2xl p-6 bg-white shadow-[0_10px_30px_rgba(79,70,229,0.08)]">
                        {user ? (
                            <form className="space-y-5" onSubmit={handleReviewSubmit}>
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Đánh giá của bạn</p>
                                    <div className="flex items-center gap-2 mt-3">
                                        {[1, 2, 3, 4, 5].map((value) => (
                                            <button
                                                key={value}
                                                type="button"
                                                onClick={() => setUserRating(value)}
                                                className="focus:outline-none"
                                            >
                                                <StarIcon
                                                    filled={value <= userRating}
                                                    className={`w-7 h-7 transition-transform ${value <= userRating ? 'scale-105' : 'opacity-60 hover:opacity-100'
                                                        }`}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        rows={4}
                                        placeholder="Chia sẻ trải nghiệm của bạn (tối đa 300 ký tự)..."
                                        maxLength={300}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                    />
                                </div>
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                    <button
                                        type="submit"
                                        disabled={submittingReview}
                                        className="px-6 py-2.5 bg-indigo-600 text-white rounded-full text-sm font-semibold shadow-md hover:bg-indigo-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {submittingReview
                                            ? 'Đang gửi...'
                                            : userRating > 0
                                                ? 'Lưu đánh giá'
                                                : 'Gửi đánh giá'}
                                    </button>
                                    {userRating > 0 && (
                                        <span className="text-xs text-gray-500">
                                            Bạn đã chọn {userRating} sao cho phòng này
                                        </span>
                                    )}
                                </div>
                            </form>
                        ) : (
                            <div className="text-sm text-gray-600 bg-indigo-50 border border-indigo-100 px-4 py-3 rounded-xl">
                                Vui lòng đăng nhập để viết đánh giá và bình luận.
                            </div>
                        )}
                    </div>
                </section>

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

                {/* Map Section */}
                <div ref={mapSectionRef} className="mt-16">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Vị trí</h2>
                    <div className="relative">
                        <MapWithSearch
                            address={room.hotel.fullAddress || room.hotel.address}
                            isExpanded={mapExpanded}
                        />
                        <div className="absolute bottom-4 right-4 flex gap-2 z-[1000]">
                            <button
                                onClick={() => setShowMapModal(true)}
                                className="px-4 py-2 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition-all flex items-center gap-2 text-sm font-medium text-gray-700"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                </svg>
                                Xem lớn hơn
                            </button>
                            <button
                                onClick={() => {
                                    const address = encodeURIComponent(room.hotel.fullAddress || room.hotel.address);
                                    window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
                                }}
                                className="px-4 py-2 bg-indigo-500 text-white rounded-lg shadow-lg hover:bg-indigo-600 transition-all flex items-center gap-2 text-sm font-medium"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                Mở Google Maps
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <HotelContact hotel={room.hotel} />

            <RelatedRooms
                rooms={rooms}
                currentRoomId={id}
                navigate={navigate}
                currency={currency}
            />

            <MapModal
                isOpen={showMapModal}
                onClose={() => setShowMapModal(false)}
                address={room.hotel.fullAddress || room.hotel.address}
            />
        </>
    )
}

export default RoomsTails
