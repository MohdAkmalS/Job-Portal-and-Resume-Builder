const User = require('../models/User');
const OTP = require('../models/OTP');
const jwt = require('jsonwebtoken');
const { validatePassword, isWeakPassword } = require('../utils/passwordValidator');
const { generateOTP, maskEmail, getOTPExpiration } = require('../utils/otpUtils');
const { sendSignupOTP, sendResetOTP } = require('../utils/emailService');

// Rate limiting store (in production, use Redis)
const otpRateLimits = new Map();

// Helper to generate Token and Cookie
const sendTokenResponse = (user, statusCode, res) => {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });

    const options = {
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
        options.sameSite = 'none';
    }

    res.status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profile: user.profile
            }
        });
};

// @desc    Send OTP for signup (replaces direct registration)
// @route   POST /api/auth/send-signup-otp
// @access  Public
exports.sendSignupOTP = async (req, res) => {
    try {
        const { name, email, password, role, profile } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Validate password strength
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Password does not meet security requirements',
                errors: passwordValidation.errors
            });
        }

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Check rate limiting
        const now = Date.now();
        const lastRequest = otpRateLimits.get(email);
        if (lastRequest && (now - lastRequest) < 60000) {
            const waitTime = Math.ceil((60000 - (now - lastRequest)) / 1000);
            return res.status(429).json({
                success: false,
                message: `Please wait ${waitTime} seconds before requesting a new OTP`
            });
        }

        // Generate OTP
        const otpCode = generateOTP();

        // Delete any existing OTPs for this email
        await OTP.deleteMany({ email, type: 'signup' });

        // Create new OTP
        await OTP.create({
            email,
            code: otpCode,
            type: 'signup',
            expiresAt: getOTPExpiration()
        });

        // Send OTP email
        const emailResult = await sendSignupOTP(email, otpCode);
        if (!emailResult.success) {
            console.error('Send OTP Error:', emailResult.error);
            return res.status(500).json({
                success: false,
                message: 'Failed to send OTP email: ' + (emailResult.error || 'Unknown error')
            });
        }

        // Update rate limit
        otpRateLimits.set(email, now);

        res.status(200).json({
            success: true,
            message: 'OTP sent successfully',
            maskedEmail: maskEmail(email)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Verify email OTP and create account
// @route   POST /api/auth/verify-email-otp
// @access  Public
exports.verifyEmailOTP = async (req, res) => {
    try {
        const { email, otp, name, password, role, profile } = req.body;

        if (!email || !otp || !name || !password || !role) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Find the most recent OTP for this email
        const otpRecord = await OTP.findOne({
            email,
            type: 'signup',
            verified: false
        }).sort({ createdAt: -1 });

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: 'No OTP found. Please request a new one.'
            });
        }

        // Check if OTP is expired
        if (otpRecord.expiresAt < new Date()) {
            await OTP.deleteOne({ _id: otpRecord._id });
            return res.status(400).json({
                success: false,
                message: 'OTP expired. Please request a new one.'
            });
        }

        // Verify OTP
        const isValid = await otpRecord.verifyCode(otp);
        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP. Please try again.'
            });
        }

        // Create user account
        const user = await User.create({
            name,
            email,
            password,
            role,
            profile,
            emailVerified: true
        });

        // Delete the OTP
        await OTP.deleteOne({ _id: otpRecord._id });

        // Clear rate limit
        otpRateLimits.delete(email);

        res.status(201).json({
            success: true,
            message: 'Email verified successfully. You can now log in.'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Resend signup OTP
// @route   POST /api/auth/resend-signup-otp
// @access  Public
exports.resendSignupOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email'
            });
        }

        // Check rate limiting
        const now = Date.now();
        const lastRequest = otpRateLimits.get(email);
        if (lastRequest && (now - lastRequest) < 60000) {
            const waitTime = Math.ceil((60000 - (now - lastRequest)) / 1000);
            return res.status(429).json({
                success: false,
                message: `Please wait ${waitTime} seconds before requesting a new OTP`
            });
        }

        // Generate new OTP
        const otpCode = generateOTP();

        // Delete old OTPs
        await OTP.deleteMany({ email, type: 'signup' });

        // Create new OTP
        await OTP.create({
            email,
            code: otpCode,
            type: 'signup',
            expiresAt: getOTPExpiration()
        });

        // Send OTP email
        const emailResult = await sendSignupOTP(email, otpCode);
        if (!emailResult.success) {
            console.error('Send OTP Error:', emailResult.error);
            return res.status(500).json({
                success: false,
                message: 'Failed to send OTP email: ' + (emailResult.error || 'Unknown error')
            });
        }

        // Update rate limit
        otpRateLimits.set(email, now);

        res.status(200).json({
            success: true,
            message: 'OTP resent successfully',
            maskedEmail: maskEmail(email)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const fs = require('fs');
const path = require('path');
const logFile = path.join(__dirname, '../login-debug.log');

function logLoginAttempt(email, status, reason) {
    const msg = `${new Date().toISOString()} - Login Attempt: ${email} | Status: ${status} | Reason: ${reason}\n`;
    try {
        fs.appendFileSync(logFile, msg);
        console.log("Logged:", msg.trim());
    } catch (e) {
        console.error("Logging failed", e);
    }
}

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            logLoginAttempt(email || 'unknown', 'FAILED', 'Missing credentials');
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            logLoginAttempt(email, 'FAILED', 'User not found in DB');
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Check if email is verified
        if (!user.emailVerified) {
            logLoginAttempt(email, 'FAILED', 'Email not verified');
            return res.status(403).json({
                success: false,
                message: 'Please verify your email before logging in'
            });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            logLoginAttempt(email, 'FAILED', 'Password mismatch');
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        logLoginAttempt(email, 'SUCCESS', 'Login successful');

        // Check if password is weak
        const weakPassword = isWeakPassword(password);

        res.status(200)
            .cookie('token', jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' }), {
                expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
            })
            .json({
                success: true,
                token: jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' }),
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    profile: user.profile
                },
                weakPassword
            });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Send OTP for password reset
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email'
            });
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No account found with this email.'
            });
        }

        // Check rate limiting
        const now = Date.now();
        const lastRequest = otpRateLimits.get(email);
        if (lastRequest && (now - lastRequest) < 60000) {
            const waitTime = Math.ceil((60000 - (now - lastRequest)) / 1000);
            return res.status(429).json({
                success: false,
                message: `Please wait ${waitTime} seconds before requesting a new OTP`
            });
        }

        // Generate OTP
        const otpCode = generateOTP();

        // Delete old reset OTPs
        await OTP.deleteMany({ email, type: 'reset' });

        // Create new OTP
        await OTP.create({
            email,
            code: otpCode,
            type: 'reset',
            expiresAt: getOTPExpiration()
        });

        // Send OTP email
        const emailResult = await sendResetOTP(email, otpCode);
        if (!emailResult.success) {
            return res.status(500).json({
                success: false,
                message: 'Failed to send OTP email. Please try again.'
            });
        }

        // Update rate limit
        otpRateLimits.set(email, now);

        res.status(200).json({
            success: true,
            message: 'Password reset OTP sent successfully',
            maskedEmail: maskEmail(email)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Verify reset OTP
// @route   POST /api/auth/verify-reset-otp
// @access  Public
exports.verifyResetOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and OTP'
            });
        }

        // Find the most recent reset OTP
        const otpRecord = await OTP.findOne({
            email,
            type: 'reset',
            verified: false
        }).sort({ createdAt: -1 });

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: 'No OTP found. Please request a new one.'
            });
        }

        // Check if expired
        if (otpRecord.expiresAt < new Date()) {
            await OTP.deleteOne({ _id: otpRecord._id });
            return res.status(400).json({
                success: false,
                message: 'OTP expired. Please request a new one.'
            });
        }

        // Verify OTP
        const isValid = await otpRecord.verifyCode(otp);
        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP. Please try again.'
            });
        }

        // Mark as verified
        otpRecord.verified = true;
        await otpRecord.save();

        res.status(200).json({
            success: true,
            message: 'OTP verified successfully. You can now reset your password.'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and new password'
            });
        }

        // Validate password strength
        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Password does not meet security requirements',
                errors: passwordValidation.errors
            });
        }

        // Check if there's a verified reset OTP
        const otpRecord = await OTP.findOne({
            email,
            type: 'reset',
            verified: true
        }).sort({ createdAt: -1 });

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: 'Please verify OTP first'
            });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        // Delete the OTP
        await OTP.deleteOne({ _id: otpRecord._id });

        // Clear rate limit
        otpRateLimits.delete(email);

        res.status(200).json({
            success: true,
            message: 'Password reset successfully. Please log in.'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profile: user.profile,
                phoneNumber: user.phoneNumber
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
// @desc    Update user profile (Seeker)
// @route   PUT /api/auth/update-profile
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Update basic info
        if (req.body.name) user.name = req.body.name;
        if (req.body.phoneNumber) user.phoneNumber = req.body.phoneNumber;

        // Update Profile fields
        if (req.body.profile) {
            // Merge existing profile with new data to avoid overwriting missing fields if sending partial updates
            // But for resume builder save, we usually send the whole object. 
            // Let's assume we want to overwrite the specific fields provided.

            const profileFields = [
                'skills', 'about', 'social', 'education', 'experience',
                'projects', 'certifications', 'publications', 'areasOfInterest',
                'achievements', 'hobbies', 'resumePreferences', 'resumeOriginal', 'profileImage',
                'companyName', 'companyWebsite', 'address', 'description', 'designation', 'department'
            ];

            profileFields.forEach(field => {
                if (req.body.profile[field] !== undefined) {
                    user.profile[field] = req.body.profile[field];
                }
            });
        }

        await user.save();

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profile: user.profile,
                phoneNumber: user.phoneNumber
            },
            message: 'Profile updated successfully'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};
// @desc    Log out user / clear cookie
// @route   GET /api/auth/logout
// @access  Public
exports.logout = async (req, res) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });

    res.status(200).json({
        success: true,
        data: {}
    });
};
