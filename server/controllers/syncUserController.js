import User from "../models/User.js";

// Manual sync user from Clerk to database
export const syncCurrentUser = async (req, res) => {
    try {
        const auth = req.auth();
        const { userId } = auth || {};

        if (!userId) {
            return res.json({ success: false, message: "Not authenticated" });
        }

        // Get user data from request body (sent from frontend)
        const { email, username, image } = req.body;

        if (!email) {
            return res.json({
                success: false,
                message: "Email is required for sync"
            });
        }

        // Check if user exists
        let user = await User.findById(userId);

        if (user) {
            // Update existing user
            user.email = email;
            user.username = username || user.username;
            user.image = image || user.image;
            await user.save();

            console.log("✅ User updated:", user.email);

            return res.json({
                success: true,
                message: "User updated successfully",
                user
            });
        }

        // Create new user in database
        user = await User.create({
            _id: userId,
            email: email,
            username: username || email.split('@')[0],
            image: image || 'https://via.placeholder.com/150',
        });

        console.log("✅ User synced:", user.email);

        res.json({
            success: true,
            message: "User synced successfully",
            user
        });

    } catch (error) {
        console.error("❌ Error syncing user:", error);
        res.status(500).json({
            success: false,
            message: "Error syncing user",
            error: error.message
        });
    }
};
