import Review from "../models/Review.js";

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
      .populate("user", "username image");

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
    }

    const reviews = await Review.find({ room: roomId })
      .sort({ createdAt: -1 })
      .populate("user", "username image");

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

