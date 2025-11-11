import Hotel from "../models/Hotel.js";
import { v2 as cloudinary } from 'cloudinary'
import Room from "../models/Room.js";
// API to create a new room for a hotel
export const createRoom = async (req, res) => {
  try {
    const { roomType, pricePerNight, amenities } = req.body;

    // ✅ Tìm khách sạn theo chủ sở hữu
    const hotel = await Hotel.findOne({ owner: req.auth.userId });
    if (!hotel) {
      return res.json({ success: false, message: "No Hotel found" });
    }

    // ✅ Kiểm tra file upload có tồn tại không
    if (!req.files || req.files.length === 0) {
      return res.json({ success: false, message: "No images uploaded" });
    }

    // ✅ Tải ảnh lên Cloudinary
    const uploadImages = req.files.map(async (file) => {
      const response = await cloudinary.uploader.upload(file.path);
      return response.secure_url;
    });

    // ✅ Đợi tất cả ảnh được tải lên
    const images = await Promise.all(uploadImages);

    // ✅ Tạo phòng mới
    await Room.create({
      hotel: hotel._id,
      roomType,
      pricePerNight: +pricePerNight,
      amenities: JSON.parse(amenities),
      images,
    });

    res.json({ success: true, message: "Room created successfully" });

  } catch (error) {
    console.error("❌ Error creating room:", error.message);
    res.json({ success: false, message: error.message });
  }
};
// API to get all rooms
export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ isAvailable: true })
      .populate({
        path: "hotel",
        populate: {
          path: "owner",
          select: "image",
        },
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, rooms });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
// API để lấy tất cả các phòng cho một khách sạn cụ thể
export const getOwnerRooms = async (req, res) => {
  try {
    const hotelData = await Hotel.findOne({ owner: req.auth.userId });

    const rooms = await Room.find({ hotel: hotelData._id.toString() }).populate("hotel");

    res.json({ success: true, rooms });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
// API để chuyển đổi tính khả dụng của một phòng
export const toggleRoomAvailability = async (req, res) => {
  try {
    const { roomId } = req.body;

    const roomData = await Room.findById(roomId);

    roomData.isAvailable = !roomData.isAvailable;

    await roomData.save();

    res.json({ success: true, message: "Room availability updated" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

