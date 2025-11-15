import Hotel from "../models/Hotel.js";
import User from "../models/User.js";
import Room from "../models/Room.js";
import Booking from "../models/Booking.js";

// Get all pending hotels
export const getPendingHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find({ status: "pending" })
      .populate("owner", "username email image")
      .sort({ createdAt: -1 });

    res.json({ success: true, hotels });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Approve hotel
export const approveHotel = async (req, res) => {
  try {
    const { hotelId } = req.params;

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.json({ success: false, message: "Khách sạn không tồn tại" });
    }

    // Update hotel status to approved
    hotel.status = "approved";
    await hotel.save();

    // Update user role to hotelOwner
    await User.findByIdAndUpdate(hotel.owner, { role: "hotelOwner" });

    res.json({ success: true, message: "Đã duyệt khách sạn thành công" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Reject hotel
export const rejectHotel = async (req, res) => {
  try {
    const { hotelId } = req.params;

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.json({ success: false, message: "Khách sạn không tồn tại" });
    }

    // Update hotel status to rejected
    hotel.status = "rejected";
    await hotel.save();

    res.json({ success: true, message: "Đã từ chối khách sạn" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select("-recentSearchedCities")
      .sort({ createdAt: -1 });

    res.json({ success: true, users });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Update user role
export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!["user", "hotelOwner", "admin"].includes(role)) {
      return res.json({ success: false, message: "Vai trò không hợp lệ" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    );

    if (!user) {
      return res.json({ success: false, message: "Người dùng không tồn tại" });
    }

    res.json({ success: true, message: "Đã cập nhật vai trò người dùng thành công", user });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Don't allow deleting yourself
    if (userId === req.user._id) {
      return res.json({ success: false, message: "Không thể xóa chính mình" });
    }

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.json({ success: false, message: "Người dùng không tồn tại" });
    }

    res.json({ success: true, message: "Đã xóa người dùng thành công" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Get all hotels with owner and room image
export const getAllHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find({})
      .populate("owner", "username email image")
      .sort({ createdAt: -1 });

    // Get first room image, room count, booking count, and revenue for each hotel
    const hotelsWithStats = await Promise.all(
      hotels.map(async (hotel) => {
        const hotelId = hotel._id.toString();

        // Get first room image
        const firstRoom = await Room.findOne({ hotel: hotelId })
          .select("images roomType")
          .limit(1);

        // Count total rooms
        const totalRooms = await Room.countDocuments({ hotel: hotelId });

        // Count total bookings
        const totalBookings = await Booking.countDocuments({ hotel: hotelId });

        // Calculate revenue by month (last 6 months)
        const now = new Date();
        const revenueByMonth = [];
        for (let i = 5; i >= 0; i--) {
          const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

          const monthBookings = await Booking.find({
            hotel: hotelId,
            isPaid: true,
            createdAt: { $gte: monthStart, $lte: monthEnd }
          });

          const monthRevenue = monthBookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);

          revenueByMonth.push({
            month: monthStart.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' }),
            revenue: monthRevenue,
            bookings: monthBookings.length
          });
        }

        // Calculate total revenue (all time)
        const allPaidBookings = await Booking.find({ hotel: hotelId, isPaid: true });
        const totalRevenue = allPaidBookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);

        return {
          ...hotel.toObject(),
          roomImage: firstRoom?.images?.[0] || null,
          roomType: firstRoom?.roomType || null,
          totalRooms,
          totalBookings,
          totalRevenue,
          revenueByMonth,
        };
      })
    );

    res.json({ success: true, hotels: hotelsWithStats });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Delete hotel
export const deleteHotel = async (req, res) => {
  try {
    const { hotelId } = req.params;

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.json({ success: false, message: "Khách sạn không tồn tại" });
    }

    // Delete all rooms associated with this hotel
    await Room.deleteMany({ hotel: hotelId });

    // Delete all bookings associated with this hotel
    await Booking.deleteMany({ hotel: hotelId });

    // Delete the hotel
    await Hotel.findByIdAndDelete(hotelId);

    res.json({ success: true, message: "Đã xóa khách sạn thành công" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    // Total counts
    const totalUsers = await User.countDocuments({});
    const totalHotels = await Hotel.countDocuments({});
    const totalRooms = await Room.countDocuments({});
    const totalBookings = await Booking.countDocuments({});

    // Total revenue (only paid bookings)
    const paidBookings = await Booking.find({ isPaid: true });
    const totalRevenue = paidBookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);

    // Revenue by month (last 6 months)
    const now = new Date();
    const revenueByMonth = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

      const monthBookings = await Booking.find({
        isPaid: true,
        createdAt: { $gte: monthStart, $lte: monthEnd }
      });

      const monthRevenue = monthBookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);

      revenueByMonth.push({
        month: monthStart.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' }),
        revenue: monthRevenue
      });
    }

    // Revenue growth (current month vs previous month)
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const currentMonthBookings = await Booking.find({
      isPaid: true,
      createdAt: { $gte: currentMonthStart, $lte: currentMonthEnd }
    });
    const previousMonthBookings = await Booking.find({
      isPaid: true,
      createdAt: { $gte: previousMonthStart, $lte: previousMonthEnd }
    });

    const currentMonthRevenue = currentMonthBookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
    const previousMonthRevenue = previousMonthBookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);

    const revenueGrowth = previousMonthRevenue > 0
      ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue * 100).toFixed(1)
      : currentMonthRevenue > 0 ? 100 : 0;

    // Booking status distribution
    const bookingStatusCounts = await Booking.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const bookingStatusData = {
      pending: bookingStatusCounts.find(s => s._id === "pending")?.count || 0,
      confirmed: bookingStatusCounts.find(s => s._id === "confirmed")?.count || 0,
      cancelled: bookingStatusCounts.find(s => s._id === "cancelled")?.count || 0,
    };

    // User role distribution
    const userRoleCounts = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 }
        }
      }
    ]);

    const userRoleData = {
      user: userRoleCounts.find(r => r._id === "user")?.count || 0,
      hotelOwner: userRoleCounts.find(r => r._id === "hotelOwner")?.count || 0,
      admin: userRoleCounts.find(r => r._id === "admin")?.count || 0,
    };

    // Pending hotels (latest 5)
    const pendingHotels = await Hotel.find({ status: "pending" })
      .populate("owner", "username email image")
      .sort({ createdAt: -1 })
      .limit(5);

    // Note: Since we don't have a "reported users" feature yet, we'll return empty array
    // This can be implemented later when reporting feature is added
    const reportedUsers = [];

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalHotels,
        totalRooms,
        totalBookings,
        totalRevenue,
        revenueGrowth: parseFloat(revenueGrowth),
        revenueByMonth,
        bookingStatusData,
        userRoleData,
        pendingHotels,
        reportedUsers,
      }
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

