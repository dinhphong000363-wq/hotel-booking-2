import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const fixDuplicateUserPrefix = async () => {
    try {
        // Connect to MongoDB - add database name if not in URI
        const mongoUri = process.env.MONGODB_URI.includes('?')
            ? process.env.MONGODB_URI
            : `${process.env.MONGODB_URI}/hotel-booking`;

        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        // Find all users
        const users = await User.find({});
        console.log(`📊 Found ${users.length} users to check`);

        let fixedCount = 0;

        for (const user of users) {
            let needsUpdate = false;
            const updates = {};

            // Check and fix username with duplicate "user_" prefix
            if (user.username) {
                let cleanUsername = user.username.replace(/^(user_)+/gi, '');

                // If username is too short or looks like random ID, use email username
                if (cleanUsername.length < 3 || /^[a-zA-Z0-9]{2,5}$/.test(cleanUsername)) {
                    const emailUsername = user.email.split('@')[0];
                    // Remove "user_" prefix from email username too
                    cleanUsername = emailUsername.replace(/^(user_)+/gi, '');
                    console.log(`🔧 Improving username: "${user.username}" -> "${cleanUsername}" (from email)`);
                } else if (cleanUsername !== user.username) {
                    console.log(`🔧 Fixing username: "${user.username}" -> "${cleanUsername}"`);
                }

                if (cleanUsername !== user.username) {
                    updates.username = cleanUsername;
                    needsUpdate = true;
                }
            }

            // Check and fix email with duplicate "user_" prefix
            if (user.email) {
                const cleanEmail = user.email.replace(/^(user_)+/gi, '');
                if (cleanEmail !== user.email) {
                    updates.email = cleanEmail;
                    needsUpdate = true;
                    console.log(`🔧 Fixing email: "${user.email}" -> "${cleanEmail}"`);
                }
            }

            // Update if needed
            if (needsUpdate) {
                await User.findByIdAndUpdate(user._id, updates);
                fixedCount++;
            }
        }

        console.log(`\n✅ Fixed ${fixedCount} users with duplicate prefixes`);
        console.log(`✅ ${users.length - fixedCount} users were already correct`);

        await mongoose.connection.close();
        console.log('✅ Database connection closed');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

fixDuplicateUserPrefix();
