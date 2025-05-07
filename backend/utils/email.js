const nodemailer = require('nodemailer');

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Send verification email
const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Verify Your Email Address',
    html: `
      <h1>Welcome to the Voting System!</h1>
      <p>Please click the link below to verify your email address:</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
      <p>This link will expire in 24 hours.</p>
      <p>If you did not create an account, please ignore this email.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

// Send MFA code
const sendMFACode = async (email) => {
  const mfaCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Your MFA Code',
    html: `
      <h1>Your MFA Code</h1>
      <p>Your MFA code is: <strong>${mfaCode}</strong></p>
      <p>This code will expire in 5 minutes.</p>
      <p>If you did not request this code, please ignore this email and contact support.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return mfaCode;
  } catch (error) {
    console.error('Error sending MFA code:', error);
    throw new Error('Failed to send MFA code');
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Reset Your Password',
    html: `
      <h1>Password Reset Request</h1>
      <p>Please click the link below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you did not request a password reset, please ignore this email.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

module.exports = {
  sendVerificationEmail,
  sendMFACode,
  sendPasswordResetEmail
}; 