import transporter from "../config/nodemailer.js";
import Booking from "../models/Booking.js";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import Notification from "../models/Notification.js";

// Chức năng kiểm tra tình trạng phòng trống
const checkAvailability = async ({ checkInDate, checkOutDate, room }) => {
    try {
        const bookings = await Booking.find({
            room,
            checkInDate: { $lte: checkOutDate },
            checkOutDate: { $gte: checkInDate },
        });

        const isAvailable = bookings.length === 0;
        return isAvailable;
    } catch (error) {
        console.error(error.message);
    }
};
// API để kiểm tra tình trạng phòng trống
// POST /api/bookings/check-availability
export const checkAvailabilityAPI = async (req, res) => {
    try {
        const { room, checkInDate, checkOutDate } = req.body;

        const isAvailable = await checkAvailability({
            checkInDate,
            checkOutDate,
            room,
        });

        res.json({ success: true, isAvailable });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
// API để tạo một đặt phòng mới
// POST /api/bookings/book
export const createBooking = async (req, res) => {
    try {
        const { room, checkInDate, checkOutDate, guests } = req.body;
        const user = req.user._id;

        // Before booking, check availability
        const isAvailable = await checkAvailability({
            checkInDate,
            checkOutDate,
            room,
        });
        if (!isAvailable) {
            return res.json({ success: false, message: "Phòng không có sẵn" });
        }

        // Lấy totalPrice từ Room
        const roomData = await Room.findById(room).populate("hotel");

        // Tính giá sau khi áp dụng discount (nếu có)
        let pricePerNight = roomData.pricePerNight;
        if (roomData.discount && roomData.discount > 0) {
            pricePerNight = roomData.pricePerNight * (1 - roomData.discount / 100);
        }

        // Tính tổng giá dựa trên số đêm
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const timeDiff = checkOut.getTime() - checkIn.getTime();

        const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
        const totalPrice = pricePerNight * nights;
        const booking = await Booking.create({
            user,
            room,
            hotel: roomData.hotel._id,
            guests: +guests,
            checkInDate,
            checkOutDate,
            totalPrice,
        });
        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: req.user.email,
            subject: 'Hotel Booking Detail',
            html: `
                        <h2>Your Booking Details</h2>
            <p>Dear ${req.user.username},</p>
            <p>Thank you for your booking! Here are your details:</p>
            <ul>
            <li>
                <strong>Booking ID:</strong> ${booking._id}
            </li>
            <li>
                <strong>Hotel Name:</strong> ${roomData.hotel.name}
            </li>
            <li>
                <strong>Location:</strong> ${roomData.hotel.address}
            </li>
            <li>
                <strong>Date:</strong> ${booking.checkInDate.toDateString()}
            </li>
            <li>
                <strong>Booking Amount:</strong> 
                ${(process.env.CURRENCY || '$')} ${booking.totalPrice} /night
            </li>
            </ul>
            <p>Chúng tôi rất mong được chào đón bạn!</p>
            <p>Nếu bạn cần thực hiện bất kỳ thay đổi nào, vui lòng liên hệ với chúng tôi.</p>
            `
        }
        await transporter.sendMail(
            mailOption
        )

        // Create notification for hotel owner
        const hotel = await Hotel.findById(roomData.hotel._id).populate("owner");
        if (hotel && hotel.owner) {
            await Notification.create({
                user: hotel.owner._id,
                type: "booking_new",
                title: "Đặt phòng mới",
                message: `Có đặt phòng mới từ ${req.user.username} cho phòng ${roomData.roomType}`,
                relatedId: booking._id.toString(),
            });
        }

        res.json({ success: true, message: "Đã tạo đặt phòng thành công" })


    } catch (error) {
        console.log(error)
        res.json({ success: false, message: "Không thể tạo đặt phòng" })

    }
};
// API để lấy tất cả các đặt phòng của người dùng
// GET /api/bookings/user
export const getUserBookings = async (req, res) => {
    try {
        const user = req.user._id;

        const bookings = await Booking.find({ user })
            .populate("room hotel")
            .sort({ createdAt: -1 });

        res.json({ success: true, bookings });
    } catch (error) {
        res.json({ success: false, message: "Không thể tải danh sách đặt phòng" });
    }
};
// Owner: list bookings of hotels the owner owns with filters
export const getHotelBookings = async (req, res) => {
    try {
        const ownerId = req.user._id;
        const { status, from, to } = req.query;

        // Find all approved hotels owned by this owner
        const hotels = await Hotel.find({ owner: ownerId });

        if (!hotels || hotels.length === 0) {
            return res.json({ success: false, message: "Không tìm thấy khách sạn" });
        }

        const hotelIds = hotels.map(h => h._id.toString());

        const filter = { hotel: { $in: hotelIds } };
        if (status) {
            filter.status = status;
        }
        if (from || to) {
            filter.checkInDate = {};
            if (from) filter.checkInDate.$gte = new Date(from);
            if (to) filter.checkInDate.$lte = new Date(to);
        }

        const bookings = await Booking.find(filter)
            .populate("room hotel user")
            .sort({ createdAt: -1 });

        // Total bookings
        const totalBookings = bookings.length;

        // Total revenue
        const totalRevenue = bookings.reduce((acc, booking) => acc + booking.totalPrice, 0);

        res.json({
            success: true,
            bookings,
            metrics: { totalBookings, totalRevenue },
        });
    } catch (error) {
        res.json({
            success: false,
            message: "Không thể tải danh sách đặt phòng"
        });
    }
};

// Owner: update booking status (confirm, cancel, complete)
export const updateBookingStatus = async (req, res) => {
    try {
        const ownerId = req.user._id;
        const { id } = req.params;
        const { status } = req.body; // expected: confirmed | cancelled | completed

        if (!["confirmed", "cancelled", "completed"].includes(status)) {
            return res.json({ success: false, message: "Trạng thái không hợp lệ" });
        }

        const booking = await Booking.findById(id);
        if (!booking) {
            return res.json({ success: false, message: "Đặt phòng không tồn tại" });
        }

        const hotel = await Hotel.findById(booking.hotel);
        if (!hotel || hotel.owner.toString() !== ownerId.toString()) {
            return res.json({ success: false, message: "Không có quyền truy cập" });
        }

        // Business rules: cannot confirm/cancel after completed
        if (booking.status === "completed") {
            return res.json({ success: false, message: "Đặt phòng đã hoàn thành" });
        }

        // Kiểm tra khi chuyển sang completed: phải đã thanh toán
        if (status === "completed" && !booking.isPaid) {
            return res.json({ success: false, message: "Không thể hoàn thành: Khách hàng chưa thanh toán" });
        }

        booking.status = status;
        await booking.save();

        // Populate đầy đủ thông tin trước khi trả về
        await booking.populate("user", "username email");
        await booking.populate("room", "images roomType");
        await booking.populate("hotel", "name");

        // Create notification for user about status change
        if (booking.user) {
            const statusMessages = {
                confirmed: "Đặt phòng của bạn đã được xác nhận",
                cancelled: "Đặt phòng của bạn đã bị hủy",
                completed: "Đặt phòng của bạn đã hoàn thành",
            };

            await Notification.create({
                user: booking.user._id,
                type: `booking_${status}`,
                title: "Cập nhật trạng thái đặt phòng",
                message: statusMessages[status] || "Trạng thái đặt phòng đã được cập nhật",
                relatedId: booking._id.toString(),
            });
        }

        res.json({ success: true, message: "Đã cập nhật trạng thái", booking });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// API để cập nhật thông tin booking (payment status, payment method)
// PATCH /api/bookings/:id
export const updateBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const { isPaid, paymentMethod } = req.body;

        // Tìm booking và kiểm tra xem nó có thuộc về user này không
        const booking = await Booking.findById(id);

        if (!booking) {
            return res.json({ success: false, message: "Booking not found" });
        }

        // Kiểm tra xem booking có thuộc về user này không
        if (booking.user.toString() !== userId.toString()) {
            return res.json({ success: false, message: "Unauthorized to update this booking" });
        }

        // Cập nhật các trường được cho phép
        if (isPaid !== undefined) {
            booking.isPaid = isPaid;
            // Tự động chuyển status sang confirmed khi thanh toán thành công
            if (isPaid === true && booking.status === 'pending') {
                booking.status = 'confirmed';
            }
        }
        if (paymentMethod) {
            booking.paymentMethod = paymentMethod;
        }

        await booking.save();

        res.json({ success: true, message: "Booking updated successfully", booking });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Failed to update booking" });
    }
};

// API để xóa một đặt phòng
// DELETE /api/bookings/:id
export const deleteBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        // Tìm booking và kiểm tra xem nó có thuộc về user này không
        const booking = await Booking.findById(id);

        if (!booking) {
            return res.json({ success: false, message: "Booking not found" });
        }

        // Kiểm tra xem booking có thuộc về user này không
        if (booking.user.toString() !== userId.toString()) {
            return res.json({ success: false, message: "Unauthorized to delete this booking" });
        }

        // Xóa booking
        await Booking.findByIdAndDelete(id);

        res.json({ success: true, message: "Booking deleted successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Failed to delete booking" });
    }
};

// API để hủy đặt phòng (Customer)
// POST /api/bookings/:id/cancel
export const cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const { cancellationReason } = req.body;

        // Tìm booking
        const booking = await Booking.findById(id).populate("room hotel user");

        if (!booking) {
            return res.json({ success: false, message: "Đặt phòng không tồn tại" });
        }

        // Kiểm tra quyền hủy
        if (booking.user._id.toString() !== userId.toString()) {
            return res.json({ success: false, message: "Không có quyền hủy đặt phòng này" });
        }

        // Kiểm tra điều kiện hủy
        if (booking.status === "cancelled") {
            return res.json({ success: false, message: "Đặt phòng đã được hủy trước đó" });
        }

        if (booking.status === "completed") {
            return res.json({ success: false, message: "Không thể hủy đặt phòng đã hoàn thành" });
        }

        // Kiểm tra không hủy sau khi check-in
        const now = new Date();
        const checkInDate = new Date(booking.checkInDate);

        if (now >= checkInDate) {
            return res.json({ success: false, message: "Không thể hủy sau ngày nhận phòng" });
        }

        // Tính chính sách hoàn tiền
        const hoursUntilCheckIn = (checkInDate - now) / (1000 * 60 * 60);
        let refundPercentage = 0;

        if (hoursUntilCheckIn >= 168) { // 7 ngày
            refundPercentage = 100;
        } else if (hoursUntilCheckIn >= 72) { // 3 ngày
            refundPercentage = 50;
        } else if (hoursUntilCheckIn >= 24) { // 1 ngày
            refundPercentage = 25;
        } else {
            refundPercentage = 0;
        }

        // Tính số tiền hoàn (chỉ nếu đã thanh toán)
        const refundAmount = booking.isPaid ? (booking.totalPrice * refundPercentage) / 100 : 0;

        // Cập nhật booking
        booking.status = "cancelled";
        booking.cancelledAt = now;
        booking.cancelledBy = userId;
        booking.cancellationReason = cancellationReason || "";
        booking.refundAmount = refundAmount;
        booking.refundPercentage = refundPercentage;

        await booking.save();

        // Gửi email cho khách hàng
        const mailOptionCustomer = {
            from: process.env.SENDER_EMAIL,
            to: booking.user.email,
            subject: "Xác nhận hủy đặt phòng",
            html: `
                <h2>Đặt phòng đã được hủy</h2>
                <p>Xin chào ${booking.user.username},</p>
                <p>Đặt phòng của bạn đã được hủy thành công.</p>
                <ul>
                    <li><strong>Mã đặt phòng:</strong> ${booking._id}</li>
                    <li><strong>Khách sạn:</strong> ${booking.hotel.name}</li>
                    <li><strong>Ngày nhận phòng:</strong> ${checkInDate.toLocaleDateString('vi-VN')}</li>
                    <li><strong>Tổng tiền:</strong> ${booking.totalPrice.toLocaleString('vi-VN')} VND</li>
                    <li><strong>Số tiền hoàn:</strong> ${refundAmount.toLocaleString('vi-VN')} VND (${refundPercentage}%)</li>
                    ${cancellationReason ? `<li><strong>Lý do hủy:</strong> ${cancellationReason}</li>` : ''}
                </ul>
                ${refundAmount > 0 ? '<p>Số tiền hoàn sẽ được xử lý trong vòng 5-7 ngày làm việc.</p>' : ''}
                <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</p>
            `
        };

        await transporter.sendMail(mailOptionCustomer);

        // Gửi email cho chủ khách sạn
        const hotel = await Hotel.findById(booking.hotel._id).populate("owner");
        if (hotel && hotel.owner && hotel.owner.email) {
            const mailOptionOwner = {
                from: process.env.SENDER_EMAIL,
                to: hotel.owner.email,
                subject: "Thông báo hủy đặt phòng",
                html: `
                    <h2>Đặt phòng bị hủy</h2>
                    <p>Xin chào ${hotel.owner.username},</p>
                    <p>Một đặt phòng tại khách sạn của bạn đã bị hủy.</p>
                    <ul>
                        <li><strong>Mã đặt phòng:</strong> ${booking._id}</li>
                        <li><strong>Khách hàng:</strong> ${booking.user.username}</li>
                        <li><strong>Loại phòng:</strong> ${booking.room.roomType}</li>
                        <li><strong>Ngày nhận phòng:</strong> ${checkInDate.toLocaleDateString('vi-VN')}</li>
                        <li><strong>Tổng tiền:</strong> ${booking.totalPrice.toLocaleString('vi-VN')} VND</li>
                        ${cancellationReason ? `<li><strong>Lý do hủy:</strong> ${cancellationReason}</li>` : ''}
                    </ul>
                `
            };

            await transporter.sendMail(mailOptionOwner);

            // Tạo notification cho chủ khách sạn
            await Notification.create({
                user: hotel.owner._id,
                type: "booking_cancelled",
                title: "Đặt phòng bị hủy",
                message: `Khách hàng ${booking.user.username} đã hủy đặt phòng ${booking.room.roomType}`,
                relatedId: booking._id.toString(),
            });
        }

        // Tạo notification cho khách hàng
        await Notification.create({
            user: booking.user._id,
            type: "booking_cancelled",
            title: "Đặt phòng đã hủy",
            message: `Đặt phòng tại ${booking.hotel.name} đã được hủy. Hoàn ${refundPercentage}% (${refundAmount.toLocaleString('vi-VN')} VND)`,
            relatedId: booking._id.toString(),
        });

        res.json({
            success: true,
            message: "Đã hủy đặt phòng thành công",
            booking,
            refundInfo: {
                refundAmount,
                refundPercentage
            }
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Không thể hủy đặt phòng" });
    }
};

// API để chủ khách sạn hủy đặt phòng
// POST /api/bookings/:id/cancel-by-owner
export const cancelBookingByOwner = async (req, res) => {
    try {
        const { id } = req.params;
        const ownerId = req.user._id;
        const { cancellationReason } = req.body;

        // Tìm booking
        const booking = await Booking.findById(id).populate("room hotel user");

        if (!booking) {
            return res.json({ success: false, message: "Đặt phòng không tồn tại" });
        }

        // Kiểm tra quyền hủy
        const hotel = await Hotel.findById(booking.hotel._id);
        if (!hotel || hotel.owner.toString() !== ownerId.toString()) {
            return res.json({ success: false, message: "Không có quyền hủy đặt phòng này" });
        }

        // Kiểm tra điều kiện hủy
        if (booking.status === "cancelled") {
            return res.json({ success: false, message: "Đặt phòng đã được hủy trước đó" });
        }

        if (booking.status === "completed") {
            return res.json({ success: false, message: "Không thể hủy đặt phòng đã hoàn thành" });
        }

        // Chủ khách sạn hủy: hoàn 100% nếu đã thanh toán
        const refundPercentage = 100;
        const refundAmount = booking.isPaid ? booking.totalPrice : 0;

        // Cập nhật booking
        booking.status = "cancelled";
        booking.cancelledAt = new Date();
        booking.cancelledBy = ownerId;
        booking.cancellationReason = cancellationReason || "Hủy bởi chủ khách sạn";
        booking.refundAmount = refundAmount;
        booking.refundPercentage = refundPercentage;

        await booking.save();

        // Gửi email cho khách hàng
        const mailOptionCustomer = {
            from: process.env.SENDER_EMAIL,
            to: booking.user.email,
            subject: "Thông báo hủy đặt phòng",
            html: `
                <h2>Đặt phòng đã bị hủy</h2>
                <p>Xin chào ${booking.user.username},</p>
                <p>Rất tiếc, đặt phòng của bạn đã bị hủy bởi khách sạn.</p>
                <ul>
                    <li><strong>Mã đặt phòng:</strong> ${booking._id}</li>
                    <li><strong>Khách sạn:</strong> ${booking.hotel.name}</li>
                    <li><strong>Ngày nhận phòng:</strong> ${new Date(booking.checkInDate).toLocaleDateString('vi-VN')}</li>
                    <li><strong>Tổng tiền:</strong> ${booking.totalPrice.toLocaleString('vi-VN')} VND</li>
                    <li><strong>Số tiền hoàn:</strong> ${refundAmount.toLocaleString('vi-VN')} VND (100%)</li>
                    ${cancellationReason ? `<li><strong>Lý do:</strong> ${cancellationReason}</li>` : ''}
                </ul>
                ${refundAmount > 0 ? '<p>Số tiền hoàn sẽ được xử lý trong vòng 5-7 ngày làm việc.</p>' : ''}
                <p>Chúng tôi xin lỗi vì sự bất tiện này!</p>
            `
        };

        await transporter.sendMail(mailOptionCustomer);

        // Tạo notification cho khách hàng
        await Notification.create({
            user: booking.user._id,
            type: "booking_cancelled",
            title: "Đặt phòng bị hủy",
            message: `Đặt phòng tại ${booking.hotel.name} đã bị hủy bởi khách sạn. Hoàn 100%`,
            relatedId: booking._id.toString(),
        });

        res.json({
            success: true,
            message: "Đã hủy đặt phòng thành công",
            booking,
            refundInfo: {
                refundAmount,
                refundPercentage
            }
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Không thể hủy đặt phòng" });
    }
};






