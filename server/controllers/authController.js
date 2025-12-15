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
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        const user = await User.findOne({ email });
        if (user && user.emailVerified) {
            return res.status(400).json({ success: false, message: "Email already verified. Please login." });
        }
        // If user doesn't exist, we might want to fail silently or prompt to register, 
        // but for resend-signup context, usually we expect a pending flow.
        // However, specifically for "resend signup otp", usually the user is in the verification page 
        // implies they attempted signup. Ideally we check if there is an unverified user or just send.
        // But our signup flow creates user ONLY after verification. 
        // So we strictly re-issue OTP if they are in the buffer map or just generate new one.
        // Since we don't store partial users, this is effectively "Send Signup OTP" again but we skip user existence check if we want strict idempotence?
        // Actually, sendSignupOTP checks `User.findOne`. If user exists, it says "User already exists".
        // So this function is needed if the user *started* signup (OTP sent) but didn't verify, so User doc doesn't exist yet.
        // So logic is same as sendSignupOTP but without validating password/name requirement if we assume email is enough?
        // No, sendSignupOTP takes name/password.
        // If the frontend only passes `email` for resend, we might have a problem if we don't store temp data.
        // BUT, usually "Resend" button on verification page likely has access to the form data state.
        // IF NOT: We cannot re-send because we don't have the user's password/name to create the account later.
        // *** CRITICAL ***: Our `verifyEmailOTP` creates the user. 
        // If we "resend", we are just sending the code. 
        // The verify step needs `name, password, etc.` to be passed AGAIN.
        // So `resend` just needs to send an email with a code. 

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
            message: "OTP resent successfully"
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/* ===================== FORGOT PASSWORD ===================== */
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            // Security: Don't reveal user doesn't exist. Simulate success.
            // Or for friendly UX, tell them. Let's stick to friendly for this project.
            return res.status(404).json({ success: false, message: "User not found" });
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
        await OTP.deleteMany({ email, type: "reset" }); // Clear old reset OTPs

        await OTP.create({
            email,
            code: otpCode,
            type: "reset",
            expiresAt: getOTPExpiration()
        });

        const emailResult = await sendResetOTP(email, otpCode);
        if (!emailResult.success) {
            return res.status(500).json({ success: false, message: "Failed to send OTP" });
        }

        otpRateLimits.set(email, now);

        res.status(200).json({
            success: true,
            message: "Password reset OTP sent",
            maskedEmail: maskEmail(email)
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/* ===================== VERIFY RESET OTP ===================== */
exports.verifyResetOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const otpRecord = await OTP.findOne({
            email,
            type: "reset",
            verified: false
        }).sort({ createdAt: -1 });

        if (!otpRecord || otpRecord.expiresAt < new Date()) {
            return res.status(400).json({ success: false, message: "OTP expired or invalid" });
        }

        const isValid = await otpRecord.verifyCode(otp);
        if (!isValid) {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }

        // We mark it as verified or we just verify it during resetPassword. 
        // For UI flow "Verify -> Set New Password", we return success here.

        res.status(200).json({
            success: true,
            message: "OTP verified"
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/* ===================== RESET PASSWORD ===================== */
exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, password } = req.body;

        if (!email || !otp || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const passwordCheck = validatePassword(password);
        if (!passwordCheck.isValid) {
            return res.status(400).json({
                success: false,
                message: "Weak password",
                errors: passwordCheck.errors
            });
        }

        // Verify OTP again to be sure
        const otpRecord = await OTP.findOne({
            email,
            type: "reset",
            verified: false
        }).sort({ createdAt: -1 });

        if (!otpRecord || otpRecord.expiresAt < new Date()) {
            return res.status(400).json({ success: false, message: "OTP expired or invalid" });
        }

        const isValid = await otpRecord.verifyCode(otp);
        if (!isValid) {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }

        // Find user
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Update password
        user.password = password;
        await user.save();

        // Cleanup OTP
        await OTP.deleteOne({ _id: otpRecord._id });
        otpRateLimits.delete(email);

        res.status(200).json({
            success: true,
            message: "Password reset successfully. Please login."
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
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
    try {
        const fieldsToUpdate = req.body;
        const userId = req.user.id; // From middleware

        // Prevent updating sensitive fields
        delete fieldsToUpdate.password;
        delete fieldsToUpdate.email;
        delete fieldsToUpdate.role;
        delete fieldsToUpdate.emailVerified;
        delete fieldsToUpdate._id;

        // Handle profile fields specifically if needed, likely they are passed as 'profile.skills' etc, 
        // or just 'skills' and we need to map them. Use dot notation or merge?
        // Mongoose `findByIdAndUpdate` needs flat paths for nested object updates to assume specific fields: "profile.skills"
        // If the front end sends: { profile: { skills: [...] } } then it replaces the whole profile object if we aren't careful?
        // No, standard Mongoose update with { $set: ... } or just using `user.profile.x = y` and `user.save()`.

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Merge top level fields
        if (fieldsToUpdate.name) user.name = fieldsToUpdate.name;
        if (fieldsToUpdate.phoneNumber) user.phoneNumber = fieldsToUpdate.phoneNumber;

        // Merge profile fields
        // Assuming `req.body.profile` contains the updates for the profile object
        if (fieldsToUpdate.profile) {
            // We use specialized deep merge or just careful assignment
            // For simplicity in this project, we might just iterate keys
            for (const key in fieldsToUpdate.profile) {
                user.profile[key] = fieldsToUpdate.profile[key];
            }
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
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
