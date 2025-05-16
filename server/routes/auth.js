const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

// Configure nodemailer (replace with your SMTP credentials)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER || 'your-email@gmail.com',
        pass: process.env.SMTP_PASS || 'your-email-password'
    }
});

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Sanitize inputs
        const sanitizedName = name.trim();
        const sanitizedEmail = email.trim().toLowerCase();

        // Password policy: min 8 chars, upper, lower, number, special char
        const passwordPolicy = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
        if (!passwordPolicy.test(password)) {
            return res.status(400).json({
                message: 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: sanitizedEmail });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // Create new user (unverified)
        const user = new User({
            name: sanitizedName,
            email: sanitizedEmail,
            password,
            isVerified: false,
            verificationToken
        });

        await user.save();

        // Send verification email
        const verifyUrl = `${BACKEND_URL}/api/auth/verify-email?token=${verificationToken}`;
        await transporter.sendMail({
            from: process.env.SMTP_USER || 'your-email@gmail.com',
            to: sanitizedEmail,
            subject: 'Verify your email',
            html: `<p>Hi ${sanitizedName},</p><p>Please verify your email by clicking the link below:</p><a href="${verifyUrl}">${verifyUrl}</a>`
        });

        res.status(201).json({
            message: 'User registered successfully. Please check your email to verify your account.'
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Error registering user' });
    }
});

// Email verification endpoint
router.get('/verify-email', async (req, res) => {
    try {
        const { token } = req.query;
        const user = await User.findOne({ verificationToken: token });
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification token.' });
        }
        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();
        res.json({ message: 'Email verified successfully. You can now log in.' });
    } catch (error) {
        res.status(500).json({ message: 'Error verifying email', error: error.message });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Sanitize email
        const sanitizedEmail = email.trim().toLowerCase();

        // Find user
        const user = await User.findOne({ email: sanitizedEmail });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check if email is verified
        if (!user.isVerified) {
            return res.status(403).json({ message: 'Please verify your email before logging in.' });
        }

        // Check for lockout
        if (user.lockUntil && user.lockUntil > Date.now()) {
            const secondsLeft = Math.ceil((user.lockUntil - Date.now()) / 1000);
            return res.status(429).json({ message: `Account locked. Try again in ${secondsLeft} seconds.` });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            user.loginAttempts = (user.loginAttempts || 0) + 1;
            // Lock account if 3 failed attempts
            if (user.loginAttempts >= 3) {
                user.lockUntil = Date.now() + 30 * 1000; // 30 seconds
                await user.save();
                return res.status(429).json({ message: 'Account locked due to too many failed attempts. Try again in 30 seconds.' });
            }
            await user.save();
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Reset loginAttempts and lockUntil on successful login
        user.loginAttempts = 0;
        user.lockUntil = undefined;
        await user.save();

        // Generate JWT token
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET environment variable is not set');
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error logging in' });
    }
});

// Forgot password endpoint
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(200).json({ message: 'If that email is registered, a reset link has been sent.' });
        }
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();
        const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;
        await transporter.sendMail({
            from: process.env.SMTP_USER || 'your-email@gmail.com',
            to: email,
            subject: 'Password Reset Request',
            html: `<p>Hi,</p><p>You requested a password reset. Click the link below to reset your password:</p><a href="${resetUrl}">${resetUrl}</a><p>If you did not request this, please ignore this email.</p>`
        });
        res.status(200).json({ message: 'If that email is registered, a reset link has been sent.' });
    } catch (error) {
        res.status(500).json({ message: 'Error sending reset email', error: error.message });
    }
});

// Reset password endpoint
router.post('/reset-password', async (req, res) => {
    try {
        const { token, password } = req.body;
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token.' });
        }
        // Password policy: min 8 chars, upper, lower, number, special char
        const passwordPolicy = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
        if (!passwordPolicy.test(password)) {
            return res.status(400).json({
                message: 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.'
            });
        }
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        res.json({ message: 'Password has been reset successfully. You can now log in.' });
    } catch (error) {
        res.status(500).json({ message: 'Error resetting password', error: error.message });
    }
});

module.exports = router; 