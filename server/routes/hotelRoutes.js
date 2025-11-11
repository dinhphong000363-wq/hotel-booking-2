import express from "express"
import {protect} from "../middleware/authMiddleware.js"
import {register} from "../controllers/hotelControllers.js"

const hotelRouter = express.Router();
hotelRouter.post('/', protect,register);

export default hotelRouter;