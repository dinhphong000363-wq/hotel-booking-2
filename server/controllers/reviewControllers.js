import Review from "../models/Review.js";
import Room from "../models/Room.js";
import Hotel from "../models/Hotel.js";
import Notification from "../models/Notification.js";

const getAverageRating = (reviews = []) => {
  if (!reviews.length) return 0;
  const total = reviews.reduce((acc, curr) => acc + curr.rating, 0);
  return Math.round((total / reviews.length) * 10) / 10;
};

export const getRoomReviews = async (req, res) => {
  try {
    const { roomId } = req.params;

    const reviews = await Review.find({ room: roomId })
      .sort({ createdAt: -1 })
      .populate("user", "name avatar");

    res.json({
      success: true,
      reviews,
      averageRating: getAverageRating(reviews),
    });
  } catch (error) {
    console.error("❌ Error fetching reviews:", error);
    res.json({ success: false, message: "Failed to fetch reviews" });
  }
};

export const createOrUpdateReview = async (req, res) => {
  try {
    const { roomId, rating, comment } = req.body;
    const userId = req.user._id;

    if (!roomId || !rating) {
      return res.json({
        success: false,
        message: "Room ID and rating are required",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    const existingReview = await Review.findOne({
      user: userId,
      room: roomId,
    });

    if (existingReview) {
      existingReview.rating = rating;
      existingReview.comment = comment || "";
      await existingReview.save();
    } else {
      await Review.create({
        user: userId,
        room: roomId,
        rating,
        comment: comment || "",
      });

      // Create notification for hotel owner about new review
      const room = await Room.findById(roomId).populate("hotel");
      if (room && room.hotel) {
        const hotel = await Hotel.findById(room.hotel._id).populate("owner");
        if (hotel && hotel.owner) {
          await Notification.create({
            user: hotel.owner._id,
            type: "review_new",
            title: "Đánh giá mới",
            message: `Có đánh giá mới ${rating} sao cho phòng ${room.roomType}`,
            relatedId: roomId,
          });
        }
      }
    }

    const reviews = await Review.find({ room: roomId })
      .sort({ createdAt: -1 })
      .populate("user", "name avatar");

    res.json({
      success: true,
      message: existingReview ? "Review updated successfully" : "Review added successfully",
      reviews,
      averageRating: getAverageRating(reviews),
    });
  } catch (error) {
    console.error("❌ Error creating/updating review:", error);
    res.json({ success: false, message: "Failed to submit review" });
  }
};

