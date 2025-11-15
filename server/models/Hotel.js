import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true }, // Địa chỉ đầy đủ (để tương thích ngược)
    contact: { type: String, required: true },
    owner: { type: String, required: true, ref: "User" },
    city: { type: String, required: true },
    // Địa chỉ chi tiết
    district: { type: String, default: "" }, // Quận/Huyện
    street: { type: String, default: "" }, // Đường
    houseNumber: { type: String, default: "" }, // Số nhà
    fullAddress: { type: String, default: "" }, // Địa chỉ đầy đủ được tạo tự động
    coordinates: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null }
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Hotel = mongoose.model("Hotel", hotelSchema);

export default Hotel;
