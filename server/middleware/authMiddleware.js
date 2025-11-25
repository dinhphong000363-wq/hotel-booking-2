import User from "../models/User.js";

// Middleware to check if user is authenticated
export const protect = async (req, res, next) => {
  try {
    // ✅ Fix deprecated req.auth - use as function
    const auth = req.auth();
    const { userId } = auth || {};

    if (!userId) {
      return res.json({ success: false, message: "Not authenticated" });
    }

    // Find user in DB by Clerk ID
    let user = await User.findById(userId);

    // ✅ Auto-create user if not found (fallback for webhook issues)
    if (!user) {
      console.log("⚠️ User not found in database for ID:", userId);
      console.log("🔄 Creating placeholder user - please sync via /api/user/sync");

      try {
        // Create a basic user entry
        user = await User.create({
          _id: userId,
          email: `${userId}@placeholder.com`,
          username: `User_${userId.slice(-8)}`,
          image: 'https://via.placeholder.com/150',
        });
        console.log("✅ Placeholder user created. User should call /api/user/sync to update details.");
      } catch (createError) {
        console.error("❌ Error auto-creating user:", createError);
        return res.json({
          success: false,
          message: "User not found. Please sync your account at /api/user/sync"
        });
      }
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