import express from "express"
import { protect } from "../middleware/authMiddleware.js"
import { register, getOwnerHotel, updateOwnerHotel, cancelRegistration } from "../controllers/hotelControllers.js"

const hotelRouter = express.Router();
hotelRouter.post('/', protect, register);
hotelRouter.get('/owner', protect, getOwnerHotel);
hotelRouter.put('/owner', protect, updateOwnerHotel);
hotelRouter.delete('/owner', protect, cancelRegistration);

export default hotelRouter;