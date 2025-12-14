import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails[0].value;

        let user = await User.findOne({ email });

        if (user) {
            if (user.provider !== 'google' && user.providerId) {
                return done(null, false, { message: 'Email already registered with different provider' });
            }

            // Always update avatar and provider info for Google users
            let needsUpdate = false;

            if (!user.providerId) {
                user.provider = 'google';
                user.providerId = profile.id;
                needsUpdate = true;
            }

            // Update avatar if it's different or missing
            const newAvatar = profile.photos[0]?.value || '';
            if (newAvatar && user.avatar !== newAvatar) {
                user.avatar = newAvatar;
                needsUpdate = true;
            }

            if (needsUpdate) {
                await user.save();
            }

            return done(null, user);
        }

        user = await User.create({
            name: profile.displayName,
            email: email,
            provider: 'google',
            providerId: profile.id,
            avatar: profile.photos[0]?.value || '',
            isVerified: true,
            password: null
        });

        done(null, user);
    } catch (error) {
        done(error, null);
    }
}));

export default passport;
