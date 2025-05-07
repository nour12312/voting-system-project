const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

// Generate MFA secret and QR code
const generateMFASecret = async (email) => {
  const secret = speakeasy.generateSecret({
    name: `VotingSystem:${email}`
  });

  const qrCode = await QRCode.toDataURL(secret.otpauth_url);

  return {
    secret: secret.base32,
    qrCode
  };
};

// Verify MFA token
const verifyMFAToken = (secret, token) => {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token,
    window: 1 // Allow 30 seconds clock skew
  });
};

// Generate backup codes
const generateBackupCodes = () => {
  const codes = [];
  for (let i = 0; i < 10; i++) {
    codes.push(Math.random().toString(36).substring(2, 15).toUpperCase());
  }
  return codes;
};

module.exports = {
  generateMFASecret,
  verifyMFAToken,
  generateBackupCodes
}; 