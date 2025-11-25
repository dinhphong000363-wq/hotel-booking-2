import mongoose from 'mongoose';
import 'dotenv/config';
import User from '../models/User.js';

// Script to check if a specific user exists in database
const checkUser = async (userId) => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const user = await User.findById(userId);

        if (user) {
            console.log('✅ User found:', user);
        } else {
            console.log('❌ User NOT found in database');
            console.log('💡 You need to:');
            console.log('1. Check if Clerk webhook is configured correctly');
            console.log('2. Make sure webhook URL is accessible from internet');
            console.log('3. Try logging in again to trigger webhook');
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

// Get user ID from command line argument
const userId = process.argv[2] || 'user_35pI55FIEqu5IcH3aHLs8kqvVeka';
checkUser(userId);
