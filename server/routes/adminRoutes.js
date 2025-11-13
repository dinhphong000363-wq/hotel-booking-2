import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  getPendingHotels,
  approveHotel,
  rejectHotel,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllHotels,
  getDashboardStats,
} from "../controllers/adminControllers.js";

const adminRouter = express.Router();

// All admin routes require authentication and admin role
adminRouter.use(protect);
adminRouter.use(admin);

// Hotel approval routes
adminRouter.get("/hotels/pending", getPendingHotels);
adminRouter.get("/hotels", getAllHotels);
adminRouter.put("/hotels/:hotelId/approve", approveHotel);
adminRouter.put("/hotels/:hotelId/reject", rejectHotel);

// Dashboard route
adminRouter.get("/dashboard/stats", getDashboardStats);

// User management routes
adminRouter.get("/users", getAllUsers);
adminRouter.put("/users/:userId/role", updateUserRole);
adminRouter.delete("/users/:userId", deleteUser);

export default adminRouter;

