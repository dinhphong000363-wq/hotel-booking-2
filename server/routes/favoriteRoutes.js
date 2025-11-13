import express from "express";
import {
  getRoomFavoritesCount,
  getUserFavoriteStatus,
  toggleFavorite,
  listMyFavorites,
} from "../controllers/favoriteControllers.js";
import { protect } from "../middleware/authMiddleware.js";

const favoriteRouter = express.Router();

favoriteRouter.get("/room/:roomId", getRoomFavoritesCount);
favoriteRouter.get("/user/:roomId", protect, getUserFavoriteStatus);
favoriteRouter.get("/me", protect, listMyFavorites);
favoriteRouter.post("/toggle", protect, toggleFavorite);

export default favoriteRouter;

