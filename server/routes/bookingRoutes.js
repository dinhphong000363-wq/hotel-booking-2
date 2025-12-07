import express from "express";
import {
  checkAvailabilityAPI,
  createBooking,
  getHotelBookings,
  getUserBookings,
  deleteBooking,
  updateBookingStatus,
  updateBooking,
  cancelBooking,
  cancelBookingByOwner,
} from "../controllers/bookingControllers.js";
import { protect, owner } from "../middleware/authMiddleware.js";

const bookingRouter = express.Router();

bookingRouter.post("/check-availability", checkAvailabilityAPI);
bookingRouter.post("/book", protect, createBooking);
bookingRouter.get("/user", protect, getUserBookings);

// Owner bookings management
bookingRouter.get("/owner", protect, owner, getHotelBookings);
bookingRouter.patch("/:id/status", protect, owner, updateBookingStatus);

// Cancellation routes
bookingRouter.post("/:id/cancel", protect, cancelBooking);
bookingRouter.post("/:id/cancel-by-owner", protect, owner, cancelBookingByOwner);

bookingRouter.patch('/:id', protect, updateBooking)
bookingRouter.delete('/:id', protect, deleteBooking)

export default bookingRouter;
