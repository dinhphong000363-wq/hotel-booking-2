import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: String, ref: "User", required: true },
    type: {
      type: String,
      enum: ["booking_new", "booking_confirmed", "booking_cancelled", "booking_completed", "review_new"],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    relatedId: { type: String }, // ID của booking, review, etc.
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;

