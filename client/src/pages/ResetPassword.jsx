import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FiLock, FiEye, FiEyeOff, FiCheckCircle, FiX } from 'react-icons/fi';

const ResetPassword = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const resetData = location.state;

    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [passwordErrors, setPasswordErrors] = useState([]);

    // Password validation
    const validatePassword = (password) => {
        const errors = [];
        if (password.length < 8) errors.push('At least 8 characters');
        if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
        if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
        if (!/[0-9]/.test(password)) errors.push('One number');
        if (!/[!@#$%^&*]/.test(password)) errors.push('One special character (!@#$%^&*)');
        return errors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name === 'newPassword') {
            setPasswordErrors(validatePassword(value));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (passwordErrors.length > 0) {
            setError('Password does not meet security requirements');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await axios.post('https://jobportal-backend.vercel.app/api/auth/reset-password', {
                email: resetData.email,
                newPassword: formData.newPassword
            });

            navigate('/login', {
                state: { message: 'Password reset successfully! Please log in.' }
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    if (!resetData || !resetData.email) {
        navigate('/forgot-password');
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
            <div className="glass max-w-md w-full p-8 rounded-2xl border border-white/10">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiLock className="text-primary text-3xl" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Reset Password</h2>
                    <p className="text-gray-400">Create a new secure password</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* New Password */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">New Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                className="input-field pr-10"
                                placeholder="Enter new password"
                                required
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                                {showPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                    </div>

                    {/* Password Strength Indicator */}
                    {formData.newPassword && (
                        <div className="space-y-2">
                            <p className="text-xs text-gray-400">Password must contain:</p>
                            <div className="space-y-1">
                                {['At least 8 characters', 'One uppercase letter', 'One lowercase letter', 'One number', 'One special character (!@#$%^&*)'].map((req, i) => {
                                    const isValid = !passwordErrors.includes(req);
                                    return (
                                        <div key={i} className={`flex items-center gap-2 text-xs ${isValid ? 'text-green-400' : 'text-gray-500'}`}>
                                            {isValid ? <FiCheckCircle className="text-green-400" /> : <FiX className="text-gray-500" />}
                                            {req}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Confirm Password</label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="input-field pr-10"
                                placeholder="Confirm new password"
                                required
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                    </div>

                    {/* Password Match Indicator */}
                    {formData.confirmPassword && (
                        <div className={`text-xs ${formData.newPassword === formData.confirmPassword ? 'text-green-400' : 'text-red-400'}`}>
                            {formData.newPassword === formData.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || passwordErrors.length > 0 || formData.newPassword !== formData.confirmPassword}
                        className="w-full btn-primary py-3 disabled:opacity-50"
                    >
                        {loading ? 'Resetting Password...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
