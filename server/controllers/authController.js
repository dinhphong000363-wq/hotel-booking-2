import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

export const register = async (req, res) => {
    try {
        const { name, email, phone, password, confirmPassword } = req.body;

        if (!name || !email || !phone || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        const phoneRegex = /^[0-9]{10,11}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid phone number format'
            });
        }

        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        const existingPhone = await User.findOne({ phone });
        if (existingPhone) {
            return res.status(400).json({
                success: false,
                message: 'Phone number already registered'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            name,
            email,
            phone,
            password: hashedPassword,
            provider: 'local',
            isVerified: false
        });

        const token = generateToken(user._id);

        const userResponse = {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            provider: user.provider,
            avatar: user.avatar,
            role: user.role,
            isVerified: user.isVerified,
            createdAt: user.createdAt
        };

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: userResponse
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        if (user.provider !== 'local') {
            return res.status(401).json({
                success: false,
                message: `This account is registered with ${user.provider}. Please use ${user.provider} login.`
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const token = generateToken(user._id);

        const userResponse = {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            provider: user.provider,
            avatar: user.avatar,
            role: user.role,
            isVerified: user.isVerified,
            createdAt: user.createdAt
        };

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: userResponse
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
};

export const getProfile = async (req, res) => {
    try {
        const user = req.user;

        const userResponse = {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            provider: user.provider,
            avatar: user.avatar,
            role: user.role,
            isVerified: user.isVerified,
            createdAt: user.createdAt
        };

        res.status(200).json({
            success: true,
            user: userResponse
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

export const logout = async (req, res) => {
    try {
        req.logout((err) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Logout error'
                });
            }
            res.status(200).json({
                success: true,
                message: 'Logout successful'
            });
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during logout'
        });
    }
};

export const socialAuthCallback = async (req, res) => {
    try {
        if (!req.user) {
            return res.redirect(`${process.env.CLIENT_URL}/login?error=authentication_failed`);
        }

        const token = generateToken(req.user._id);

        res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
    } catch (error) {
        console.error('Social auth callback error:', error);
        res.redirect(`${process.env.CLIENT_URL}/login?error=server_error`);
    }
};
