import User from "../models/User.js";

// Middleware to check if user is authenticated
export const protect = async (req, res, next) => {
  try {
    console.log("🧩 req.auth:", req.auth); // 👉 Log để xem Clerk có gửi userId không

    const { userId } = req.auth || {};

    if (!userId) {
      return res.json({ success: false, message: "Not authenticated" });
    }

    // 👉 Tìm user trong DB theo ID Clerk
    const user = await User.findById(userId);

    if (!user) {
      console.log("⚠️ User not found in database for ID:", userId);
      return res.json({ success: false, message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("❌ Error in protect middleware:", error);
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