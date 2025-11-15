import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    hotel: { type: String, ref: "Hotel", required: true },
    roomType: { type: String, required: true },
    pricePerNight: { type: Number, required: true },
    amenities: { type: Array, required: true },
    images: [{ type: String }],
    isAvailable: { type: Boolean, default: true },
    discount: { type: Number, default: 0, min: 0, max: 40 }, // 0, 10, 20, 30, 40%
  },
  { timestamps: true }
);

const Room = mongoose.model("Room", roomSchema);

export default Room;
