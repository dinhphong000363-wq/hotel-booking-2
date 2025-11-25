import User from "../models/User.js";
import { Webhook } from "svix";

const clerkWebhooks = async (req, res) => {
    try {
        console.log("📥 Webhook received - Type:", req.body?.type);

        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

        const headers = {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"],
        };

        // ✅ Verify the signature
        await whook.verify(JSON.stringify(req.body), headers);

        // ✅ Extract data
        const { data, type } = req.body;
        console.log("✅ Webhook verified - Processing:", type);



        switch (type) {
            case "user.created": {
                try {
                    const userData = {
                        _id: data.id,
                        email: data.email_addresses[0].email_address,
                        username: `${data.first_name || ''} ${data.last_name || ''}`.trim() || data.email_addresses[0].email_address.split('@')[0],
                        image: data.image_url || 'https://via.placeholder.com/150',
                    };

                    // Check if user already exists
                    const existingUser = await User.findById(data.id);
                    if (existingUser) {
                        console.log('⚠️ User already exists, updating instead:', userData.email);
                        await User.findByIdAndUpdate(data.id, userData);
                    } else {
                        await User.create(userData);
                        console.log('✅ User created:', userData.email);
                    }
                } catch (err) {
                    console.error('❌ Error creating user:', err.message);
                }
                break;
            }
            case "user.updated": {
                try {
                    const userData = {
                        email: data.email_addresses[0].email_address,
                        username: `${data.first_name || ''} ${data.last_name || ''}`.trim() || data.email_addresses[0].email_address.split('@')[0],
                        image: data.image_url || 'https://via.placeholder.com/150',
                    };
                    await User.findByIdAndUpdate(data.id, userData);
                    console.log('✅ User updated:', userData.email);
                } catch (err) {
                    console.error('❌ Error updating user:', err.message);
                }
                break;
            }
            case "user.deleted": {
                try {
                    await User.findByIdAndDelete(data.id);
                    console.log('✅ User deleted:', data.id);
                } catch (err) {
                    console.error('❌ Error deleting user:', err.message);
                }
                break;
            }
            default:
                console.log('⚠️ Unhandled webhook type:', type);
                break;
        }

        res.status(200).json({ success: true, message: "Webhook Received" });
    } catch (error) {
        console.error("❌ Clerk webhook error:", error.message);
        console.error("Error details:", error);
        // Always return 200 to prevent Clerk from retrying
        res.status(200).json({ success: false, message: error.message });
    }
};

export default clerkWebhooks;
