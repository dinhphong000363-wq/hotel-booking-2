import Hotel from "../models/Hotel.js";
import User from "../models/User.js";

export const register = async (req, res) =>{
    try {
        const {name, address, contact, city, district, street, houseNumber, fullAddress } = req.body;
        const owner = req.user._id
        // check if user already registered
        const hotel = await Hotel.findOne({owner})
        if(hotel){
            return res.json({success: false, message:'Khách sạn đã được đăng ký'})
        }
        // Tạo địa chỉ đầy đủ nếu chưa có
        const finalFullAddress = fullAddress || `${houseNumber ? houseNumber + ', ' : ''}${street ? street + ', ' : ''}${district ? district + ', ' : ''}${city}`;
        const finalAddress = address || finalFullAddress; // Giữ cho tương thích ngược
        
        // Create hotel with pending status
        await Hotel.create({
            name, 
            address: finalAddress, 
            contact, 
            city, 
            district: district || '',
            street: street || '',
            houseNumber: houseNumber || '',
            fullAddress: finalFullAddress,
            owner, 
            status: "pending"
        });
        res.json({success:true, message: "Đăng ký khách sạn thành công. Vui lòng chờ admin duyệt."})
    } catch (error) {
        res.json({success:false, message: error.message})
        
    }
}

// Get hotel information for owner
export const getOwnerHotel = async (req, res) => {
    try {
        const ownerId = req.user._id;
        const hotel = await Hotel.findOne({ owner: ownerId })
            .populate("owner", "username email image");
        
        if (!hotel) {
            return res.json({ success: false, message: "Khách sạn chưa được đăng ký" });
        }
        
        res.json({ success: true, hotel });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Update hotel information
export const updateOwnerHotel = async (req, res) => {
    try {
        const ownerId = req.user._id;
        const { name, address, contact, city, district, street, houseNumber, fullAddress } = req.body;
        
        const hotel = await Hotel.findOne({ owner: ownerId });
        
        if (!hotel) {
            return res.json({ success: false, message: "Khách sạn không tồn tại" });
        }
        
        // Only allow update if hotel is approved
        if (hotel.status !== "approved") {
            return res.json({ 
                success: false, 
                message: "Chỉ có thể cập nhật thông tin khi khách sạn đã được duyệt" 
            });
        }
        
        // Update fields
        if (name) hotel.name = name;
        if (contact) hotel.contact = contact;
        if (city) hotel.city = city;
        if (district !== undefined) hotel.district = district;
        if (street !== undefined) hotel.street = street;
        if (houseNumber !== undefined) hotel.houseNumber = houseNumber;
        
        // Tạo địa chỉ đầy đủ nếu chưa có
        const finalFullAddress = fullAddress || `${houseNumber ? houseNumber + ', ' : ''}${street ? street + ', ' : ''}${district ? district + ', ' : ''}${city}`;
        const finalAddress = address || finalFullAddress; // Giữ cho tương thích ngược
        
        hotel.fullAddress = finalFullAddress;
        hotel.address = finalAddress;
        
        await hotel.save();
        
        res.json({ success: true, message: "Cập nhật thông tin khách sạn thành công", hotel });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};