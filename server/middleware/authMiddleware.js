import jwt from 'jsonwebtoken';
import User from "../models/User.js";

// Middleware to check if user is authenticated
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if userId is valid MongoDB ObjectId
    if (!decoded.userId || !decoded.userId.match(/^[0-9a-fA-F]{24}$/)) {
      console.error("❌ Invalid user ID format:", decoded.userId);
      return res.status(401).json({
        success: false,
        message: "Invalid token - please clear cache and login again"
      });
    }

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("❌ Error in protect middleware:", error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ success: false, message: "Invalid token" });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ success: false, message: "Token expired" });
    }
    if (error.name === 'CastError') {
      return res.status(401).json({
        success: false,
        message: "Invalid user ID - please clear cache and login again"
      });
    }
    res.status(500).json({ success: false, message: "Authentication error" });
  }
};

// Middleware to check if user is admin
export const admin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.json({ success: false, message: "Not authenticated" });
    }

    if (req.user.role !== "admin") {
      return res.json({ success: false, message: "Access denied. Admin only." });
    }

    next();
  } catch (error) {
    console.error("❌ Error in admin middleware:", error);
    res.status(500).json({ success: false, message: "Authorization error" });
  }
};

// Middleware to check if user is hotel owner
export const owner = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.json({ success: false, message: "Not authenticated" });
    }

    if (req.user.role !== "hotelOwner") {
      return res.json({ success: false, message: "Access denied. Owner only." });
    }

    next();
  } catch (error) {
    console.error("❌ Error in owner middleware:", error);
    res.status(500).json({ success: false, message: "Authorization error" });
  }
};