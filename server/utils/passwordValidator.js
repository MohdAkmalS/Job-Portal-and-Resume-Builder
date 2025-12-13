// Password validation utility
const WEAK_PASSWORDS = [
    'password', 'password123', 'password1',
    '123456', '12345678', '123456789', '1234567890',
    'qwerty', 'qwerty123', 'qwertyuiop',
    'admin', 'admin123', 'administrator',
    'abc123', 'abc123456',
    'welcome', 'welcome123',
    'letmein', 'monkey', 'dragon',
    'master', 'sunshine', 'princess',
    'login', 'passw0rd', 'password!',
    'admin@123', 'Admin@123'
];

/**
 * Validates password against security requirements
 * @param {string} password - Password to validate
 * @returns {Object} - { isValid: boolean, errors: string[], strength: string }
 */
const validatePassword = (password) => {
    const errors = [];

    // Check minimum length
    if (!password || password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }

    // Check for uppercase letter
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }

    // Check for lowercase letter
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }

    // Check for number
    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }

    // Check for special character
    if (!/[!@#$%^&*()_+\-=\{\}\[\]\/?..,]/.test(password)) {
        errors.push('Password must contain at least one special character (!@#$%^&*()_+-={}[]/?.,)');
    }

    // Check against weak password list
    if (WEAK_PASSWORDS.includes(password.toLowerCase())) {
        errors.push('This password is too common and not allowed');
    }

    const strength = checkPasswordStrength(password);

    return {
        isValid: errors.length === 0,
        errors,
        strength
    };
};

/**
 * Checks password strength level
 * @param {string} password - Password to check
 * @returns {string} - 'weak', 'medium', or 'strong'
 */
const checkPasswordStrength = (password) => {
    if (!password) return 'weak';

    let score = 0;

    // Length check
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;

    // Character variety
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*()_+\-=\{\}\[\]\/?..,]/.test(password)) score++;

    // Weak password check
    if (WEAK_PASSWORDS.includes(password.toLowerCase())) {
        return 'weak';
    }

    // Determine strength
    if (score <= 3) return 'weak';
    if (score <= 5) return 'medium';
    return 'strong';
};

/**
 * Checks if password is in weak password list
 * @param {string} password - Password to check
 * @returns {boolean}
 */
const isWeakPassword = (password) => {
    return WEAK_PASSWORDS.includes(password.toLowerCase());
};

module.exports = {
    validatePassword,
    checkPasswordStrength,
    isWeakPassword,
    WEAK_PASSWORDS
};
