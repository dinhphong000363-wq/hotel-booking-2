import express from "express";
import {
  createOrUpdateReview,
  getRoomReviews,
} from "../controllers/reviewControllers.js";
import { protect } from "../middleware/authMiddleware.js";

const reviewRouter = express.Router();

reviewRouter.get("/room/:roomId", getRoomReviews);
reviewRouter.post("/", protect, createOrUpdateReview);

export default reviewRouter;

