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

// API để cập nhật một phòng
// PUT /api/rooms/:id
export const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { roomType, pricePerNight, amenities } = req.body;

    // Tìm khách sạn theo chủ sở hữu
    const hotel = await Hotel.findOne({ owner: req.auth.userId });
    if (!hotel) {
      return res.json({ success: false, message: "No Hotel found" });
    }

    // Tìm phòng và kiểm tra xem nó có thuộc về hotel này không
    const room = await Room.findById(id);
    if (!room) {
      return res.json({ success: false, message: "Room not found" });
    }

    if (room.hotel.toString() !== hotel._id.toString()) {
      return res.json({ success: false, message: "Unauthorized to update this room" });
    }

    // Cập nhật thông tin phòng
    if (roomType) room.roomType = roomType;
    if (pricePerNight) room.pricePerNight = +pricePerNight;
    if (amenities) room.amenities = JSON.parse(amenities);

    // Nếu có ảnh mới, tải lên Cloudinary
    if (req.files && req.files.length > 0) {
      const uploadImages = req.files.map(async (file) => {
        const response = await cloudinary.uploader.upload(file.path);
        return response.secure_url;
      });
      const newImages = await Promise.all(uploadImages);
      room.images = newImages;
    }

    await room.save();

    res.json({ success: true, message: "Room updated successfully" });
  } catch (error) {
    console.error("❌ Error updating room:", error.message);
    res.json({ success: false, message: error.message });
  }
};

// API để xóa một phòng
// DELETE /api/rooms/:id
export const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;

    // Tìm khách sạn theo chủ sở hữu
    const hotel = await Hotel.findOne({ owner: req.auth.userId });
    if (!hotel) {
      return res.json({ success: false, message: "No Hotel found" });
    }

    // Tìm phòng và kiểm tra xem nó có thuộc về hotel này không
    const room = await Room.findById(id);
    if (!room) {
      return res.json({ success: false, message: "Room not found" });
    }

    if (room.hotel.toString() !== hotel._id.toString()) {
      return res.json({ success: false, message: "Unauthorized to delete this room" });
    }

    // Xóa phòng
    await Room.findByIdAndDelete(id);

    res.json({ success: true, message: "Room deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting room:", error.message);
    res.json({ success: false, message: error.message });
  }
};

