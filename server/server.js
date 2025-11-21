import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./config/db.js";
import { clerkMiddleware } from '@clerk/express'
import clerkWebhooks from "./controllers/clerkWebhooks.js";
import userRouter from "./routes/userRoutes.js";
import hotelRouter from "./routes/hotelRoutes.js";
import connectCloudinary from "./config/cloudinary.js";
import roomRouter from "./routes/roomsRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import favoriteRouter from "./routes/favoriteRoutes.js";
import reviewRouter from "./routes/reviewRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import ownerRouter from "./routes/ownerRoutes.js";
import { stripeWebhooks } from "./controllers/stripeWebhook.js";
import chatbotRouter from "./routes/chatbotRoutes.js";

connectDB()
connectCloudinary()

const app = express();
app.use(cors()); // ✅ gọi đúng hàm

// API to listen to Stripe Webhooks
app.post(
  '/api/stripe',
  express.raw({ type: "application/json" }),
  stripeWebhooks
);


// clerk middleware
app.use(express.json())
app.use(clerkMiddleware())

//API to listen to clerk webhook
app.use("/api/clerk", clerkWebhooks);


app.get("/", (req, res) => res.send("xin chào!!!!!!!!!!!!!! "));
app.use("/api/user", userRouter)
app.use("/api/hotels", hotelRouter)
app.use("/api/rooms", roomRouter)
app.use("/api/bookings", bookingRouter)
app.use("/api/favorites", favoriteRouter)
app.use("/api/reviews", reviewRouter)
app.use("/api/admin", adminRouter)
app.use("/api/owner", ownerRouter)
app.use("/api/chatbot", chatbotRouter)





const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at: http://localhost:${PORT}`);
});
