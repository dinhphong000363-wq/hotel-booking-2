import transporter from "../config/nodemailer.js";
import Booking from "../models/Booking.js";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import stripe from "stripe"

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
            return res.json({ success: false, message: "Room is not available" });
        }

        // Lấy totalPrice từ Room
        const roomData = await Room.findById(room).populate("hotel");

        let totalPrice = roomData.pricePerNight;

        // Tính tổng giá dựa trên số đêm
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const timeDiff = checkOut.getTime() - checkIn.getTime();

        const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
        totalPrice *= nights;
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

        res.json({ success: true, message: "Booking create successfully" })


    } catch (error) {
        console.log(error)
        res.json({ success: false, message: "faild to create successfully" })

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
        res.json({ success: false, message: "Failed to fetch bookings" });
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
            return res.json({ success: false, message: "No Hotel found" });
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
            message: "Failed to fetch bookings"
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
            return res.json({ success: false, message: "Invalid status" });
        }

        const booking = await Booking.findById(id);
        if (!booking) {
            return res.json({ success: false, message: "Booking not found" });
        }

        const hotel = await Hotel.findById(booking.hotel);
        if (!hotel || hotel.owner.toString() !== ownerId.toString()) {
            return res.json({ success: false, message: "Access denied" });
        }

        // Business rules: cannot confirm/cancel after completed
        if (booking.status === "completed") {
            return res.json({ success: false, message: "Booking already completed" });
        }

        booking.status = status;
        await booking.save();

        res.json({ success: true, message: "Status updated", booking });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
export const stripePayment = async(req, res)=>{
    try {
        const {bookingId} = req.body
        const booking = await Booking.findById(bookingId)
        const roomData = await Room.findById(booking.room).populate('hotel');
        const totalPrice = booking.totalPrice;
        const {origin} = req.headers;

        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
        const line_items = [
            {
                price_data: {
                    currency:'usd',
                    product_data:{
                        name: roomData.hotel.name,
                    },

                    unit_amount: totalPrice*100
                },
                quantity:1,
            }
        ]
        //create checkout session
        const session = await stripeInstance.checkout.sessions.create({
            line_items,
            mode:'payment',
            success_url:`${origin}/loader/my-booking`,
            cancel_url:`${origin}/my-booking`,
            metadata:{
                bookingId
            }
        })
        res.json({success:true, url: session.url})

    } catch (error) {
        res.json({success:false, message:'payment failed'})
        
    }
}

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






