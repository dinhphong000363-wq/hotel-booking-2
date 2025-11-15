import express from "express";
import { protect, owner } from "../middleware/authMiddleware.js";
import {
  getOwnerDashboardStats,
  getOwnerReviews,
  getOwnerNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../controllers/ownerControllers.js";

const ownerRouter = express.Router();

// All routes require authentication and owner role
ownerRouter.use(protect);
ownerRouter.use(owner);

// Dashboard statistics
ownerRouter.get("/dashboard/stats", getOwnerDashboardStats);

// Reviews
ownerRouter.get("/reviews", getOwnerReviews);

// Notifications
ownerRouter.get("/notifications", getOwnerNotifications);
ownerRouter.put("/notifications/:notificationId/read", markNotificationRead);
ownerRouter.put("/notifications/read-all", markAllNotificationsRead);

export default ownerRouter;

