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
        await Hotel.create({name, address,contact,city,owner});
        await User.findByIdAndUpdate(owner,{role: "hotelOwner"});
        res.json({success:true, message: "Hotel registered Successfully"})
    } catch (error) {
        res.json({success:true, message: error.message})
        
    }
}