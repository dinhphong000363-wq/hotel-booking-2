import Room from "../models/Room.js";
import Hotel from "../models/Hotel.js";
import Booking from "../models/Booking.js";

// API tìm kiếm thông minh với autocomplete
export const searchHotelsAndRooms = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query || query.trim().length < 2) {
            return res.json({ success: true, hotels: [], rooms: [] });
        }

        const searchRegex = new RegExp(query, "i");

        // Tìm khách sạn theo tên hoặc địa chỉ
        const hotels = await Hotel.find({
            status: "approved",
            $or: [
                { name: searchRegex },
                { city: searchRegex },
                { district: searchRegex },
                { fullAddress: searchRegex },
            ],
        })
            .select("name city district fullAddress")
            .limit(5);

        // Tìm phòng theo loại phòng
        const rooms = await Room.find({
            isAvailable: true,
            roomType: searchRegex,
        })
            .populate({
                path: "hotel",
                match: { status: "approved" },
                select: "name city",
            })
            .select("roomType pricePerNight hotel")
            .limit(5);

        // Lọc bỏ rooms không có hotel (do match filter)
        const validRooms = rooms.filter((room) => room.hotel);

        res.json({ success: true, hotels, rooms: validRooms });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// API tìm kiếm phòng với lọc theo ngày và số khách
export const searchAvailableRooms = async (req, res) => {
    try {
        const { destination, checkIn, checkOut, guests, onlyAvailable } = req.query;

        console.log('🔍 Search params:', { destination, checkIn, checkOut, guests, onlyAvailable });

        // Build query
        let query = { isAvailable: true };
        let hotelQuery = { status: "approved" };

        // Tìm theo điểm đến
        if (destination && destination.trim()) {
            const searchRegex = new RegExp(destination.trim(), "i");
            const matchingHotels = await Hotel.find({
                status: "approved",
                $or: [
                    { name: searchRegex },
                    { city: searchRegex },
                    { district: searchRegex },
                    { address: searchRegex },
                    { fullAddress: searchRegex },
                ],
            }).select("_id");

            console.log('🏨 Found matching hotels:', matchingHotels.length);

            if (matchingHotels.length === 0) {
                // Không tìm thấy khách sạn nào
                return res.json({
                    success: true,
                    rooms: [],
                    total: 0,
                    message: `Không tìm thấy khách sạn nào phù hợp với "${destination}"`
                });
            }

            const hotelIds = matchingHotels.map((h) => h._id.toString());
            query.hotel = { $in: hotelIds };
        }

        // Lấy tất cả phòng phù hợp
        const rooms = await Room.find(query)
            .populate({
                path: "hotel",
                match: hotelQuery,
                select: "name city district address fullAddress",
            })
            .sort({ createdAt: -1 });

        console.log('🛏️ Found rooms before filter:', rooms.length);

        // Lọc bỏ rooms không có hotel
        let validRooms = rooms.filter((room) => room.hotel);

        console.log('🛏️ Valid rooms after filter:', validRooms.length);

        // Kiểm tra availability theo ngày nếu có checkIn và checkOut
        if (checkIn && checkOut) {
            const checkInDate = new Date(checkIn);
            const checkOutDate = new Date(checkOut);

            console.log('📅 Checking availability for dates:', { checkIn, checkOut });

            // Lấy tất cả bookings trong khoảng thời gian
            const bookings = await Booking.find({
                status: { $in: ["pending", "confirmed"] },
                $or: [
                    {
                        checkInDate: { $lte: checkOutDate },
                        checkOutDate: { $gte: checkInDate },
                    },
                ],
            }).select("room checkInDate checkOutDate");

            console.log('📋 Found bookings:', bookings.length);

            // Đếm số lượng booking cho mỗi phòng
            const roomBookingCount = {};
            bookings.forEach((booking) => {
                const roomId = booking.room.toString();
                roomBookingCount[roomId] = (roomBookingCount[roomId] || 0) + 1;
            });

            // Thêm thông tin availability vào mỗi phòng
            validRooms = validRooms.map((room) => {
                const roomObj = room.toObject();
                const bookedCount = roomBookingCount[room._id.toString()] || 0;

                // Giả sử mỗi loại phòng có 5 phòng (có thể điều chỉnh)
                const totalRooms = 5;
                const availableCount = totalRooms - bookedCount;

                roomObj.availableRooms = Math.max(0, availableCount);
                roomObj.totalRooms = totalRooms;
                roomObj.isFullyBooked = availableCount <= 0;

                return roomObj;
            });

            // Lọc chỉ phòng còn trống nếu onlyAvailable = true
            if (onlyAvailable === "true") {
                validRooms = validRooms.filter((room) => !room.isFullyBooked);
                console.log('✅ Available rooms only:', validRooms.length);
            }
        }

        console.log('✨ Final result:', validRooms.length, 'rooms');

        res.json({
            success: true,
            rooms: validRooms,
            total: validRooms.length,
        });
    } catch (error) {
        console.error('❌ Search error:', error);
        res.json({ success: false, message: error.message });
    }
};

// API gợi ý ngày khác nếu phòng đã đầy
export const suggestAlternativeDates = async (req, res) => {
    try {
        const { roomId, checkIn, checkOut } = req.query;

        if (!roomId || !checkIn || !checkOut) {
            return res.json({
                success: false,
                message: "Thiếu thông tin roomId, checkIn hoặc checkOut",
            });
        }

        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const stayDuration = Math.ceil(
            (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)
        );

        // Tìm các khoảng thời gian trống trong vòng 30 ngày
        const suggestions = [];
        const searchRange = 30; // Tìm trong vòng 30 ngày

        for (let i = 1; i <= searchRange; i++) {
            const newCheckIn = new Date(checkInDate);
            newCheckIn.setDate(newCheckIn.getDate() + i);

            const newCheckOut = new Date(newCheckIn);
            newCheckOut.setDate(newCheckOut.getDate() + stayDuration);

            // Kiểm tra xem có booking nào trong khoảng này không
            const conflictBookings = await Booking.countDocuments({
                room: roomId,
                status: { $in: ["pending", "confirmed"] },
                $or: [
                    {
                        checkInDate: { $lte: newCheckOut },
                        checkOutDate: { $gte: newCheckIn },
                    },
                ],
            });

            if (conflictBookings === 0) {
                suggestions.push({
                    checkIn: newCheckIn.toISOString().split("T")[0],
                    checkOut: newCheckOut.toISOString().split("T")[0],
                    daysFromOriginal: i,
                });

                if (suggestions.length >= 3) break; // Chỉ gợi ý 3 ngày
            }
        }

        res.json({
            success: true,
            suggestions,
            originalCheckIn: checkIn,
            originalCheckOut: checkOut,
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
