import Hotel from "../models/Hotel.js";
import Booking from "../models/Booking.js";
import Room from "../models/Room.js";
import Review from "../models/Review.js";
import Notification from "../models/Notification.js";

// Get detailed dashboard statistics for owner
export const getOwnerDashboardStats = async (req, res) => {
  try {
    const ownerId = req.user._id;

    // Find all approved hotels owned by this owner
    const hotels = await Hotel.find({ owner: ownerId });
    if (!hotels || hotels.length === 0) {
      return res.json({ success: false, message: "Không tìm thấy khách sạn" });
    }

    const hotelIds = hotels.map(h => h._id.toString());

    // Get all bookings for these hotels
    const allBookings = await Booking.find({ hotel: { $in: hotelIds } })
      .populate("room hotel user");

    // Total counts
    const totalBookings = allBookings.length;
    const totalRooms = await Room.countDocuments({ hotel: { $in: hotelIds } });

    // Revenue calculations (only paid bookings)
    const paidBookings = allBookings.filter(b => b.isPaid);
    const totalRevenue = paidBookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);

    // Revenue by month (last 6 months)
    const now = new Date();
    const revenueByMonth = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

      const monthBookings = paidBookings.filter(booking => {
        const bookingDate = new Date(booking.createdAt);
        return bookingDate >= monthStart && bookingDate <= monthEnd;
      });

      const monthRevenue = monthBookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);

      revenueByMonth.push({
        month: monthStart.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' }),
        revenue: monthRevenue,
        bookings: monthBookings.length
      });
    }

    // Revenue growth (current month vs previous month)
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const currentMonthBookings = paidBookings.filter(b => {
      const date = new Date(b.createdAt);
      return date >= currentMonthStart && date <= currentMonthEnd;
    });
    const previousMonthBookings = paidBookings.filter(b => {
      const date = new Date(b.createdAt);
      return date >= previousMonthStart && date <= previousMonthEnd;
    });

    const currentMonthRevenue = currentMonthBookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
    const previousMonthRevenue = previousMonthBookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);

    const revenueGrowth = previousMonthRevenue > 0
      ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue * 100).toFixed(1)
      : currentMonthRevenue > 0 ? 100 : 0;

    // Booking status distribution
    const bookingStatusData = {
      pending: allBookings.filter(b => b.status === "pending").length,
      confirmed: allBookings.filter(b => b.status === "confirmed").length,
      cancelled: allBookings.filter(b => b.status === "cancelled").length,
      completed: allBookings.filter(b => b.status === "completed").length,
    };

    // Get room IDs for reviews
    const roomIds = await Room.find({ hotel: { $in: hotelIds } }).select("_id");
    const roomIdStrings = roomIds.map(r => r._id.toString());

    // Get reviews for owner's rooms
    const reviews = await Review.find({ room: { $in: roomIdStrings } })
      .populate("user", "name avatar")
      .populate("room", "roomType")
      .sort({ createdAt: -1 })
      .limit(10);

    const averageRating = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

    // Get notifications
    const notifications = await Notification.find({ user: ownerId })
      .sort({ createdAt: -1 })
      .limit(20);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    // Recent bookings (last 5)
    const recentBookings = allBookings
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    res.json({
      success: true,
      stats: {
        totalBookings,
        totalRooms,
        totalRevenue,
        revenueGrowth: parseFloat(revenueGrowth),
        revenueByMonth,
        bookingStatusData,
        averageRating: parseFloat(averageRating),
        totalReviews: reviews.length,
        recentBookings,
        recentReviews: reviews.slice(0, 5),
        notifications,
        unreadNotifications: unreadCount,
      }
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Get reviews for owner's hotels
export const getOwnerReviews = async (req, res) => {
  try {
    const ownerId = req.user._id;

    const hotels = await Hotel.find({ owner: ownerId });
    if (!hotels || hotels.length === 0) {
      return res.json({ success: false, message: "Không tìm thấy khách sạn" });
    }

    const hotelIds = hotels.map(h => h._id.toString());
    const roomIds = await Room.find({ hotel: { $in: hotelIds } }).select("_id");
    const roomIdStrings = roomIds.map(r => r._id.toString());

    const reviews = await Review.find({ room: { $in: roomIdStrings } })
      .populate("user", "name avatar email")
      .populate("room", "roomType")
      .sort({ createdAt: -1 });

    res.json({ success: true, reviews });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Get notifications for owner
export const getOwnerNotifications = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const { limit = 50 } = req.query;

    const notifications = await Notification.find({ user: ownerId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({ success: true, notifications });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Mark notification as read
export const markNotificationRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const ownerId = req.user._id;

    const notification = await Notification.findOne({ _id: notificationId, user: ownerId });
    if (!notification) {
      return res.json({ success: false, message: "Không tìm thấy thông báo" });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ success: true, message: "Đã đánh dấu thông báo đã đọc" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Mark all notifications as read
export const markAllNotificationsRead = async (req, res) => {
  try {
    const ownerId = req.user._id;

    await Notification.updateMany({ user: ownerId, isRead: false }, { isRead: true });

    res.json({ success: true, message: "Đã đánh dấu tất cả thông báo đã đọc" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

