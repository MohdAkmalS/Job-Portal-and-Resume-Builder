const express = require('express');
const router = express.Router();
const {
    sendSignupOTP,
    verifyEmailOTP,
    resendSignupOTP,
    login,
    forgotPassword,
    verifyResetOTP,
    resetPassword,
    getMe,
    updateProfile,
    logout
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// OTP-based signup routes
router.post('/send-signup-otp', sendSignupOTP);
router.post('/verify-email-otp', verifyEmailOTP);
router.post('/resend-signup-otp', resendSignupOTP);

// Login route
router.post('/login', login);

// Password reset routes
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOTP);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);
router.get('/logout', logout);

module.exports = router;
