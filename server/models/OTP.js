const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    code: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['signup', 'reset'],
        required: true
    },
    verified: {
        type: Boolean,
        default: false
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 } // TTL index - MongoDB will auto-delete expired documents
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
otpSchema.index({ email: 1, type: 1 });

// Hash OTP code before saving
otpSchema.pre('save', async function (next) {
    if (!this.isModified('code')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.code = await bcrypt.hash(this.code, salt);
    next();
});

// Method to verify OTP
otpSchema.methods.verifyCode = async function (enteredCode) {
    return await bcrypt.compare(enteredCode, this.code);
};

module.exports = mongoose.model('OTP', otpSchema);
