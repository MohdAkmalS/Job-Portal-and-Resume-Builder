import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiLock, FiCheck } from 'react-icons/fi';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';

const ChangePassword = () => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
        setSuccess('');
    };

    const validatePasswordStrength = (password) => {
        const criteria = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[!@#$%^&*()_+\-=\{\}\[\]\/?..,]/.test(password)
        };
        return Object.values(criteria).every(Boolean);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validate new password strength
        if (!validatePasswordStrength(formData.newPassword)) {
            return setError('Password must include minimum 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.');
        }

        // Check if passwords match
        if (formData.newPassword !== formData.confirmPassword) {
            return setError("New passwords don't match");
        }

        // Check if new password is different from current
        if (formData.currentPassword === formData.newPassword) {
            return setError("New password must be different from current password");
        }

        setLoading(true);

        try {
            await axios.put(
                'https://jobportal-backend.vercel.app/api/auth/change-password',
                {
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword
                },
                { withCredentials: true }
            );

            setSuccess('Password updated successfully!');
            setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });

            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.errors?.join(', ') || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-12 px-4">
            {/* Background Blobs */}
            <div className="absolute top-20 -left-10 w-96 h-96 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
            <div className="absolute bottom-20 -right-10 w-96 h-96 bg-secondary rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>

            <div className="max-w-md w-full glass p-8 rounded-2xl relative z-10">
                <div className="text-center mb-8">
                    <div className="h-16 w-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiLock size={32} />
                    </div>
                    <h2 className="text-3xl font-bold text-white">Change Password</h2>
                    <p className="text-muted mt-2">Update your password to keep your account secure</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-3 rounded-lg mb-4 text-sm flex items-center gap-2">
                        <FiCheck /> {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-text mb-1">Current Password</label>
                        <input
                            type="password"
                            name="currentPassword"
                            required
                            className="input-field"
                            placeholder="Enter current password"
                            value={formData.currentPassword}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text mb-1">New Password</label>
                        <input
                            type="password"
                            name="newPassword"
                            required
                            className="input-field"
                            placeholder="Enter new password"
                            value={formData.newPassword}
                            onChange={handleChange}
                        />
                        <PasswordStrengthIndicator password={formData.newPassword} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text mb-1">Confirm New Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            required
                            className="input-field"
                            placeholder="Confirm new password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="text-sm text-muted hover:text-white transition"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;
