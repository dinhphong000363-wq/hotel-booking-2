import express from "express";
import "dotenv/config";
import cors from "cors";
import session from "express-session";
import passport from "./config/passport.js";
import connectDB from "./config/db.js";
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
import authRouter from "./routes/authRoutes.js";

connectDB()
connectCloudinary()

const app = express();
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// ⚠️ IMPORTANT: Stripe webhook MUST come BEFORE express.json()
// Stripe needs raw body for signature verification
app.post(
  '/api/stripe',
  express.raw({ type: "application/json" }),
  stripeWebhooks
);

// Health check endpoint for webhook
app.get('/api/stripe/health', (req, res) => {
  res.json({
    status: 'ok',
    webhookConfigured: !!process.env.STRIPE_WEBHOOK_SECRET,
    stripeKeyConfigured: !!process.env.STRIPE_SECRET_KEY,
    endpoint: '/api/stripe'
  });
});

// Body parser middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Session middleware for passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000
  }
}))

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())


app.get("/", (req, res) => res.send("xin chào!!!!!!!!!!!!!! "));
app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/hotels", hotelRouter)
app.use("/api/rooms", roomRouter)
app.use("/api/bookings", bookingRouter)
app.use("/api/favorites", favoriteRouter)
app.use("/api/reviews", reviewRouter)
app.use("/api/admin", adminRouter)
app.use("/api/owner", ownerRouter)
app.use("/api/chatbot", chatbotRouter)





const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running at: http://localhost:${PORT}`);
});
