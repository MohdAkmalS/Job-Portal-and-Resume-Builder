const crypto = require('crypto');

// Generate a 6-digit OTP
const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString();
};

// Mask email for display (e.g., a******@gmail.com)
const maskEmail = (email) => {
    if (!email) return '';
    const [username, domain] = email.split('@');
    if (username.length <= 2) {
        return `${username[0]}*****@${domain}`;
    }
    const maskedUsername = username[0] + '*'.repeat(username.length - 2) + username[username.length - 1];
    return `${maskedUsername}@${domain}`;
};

// Calculate OTP expiration time (5 minutes from now)
const getOTPExpiration = () => {
    return new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
};

module.exports = {
    generateOTP,
    maskEmail,
    getOTPExpiration
};
