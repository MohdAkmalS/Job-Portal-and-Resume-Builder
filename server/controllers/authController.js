const User = require("../models/User");
const OTP = require("../models/OTP");
const jwt = require("jsonwebtoken");

// const fs = require("fs"); 
// const path = require("path");

const {
    validatePassword,
    isWeakPassword
} = require("../utils/passwordValidator");

const {
    generateOTP,
    maskEmail,
    getOTPExpiration
} = require("../utils/otpUtils");

const {
    sendSignupOTP,
    sendResetOTP
} = require("../utils/emailService");

/* ===================== OTP RATE LIMIT ===================== */
const otpRateLimits = new Map();

/* ===================== COOKIE OPTIONS (FIXED FOR VERCEL) ===================== */
const cookieOptions = {
    httpOnly: true,
    secure: true,     // REQUIRED on Vercel
    sameSite: "none", // REQUIRED for cross-site cookies
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
};

/* ===================== LOGIN DEBUG LOG ===================== */
/* ===================== LOGIN DEBUG LOG ===================== */
// const logFile = path.join(__dirname, "../login-debug.log");

function logLoginAttempt(email, status, reason) {
    const msg = `${new Date().toISOString()} | ${email} | ${status} | ${reason}`;
    console.log(msg); // Use console.log for Vercel
}

/* ===================== SEND SIGNUP OTP ===================== */
exports.sendSignupOTP = async (req, res) => {
    try {
        const { name, email, password, role, profile } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ success: false, message: "All fields required" });
        }

        const passwordCheck = validatePassword(password);
        if (!passwordCheck.isValid) {
            return res.status(400).json({
                success: false,
                message: "Weak password",
                errors: passwordCheck.errors
            });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        const now = Date.now();
        const last = otpRateLimits.get(email);
        if (last && now - last < 60000) {
            return res.status(429).json({
                success: false,
                message: "Wait before requesting another OTP"
            });
        }

        const otpCode = generateOTP();
        await OTP.deleteMany({ email, type: "signup" });

        await OTP.create({
            email,
            code: otpCode,
            type: "signup",
            expiresAt: getOTPExpiration()
        });

        const emailResult = await sendSignupOTP(email, otpCode);
        if (!emailResult.success) {
            return res.status(500).json({ success: false, message: "OTP email failed" });
        }

        otpRateLimits.set(email, now);

        res.status(200).json({
            success: true,
            message: "OTP sent",
            maskedEmail: maskEmail(email)
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/* ===================== VERIFY SIGNUP OTP ===================== */
exports.verifyEmailOTP = async (req, res) => {
    try {
        const { email, otp, name, password, role, profile } = req.body;

        const otpRecord = await OTP.findOne({
            email,
            type: "signup",
            verified: false
        }).sort({ createdAt: -1 });

        if (!otpRecord || otpRecord.expiresAt < new Date()) {
            return res.status(400).json({ success: false, message: "OTP expired or invalid" });
        }

        const isValid = await otpRecord.verifyCode(otp);
        if (!isValid) {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }

        await User.create({
            name,
            email,
            password,
            role,
            profile,
            emailVerified: true
        });

        await OTP.deleteOne({ _id: otpRecord._id });
        otpRateLimits.delete(email);

        res.status(201).json({
            success: true,
            message: "Account created successfully"
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/* ===================== RESEND SIGNUP OTP ===================== */
exports.resendSignupOTP = async (req, res) => {
    res.status(501).json({ success: false, message: "Not implemented yet" });
};

/* ===================== FORGOT PASSWORD ===================== */
exports.forgotPassword = async (req, res) => {
    res.status(501).json({ success: false, message: "Not implemented yet" });
};

/* ===================== VERIFY RESET OTP ===================== */
exports.verifyResetOTP = async (req, res) => {
    res.status(501).json({ success: false, message: "Not implemented yet" });
};

/* ===================== RESET PASSWORD ===================== */
exports.resetPassword = async (req, res) => {
    res.status(501).json({ success: false, message: "Not implemented yet" });
};

/* ===================== LOGIN ===================== */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            logLoginAttempt(email || "unknown", "FAILED", "Missing credentials");
            return res.status(400).json({ success: false, message: "Email & password required" });
        }

        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            logLoginAttempt(email, "FAILED", "User not found");
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        if (!user.emailVerified) {
            return res.status(403).json({
                success: false,
                message: "Verify email before login"
            });
        }

        const match = await user.matchPassword(password);
        if (!match) {
            logLoginAttempt(email, "FAILED", "Wrong password");
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "30d"
        });

        logLoginAttempt(email, "SUCCESS", "Login successful");

        res
            .status(200)
            .cookie("token", token, cookieOptions)
            .json({
                success: true,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    profile: user.profile
                },
                weakPassword: isWeakPassword(password)
            });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/* ===================== GET CURRENT USER ===================== */
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/* ===================== UPDATE PROFILE ===================== */
exports.updateProfile = async (req, res) => {
    res.status(501).json({ success: false, message: "Not implemented yet" });
};

/* ===================== LOGOUT ===================== */
exports.logout = async (req, res) => {
    res.cookie("token", "", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        expires: new Date(0)
    });

    res.status(200).json({ success: true });
};
