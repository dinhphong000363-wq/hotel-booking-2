import express from "express";
import {
  checkAvailabilityAPI,
  createBooking,
  getHotelBookings,
  getUserBookings,
  stripePayment,
  deleteBooking,
  updateBookingStatus,
} from "../controllers/bookingControllers.js";
import { protect, owner } from "../middleware/authMiddleware.js";

const bookingRouter = express.Router();

bookingRouter.post("/check-availability", checkAvailabilityAPI);
bookingRouter.post("/book", protect, createBooking);
bookingRouter.get("/user", protect, getUserBookings);

// Owner bookings management
bookingRouter.get("/owner", protect, owner, getHotelBookings);
bookingRouter.patch("/:id/status", protect, owner, updateBookingStatus);

bookingRouter.post('/stripe-payment',protect, stripePayment)
bookingRouter.delete('/:id', protect, deleteBooking)

export default bookingRouter;
