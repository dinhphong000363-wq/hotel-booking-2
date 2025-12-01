import express from 'express';
import passport from '../config/passport.js';
import {
    register,
    login,
    getProfile,
    logout,
    socialAuthCallback
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);

router.post('/login', login);

router.get('/profile', authenticateToken, getProfile);

router.post('/logout', logout);

router.get('/google',
    passport.authenticate('google', {
        scope: ['profile', 'email']
    })
);

router.get('/google/callback',
    passport.authenticate('google', {
        failureRedirect: `${process.env.CLIENT_URL}/login?error=google_auth_failed`,
        session: true
    }),
    socialAuthCallback
);

export default router;
