import Hotel from "../models/Hotel.js";
import { v2 as cloudinary } from 'cloudinary'
import Room from "../models/Room.js";
// API to create a new room for a hotel
export const createRoom = async (req, res) => {
  try {
    const { roomType, pricePerNight, amenities, discount } = req.body;

    // ✅ Tìm khách sạn theo chủ sở hữu
    const hotel = await Hotel.findOne({ owner: req.user._id });
    if (!hotel) {
      return res.json({ success: false, message: "Không tìm thấy khách sạn" });
    }

    // ✅ Kiểm tra file upload có tồn tại không
    if (!req.files || req.files.length === 0) {
      return res.json({ success: false, message: "Vui lòng tải lên ít nhất một ảnh" });
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
      discount: discount ? +discount : 0,
    });

    res.json({ success: true, message: "Đã tạo phòng thành công" });

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
          select: "name email avatar",
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
    const hotelData = await Hotel.findOne({ owner: req.user._id });

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

    res.json({ success: true, message: "Đã cập nhật tình trạng phòng" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// API để cập nhật một phòng
// PUT /api/rooms/:id
export const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { roomType, pricePerNight, amenities, discount } = req.body;

    // Tìm khách sạn theo chủ sở hữu
    const hotel = await Hotel.findOne({ owner: req.user._id });
    if (!hotel) {
      return res.json({ success: false, message: "Không tìm thấy khách sạn" });
    }

    // Tìm phòng và kiểm tra xem nó có thuộc về hotel này không
    const room = await Room.findById(id);
    if (!room) {
      return res.json({ success: false, message: "Phòng không tồn tại" });
    }

    if (room.hotel.toString() !== hotel._id.toString()) {
      return res.json({ success: false, message: "Không có quyền cập nhật phòng này" });
    }

    // Cập nhật thông tin phòng
    if (roomType) room.roomType = roomType;
    if (pricePerNight) room.pricePerNight = +pricePerNight;
    if (amenities) room.amenities = JSON.parse(amenities);
    if (discount !== undefined) room.discount = +discount;

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

    res.json({ success: true, message: "Đã cập nhật phòng thành công" });
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
    const hotel = await Hotel.findOne({ owner: req.user._id });
    if (!hotel) {
      return res.json({ success: false, message: "Không tìm thấy khách sạn" });
    }

    // Tìm phòng và kiểm tra xem nó có thuộc về hotel này không
    const room = await Room.findById(id);
    if (!room) {
      return res.json({ success: false, message: "Phòng không tồn tại" });
    }

    if (room.hotel.toString() !== hotel._id.toString()) {
      return res.json({ success: false, message: "Không có quyền xóa phòng này" });
    }

    // Xóa phòng
    await Room.findByIdAndDelete(id);

    res.json({ success: true, message: "Đã xóa phòng thành công" });
  } catch (error) {
    console.error("❌ Error deleting room:", error.message);
    res.json({ success: false, message: error.message });
  }
};

