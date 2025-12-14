import React, { useMemo, useState, useEffect } from 'react'
import { assets, facilityIcons, roomsDummyData } from '../assets/assets'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAppContext } from '../context/AppContext';
import { translateAmenity, translateRoomType } from '../utils/translations';
import Footer from '../components/layout/Footer';
import toast from 'react-hot-toast';
const StaticRating = () => (
    <div className="flex">
        {Array(5)
            .fill(0)
            .map((_, i) => (
                <svg
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="#facc15" // màu vàng
                    className="w-4 h-4"
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.173c.969 0 1.371 1.24.588 1.81l-3.378 2.454a1 1 0 00-.364 1.118l1.287 3.966c.3.921-.755 1.688-1.54 1.118l-3.379-2.454a1 1 0 00-1.175 0l-3.379 2.454c-.784.57-1.838-.197-1.539-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.173a1 1 0 00.95-.69l1.286-3.967z" />
                </svg>
            ))}
    </div>
)
const CheckBox = ({ label, value, selected = false, onChange = () => { } }) => {
    return (
        <label className="flex gap-3 items-center cursor-pointer mt-2 text-sm">
            <input
                type="checkbox"
                checked={selected}
                onChange={(e) => onChange(e.target.checked, value ?? label)}
            />
            <span className="font-light select-none">{label}</span>
        </label>
    );
};
const RadioButton = ({ label, value, selected = false, onChange = () => { } }) => {
    return (
        <label className="flex gap-3 items-center cursor-pointer mt-2 text-sm">
            <input
                type="radio"
                checked={selected}
                name='sortOption'
                onChange={() => onChange(value ?? label)}
            />
            <span className="font-light select-none">{label}</span>
        </label>
    );
};


const AllRooms = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { rooms: defaultRooms, navigate, currency, axios, hotelStatusUpdated } = useAppContext()
    const [rooms, setRooms] = useState(defaultRooms)
    const [loading, setLoading] = useState(false)
    const [openFilters, setOpenFilters] = useState(false)
    const [selectedFilters, setSelectedFilters] = useState({
        roomType: [],
        priceRange: [],
    })
    const [selectedSort, setSelectedSort] = useState('')
    const [showOnlyAvailable, setShowOnlyAvailable] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const roomsPerPage = 6
    const roomTypes = [
        { value: "Single Bed", label: "Phòng một giường" },
        { value: "Double Bed", label: "Phòng giường đôi" },
        { value: "Luxury Room", label: "Phòng cao cấp" },
        { value: "Family Suite", label: "Phòng gia đình" },
    ];
    const priceRanges = [
        { value: '0 to 500', label: '0 - 500' },
        { value: '500 to 1000', label: '500 - 1.000' },
        { value: '1000 to 2000', label: '1.000 - 2.000' },
        { value: '2000 to 3000', label: '2.000 - 3.000' },
    ];

    const sortOptions = [
        { value: "Price Low to High", label: "Giá tăng dần" },
        { value: "Price High to Low", label: "Giá giảm dần" },
        { value: "Newest First", label: "Mới nhất" }
    ];
    // Xử lý các thay đổi cho bộ lọc và sắp xếp
    const handleFilterChange = (checked, value, type) => {
        setSelectedFilters((prevFilters) => {
            const updatedFilters = { ...prevFilters };

            if (checked) {
                updatedFilters[type].push(value);
            } else {
                updatedFilters[type] = updatedFilters[type].filter(
                    (item) => item !== value
                );
            }

            return updatedFilters;
        });
    };
    const handleSortChange = (sortOption) => {
        setSelectedSort(sortOption);
    };

    // Hàm kiểm tra xem phòng có khớp với loại phòng đã chọn hay không
    const matchesRoomType = (room) => {
        return (
            selectedFilters.roomType.length === 0 ||
            selectedFilters.roomType.includes(room.roomType)
        );
    };
    // Chức năng kiểm tra xem phòng có phù hợp với mức giá đã chọn hay không
    const matchesPriceRange = (room) => {
        return (
            selectedFilters.priceRange.length === 0 ||
            selectedFilters.priceRange.some((range) => {
                const [min, max] = range.split(' to ').map(Number);
                return room.pricePerNight >= min && room.pricePerNight <= max;
            })
        );
    };
    // Chức năng sắp xếp phòng dựa trên tùy chọn sắp xếp đã chọn
    const sortRooms = (a, b) => {
        if (selectedSort === 'Price Low to High') {
            return a.pricePerNight - b.pricePerNight;
        }

        if (selectedSort === 'Price High to Low') {
            return b.pricePerNight - a.pricePerNight;
        }

        if (selectedSort === 'Newest First') {
            return new Date(b.createdAt) - new Date(a.createdAt);
        }

        return 0;
    };
    // Lọc và sắp xếp phòng dựa trên bộ lọc đã chọn và tùy chọn sắp xếp
    // Không cần lọc destination nữa vì API đã lọc rồi
    const filteredRooms = useMemo(() => {
        return rooms
            .filter(
                (room) =>
                    matchesRoomType(room) &&
                    matchesPriceRange(room)
            )
            .sort(sortRooms);
    }, [rooms, selectedFilters, selectedSort]);

    // Pagination logic
    const totalPages = Math.ceil(filteredRooms.length / roomsPerPage);
    const indexOfLastRoom = currentPage * roomsPerPage;
    const indexOfFirstRoom = indexOfLastRoom - roomsPerPage;
    const currentRooms = filteredRooms.slice(indexOfFirstRoom, indexOfLastRoom);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedFilters, selectedSort, rooms]);

    // Update rooms when defaultRooms changes (e.g., after hotel info update)
    useEffect(() => {
        setRooms(defaultRooms);
    }, [defaultRooms, hotelStatusUpdated]);

    // Load search results from URL params
    useEffect(() => {
        const loadSearchResults = async () => {
            const destination = searchParams.get('destination');
            const checkIn = searchParams.get('checkIn');
            const checkOut = searchParams.get('checkOut');
            const guests = searchParams.get('guests');
            const onlyAvailable = searchParams.get('onlyAvailable');

            if (destination || checkIn || checkOut) {
                setLoading(true);
                try {
                    const params = new URLSearchParams();
                    if (destination) params.append('destination', destination);
                    if (checkIn) params.append('checkIn', checkIn);
                    if (checkOut) params.append('checkOut', checkOut);
                    if (guests) params.append('guests', guests);
                    if (onlyAvailable) params.append('onlyAvailable', onlyAvailable);

                    const { data } = await axios.get(`/api/search/rooms?${params.toString()}`);

                    if (data.success) {
                        setRooms(data.rooms);
                        setShowOnlyAvailable(onlyAvailable === 'true');
                    }
                } catch (error) {
                    console.error('Search error:', error);
                    toast.error('Lỗi khi tìm kiếm phòng');
                    setRooms(defaultRooms);
                } finally {
                    setLoading(false);
                }
            } else {
                setRooms(defaultRooms);
            }
        };

        loadSearchResults();
    }, [searchParams, defaultRooms, axios]);

    // Xóa tất cả bộ lọc
    const clearFilters = () => {
        setSelectedFilters({
            roomType: [],
            priceRange: [],
        });

        setSelectedSort('');
        setSearchParams({});
        setShowOnlyAvailable(false);
    };




    return (
        <>
            <div className="flex flex-col-reverse lg:flex-row items-start justify-between pt-28 md:pt-36 px-6 md:px-16 lg:px-24 xl:px-36 bg-gradient-to-br from-white to-gray-50 min-h-screen">

                {/* --- DANH SÁCH PHÒNG --- */}
                <div className="flex-1">
                    <div className="flex flex-col items-start text-left mb-10">
                        <h1 className="font-playfair text-4xl md:text-5xl font-semibold text-gray-800 tracking-tight">
                            Phòng khách sạn
                        </h1>
                        <p className="text-sm md:text-base text-gray-500 mt-3 max-w-2xl leading-relaxed">
                            {searchParams.get('destination')
                                ? `Kết quả tìm kiếm cho "${searchParams.get('destination')}" - ${filteredRooms.length} phòng`
                                : 'Hãy tận dụng các ưu đãi có thời hạn và gói đặc biệt của chúng tôi để nâng tầm kỳ nghỉ của bạn và tạo nên những kỷ niệm khó quên.'}
                        </p>
                        <div className="mt-1 w-24 h-[2px] bg-indigo-500 rounded-full"></div>
                    </div>

                    {loading && (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        </div>
                    )}

                    {!loading && filteredRooms.length === 0 && (
                        <div className="text-center py-20">
                            <img src={assets.searchIcon} alt="no results" className="h-20 w-20 mx-auto opacity-30 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">Không tìm thấy phòng</h3>
                            <p className="text-gray-500 mb-6">Thử điều chỉnh bộ lọc hoặc tìm kiếm khác</p>
                            <button
                                onClick={clearFilters}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                Xóa bộ lọc
                            </button>
                        </div>
                    )}

                    {!loading && currentRooms.map((room) => {
                        const hasDiscount = room.discount && room.discount > 0;
                        const discountedPrice = hasDiscount
                            ? room.pricePerNight * (1 - room.discount / 100)
                            : room.pricePerNight;

                        // Availability info
                        const hasAvailabilityInfo = room.availableRooms !== undefined;
                        const isFullyBooked = room.isFullyBooked || false;
                        const availableCount = room.availableRooms || 0;

                        return (
                            <div
                                key={room._id}
                                className="group flex flex-col md:flex-row items-start gap-6 py-10 border-b border-gray-200 last:border-none transition-all duration-300 hover:bg-white/70 hover:shadow-xl rounded-2xl px-4 md:px-6"
                            >
                                <div className="md:w-1/2 relative">
                                    <img
                                        onClick={() => {
                                            navigate(`/rooms/${room._id}`);
                                            scrollTo(0, 0);
                                        }}
                                        src={room.images[0]}
                                        alt="hotel-img"
                                        title="Xem chi tiết phòng"
                                        className="w-full h-72 object-cover rounded-2xl shadow-md cursor-pointer transform group-hover:scale-[1.02] transition-transform duration-500 ease-out"
                                    />
                                    {room.discount > 0 && (
                                        <p className="absolute top-3 right-3 px-3 py-1 text-xs bg-rose-500 text-white font-bold rounded-full shadow-lg">
                                            -{room.discount}%
                                        </p>
                                    )}
                                    {hasAvailabilityInfo && (
                                        <div className="absolute bottom-3 left-3">
                                            {isFullyBooked ? (
                                                <p className="px-3 py-1 text-xs bg-red-500 text-white font-semibold rounded-full shadow-lg">
                                                    Đã đầy
                                                </p>
                                            ) : availableCount <= 2 ? (
                                                <p className="px-3 py-1 text-xs bg-orange-500 text-white font-semibold rounded-full shadow-lg">
                                                    Chỉ còn {availableCount} phòng
                                                </p>
                                            ) : (
                                                <p className="px-3 py-1 text-xs bg-green-500 text-white font-semibold rounded-full shadow-lg">
                                                    Còn {availableCount} phòng
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="md:w-1/2 flex flex-col justify-between gap-4">
                                    <div>
                                        <p className="text-gray-500 text-sm uppercase tracking-wide">{room.hotel?.city || 'N/A'}</p>
                                        <h2
                                            onClick={() => {
                                                navigate(`/rooms/${room._id}`);
                                                scrollTo(0, 0);
                                            }}
                                            className="text-gray-900 text-2xl font-playfair cursor-pointer hover:text-indigo-600 transition-colors"
                                        >
                                            {room.hotel?.name || 'Khách sạn'}
                                        </h2>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {translateRoomType(room.roomType)}
                                        </p>

                                        <div className="flex items-center mt-1">
                                            <StaticRating />
                                            <p className="ml-2 text-gray-500 text-sm">Hơn 200 đánh giá</p>
                                        </div>

                                        <div className="flex items-center gap-2 text-gray-500 mt-3 text-sm">
                                            <img src={assets.locationIcon} alt="location-icon" className="w-4 h-4" />
                                            <span>{room.hotel?.address || 'Địa chỉ không có sẵn'}</span>
                                        </div>
                                    </div>

                                    {/* --- tiện nghi --- */}
                                    <div className="flex flex-wrap items-center mt-4 gap-3">
                                        {room.amenities.map((item, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-50/70 hover:bg-indigo-100 transition-all duration-300"
                                            >
                                                <img src={facilityIcons[item]} alt={item} className="w-5 h-5" />
                                                <p className="text-xs text-gray-700">{translateAmenity(item)}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* --- giá --- */}
                                    <div className="mt-2">
                                        {hasDiscount ? (
                                            <div>
                                                <p className="text-sm text-gray-500 line-through">
                                                    {currency}{Number(room.pricePerNight || 0).toLocaleString('vi-VN')} / đêm
                                                </p>
                                                <p className="text-xl font-semibold text-rose-600">
                                                    {currency}{Number(discountedPrice).toLocaleString('vi-VN')} <span className="text-sm text-gray-500 font-normal">/ đêm</span>
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="text-xl font-semibold text-indigo-600">
                                                {currency}{Number(room.pricePerNight || 0).toLocaleString('vi-VN')} <span className="text-sm text-gray-500 font-normal">/ đêm</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}

                    {/* Pagination Controls */}
                    {!loading && filteredRooms.length > roomsPerPage && (
                        <div className="col-span-full mt-8 flex flex-col items-center gap-4">
                            <div className="flex items-center gap-2">
                                {/* Previous Button */}
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 rounded-lg border-2 border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Trước
                                </button>

                                {/* Page Numbers */}
                                <div className="flex items-center gap-2">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                                        // Show first page, last page, current page, and pages around current
                                        if (
                                            page === 1 ||
                                            page === totalPages ||
                                            (page >= currentPage - 1 && page <= currentPage + 1)
                                        ) {
                                            return (
                                                <button
                                                    key={page}
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`w-10 h-10 rounded-lg font-semibold transition-all ${currentPage === page
                                                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                                                            : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {page}
                                                </button>
                                            );
                                        } else if (
                                            page === currentPage - 2 ||
                                            page === currentPage + 2
                                        ) {
                                            return <span key={page} className="text-gray-400">...</span>;
                                        }
                                        return null;
                                    })}
                                </div>

                                {/* Next Button */}
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 rounded-lg border-2 border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                >
                                    Sau
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>

                            {/* Page Info */}
                            <p className="text-sm text-gray-600">
                                Hiển thị <span className="font-semibold text-gray-800">{indexOfFirstRoom + 1}</span> - <span className="font-semibold text-gray-800">{Math.min(indexOfLastRoom, filteredRooms.length)}</span> trong tổng số <span className="font-semibold text-gray-800">{filteredRooms.length}</span> phòng
                            </p>
                        </div>
                    )}
                </div>

                {/* --- BỘ LỌC --- */}
                <div className="bg-white w-full lg:w-80 border border-gray-200 rounded-2xl shadow-md text-gray-700 mb-10 lg:mb-0 lg:sticky top-24 overflow-hidden">
                    <div
                        className={`flex items-center justify-between px-6 py-3 border-b border-gray-200 ${openFilters && 'bg-gray-50'}`}
                    >
                        <p className="text-base font-medium text-gray-800">Bộ lọc</p>
                        <div className="text-xs cursor-pointer text-indigo-600 font-medium">
                            <span onClick={() => setOpenFilters(!openFilters)} className="lg:hidden">
                                {openFilters ? 'Ẩn' : 'Hiện'}
                            </span>
                            <span
                                onClick={clearFilters}
                                className="hidden lg:block hover:underline"
                            >
                                Xóa tất cả
                            </span>
                        </div>
                    </div>

                    <div
                        className={`${openFilters ? 'h-auto' : 'h-0 lg:h-auto'} overflow-hidden transition-all duration-700 ease-in-out`}
                    >
                        <div className="px-6 pt-6 pb-8 space-y-8">
                            <div>
                                <p className="font-medium text-gray-800 pb-2">Loại phòng</p>
                                <div className="space-y-2">
                                    {roomTypes.map((option, index) => (
                                        <CheckBox
                                            key={index}
                                            label={option.label}
                                            value={option.value}
                                            selected={selectedFilters.roomType.includes(option.value)}
                                            onChange={(checked) => handleFilterChange(checked, option.value, 'roomType')}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div>
                                <p className="font-medium text-gray-800 pb-2">Giá</p>
                                <div className="space-y-2">
                                    {priceRanges.map((range, index) => (
                                        <CheckBox
                                            key={index}
                                            label={`Từ ${currency}${range.label.split(' - ')[0]} đến ${currency}${range.label.split(' - ')[1]}`}
                                            value={range.value}
                                            selected={selectedFilters.priceRange.includes(range.value)}
                                            onChange={(checked) => handleFilterChange(checked, range.value, 'priceRange')}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div>
                                <p className="font-medium text-gray-800 pb-2">Sắp xếp</p>
                                <div className="space-y-2">
                                    {sortOptions.map((option, index) => (
                                        <RadioButton
                                            key={index}
                                            label={option.label}
                                            value={option.value}
                                            selected={selectedSort === option.value}
                                            onChange={() => handleSortChange(option.value)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </>

    )
}

export default AllRooms