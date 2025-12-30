import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
    {
        user: { type: String, ref: "User", required: true },
        room: { type: String, ref: "Room", required: true },
        hotel: { type: String, ref: "Hotel", required: true },
        checkInDate: { type: Date, required: true },
        checkOutDate: { type: Date, required: true },
        totalPrice: { type: Number, required: true },
        guests: { type: Number, required: true },
        status: {
            type: String,
            enum: ["pending", "confirmed", "cancelled", "completed"],
            // đang chờ xử lý, đã xác nhận, đã hủy, đã hoàn thành
            default: "pending",
        },

        paymentMethod: {
            type: String,
            required: true,
            default: "Pay At Hotel",
        },

        isPaid: { type: Boolean, default: false },

        // Cancellation fields
        cancelledAt: { type: Date },
        cancelledBy: { type: String, ref: "User" },
        cancellationReason: { type: String },
        refundAmount: { type: Number, default: 0 },
        refundPercentage: { type: Number, default: 0 },

    },
    { timestamps: true }
);


const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
