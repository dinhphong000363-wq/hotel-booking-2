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
