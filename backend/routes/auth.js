const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { sendVerificationEmail, sendMFACode } = require('../utils/email');
const { generateMFASecret, verifyMFAToken } = require('../utils/mfa');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

// Validation middleware
const validateRegistration = [
  body('email').isEmail().normalizeEmail(),
  body('password').matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
  body('name').trim().notEmpty()
];

const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

// Helper: send email (simple version)
async function sendEmail(to, subject, text) {
  // Use your real SMTP config in production
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, text });
}

// Password policy regex
const passwordPolicy = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

// Register new user
router.post('/register', validateRegistration, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    // Create new user
    const user = new User({
      email,
      password,
      name,
      verificationToken: Math.random().toString(36).substring(2, 15),
      verified: false // Not verified until MFA
    });

    await user.save();

    // Send MFA code after registration
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.mfaCode = code;
    user.mfaExpires = Date.now() + 10 * 60 * 1000; // 10 min
    await user.save();
    await sendEmail(user.email, 'Your MFA Code', `Your MFA code is: ${code}`);

    res.status(201).json({
      message: 'Registration successful. Please check your email for MFA code.',
      requiresMFA: true
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

// Resend MFA code
router.post('/resend-mfa', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'No user with that email' });
  if (user.verified) return res.status(400).json({ message: 'User already verified' });
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  user.mfaCode = code;
  user.mfaExpires = Date.now() + 10 * 60 * 1000; // 10 min
  await user.save();
  await sendEmail(user.email, 'Your MFA Code', `Your MFA code is: ${code}`);
  res.json({ message: 'MFA code resent' });
});

// Login user
router.post('/login', validateLogin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // If not verified, send MFA code and allow MFA prompt
    if (!user.verified) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      user.mfaCode = code;
      user.mfaExpires = Date.now() + 10 * 60 * 1000; // 10 min
      await user.save();
      await sendEmail(user.email, 'Your MFA Code', `Your MFA code is: ${code}`);
      return res.status(200).json({
        message: 'Please complete MFA verification before logging in.',
        requiresMFA: true
      });
    }

    // Check if MFA is enabled (for extra security)
    if (user.mfaEnabled) {
      const mfaCode = await sendMFACode(user.email);
      return res.status(200).json({
        message: 'MFA code sent',
        requiresMFA: true,
        tempToken: jwt.sign(
          { userId: user._id },
          process.env.JWT_SECRET,
          { expiresIn: '5m' }
        )
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.json({
      token,
      user: user.getPublicProfile()
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// Verify MFA code
router.post('/verify-mfa', async (req, res) => {
  const { email, code, tempToken, mfaCode } = req.body;
  let user;
  if (tempToken && mfaCode) {
    // Login flow
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (user.mfaCode !== mfaCode || Date.now() > user.mfaExpires) {
      return res.status(400).json({ message: 'Invalid or expired MFA code' });
    }
    user.mfaCode = undefined;
    user.mfaExpires = undefined;
    await user.save();
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    return res.json({ token, user: user.getPublicProfile() });
  } else if (email && code) {
    // Registration flow
    user = await User.findOne({ email });
    if (!user || user.mfaCode !== code || Date.now() > user.mfaExpires) {
      return res.status(400).json({ message: 'Invalid or expired MFA code' });
    }
    user.mfaCode = undefined;
    user.mfaExpires = undefined;
    user.verified = true; // Mark user as verified
    await user.save();
    return res.json({ message: 'MFA verified' });
  } else {
    return res.status(400).json({ message: 'Invalid request' });
  }
});

// Verify token and get user data
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    res.json({
      user: user.getPublicProfile()
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    const token = jwt.sign(
      { userId: req.user._id, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

// GitHub OAuth routes
router.get('/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  (req, res) => {
    const token = jwt.sign(
      { userId: req.user._id, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

// Enable MFA
router.post('/enable-mfa', async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { secret, qrCode } = await generateMFASecret(user.email);
    user.mfaSecret = secret;
    user.mfaEnabled = true;
    await user.save();

    res.json({ qrCode });
  } catch (error) {
    res.status(500).json({ message: 'Error enabling MFA', error: error.message });
  }
});

// Disable MFA
router.post('/disable-mfa', async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.mfaEnabled = false;
    user.mfaSecret = undefined;
    await user.save();

    res.json({ message: 'MFA disabled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error disabling MFA', error: error.message });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'No user with that email' });
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  user.resetPasswordCode = code;
  user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 min
  await user.save();
  await sendEmail(user.email, 'Password Reset Code', `Your reset code is: ${code}`);
  res.json({ message: 'Reset code sent to email' });
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  const { email, code, password } = req.body;
  if (!email || !code || !password) return res.status(400).json({ message: 'All fields required' });
  if (!passwordPolicy.test(password)) return res.status(400).json({ message: 'Password must be at least 8 characters, include 1 uppercase letter and 1 special character.' });
  const user = await User.findOne({ email });
  if (!user || user.resetPasswordCode !== code || Date.now() > user.resetPasswordExpires) {
    return res.status(400).json({ message: 'Invalid or expired reset code' });
  }
  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordCode = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  res.json({ message: 'Password reset successful' });
});

// MFA: Send code to email
router.post('/send-mfa', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'No user with that email' });
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  user.mfaCode = code;
  user.mfaExpires = Date.now() + 10 * 60 * 1000; // 10 min
  await user.save();
  await sendEmail(user.email, 'Your MFA Code', `Your MFA code is: ${code}`);
  res.json({ message: 'MFA code sent' });
});

// MFA: Verify code
router.post('/verify-mfa', async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) return res.status(400).json({ message: 'Email and code required' });
  const user = await User.findOne({ email });
  if (!user || user.mfaCode !== code || Date.now() > user.mfaExpires) {
    return res.status(400).json({ message: 'Invalid or expired MFA code' });
  }
  user.mfaCode = undefined;
  user.mfaExpires = undefined;
  await user.save();
  res.json({ message: 'MFA verified' });
});

// Example GET route
router.get('/', (req, res) => {
  res.json({ message: 'Auth route is working!' });
});

module.exports = router; 