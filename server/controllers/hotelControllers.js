import Hotel from "../models/Hotel.js";
import User from "../models/User.js";

export const register = async (req, res) =>{
    try {
        const {name, address , contact , city } = req.body;
        const owner = req.user._id
        // check if user already registered
        const hotel = await Hotel.findOne({owner})
        if(hotel){
            return res.json({success: false, message:'hotel already registered'})
        }
        // Create hotel with pending status
        await Hotel.create({name, address,contact,city,owner, status: "pending"});
        res.json({success:true, message: "Đăng ký khách sạn thành công. Vui lòng chờ admin duyệt."})
    } catch (error) {
        res.json({success:false, message: error.message})
        
    }
}