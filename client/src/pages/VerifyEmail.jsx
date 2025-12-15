import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FiMail, FiClock, FiCheckCircle } from 'react-icons/fi';

const VerifyEmail = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const signupData = location.state;

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);

    // Redirect if no signup data
    useEffect(() => {
        if (!signupData || !signupData.email) {
            navigate('/register');
        }
    }, [signupData, navigate]);

    // Countdown timer
    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        } else {
            setCanResend(true);
        }
    }, [timer]);

    // Handle OTP input
    const handleOtpChange = (index, value) => {
        if (value.length > 1) return;
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`).focus();
        }
    };

    // Handle backspace
    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`).focus();
        }
    };

    // Handle paste
    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (!/^\d+$/.test(pastedData)) return;

        const newOtp = pastedData.split('');
        while (newOtp.length < 6) newOtp.push('');
        setOtp(newOtp);
    };

    // Verify OTP
    const handleVerify = async (e) => {
        e.preventDefault();
        const otpCode = otp.join('');

        if (otpCode.length !== 6) {
            setError('Please enter all 6 digits');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await axios.post('https://job-portal-and-resume-builder-pruy.vercel.app/api/auth/verify-email-otp', {
                email: signupData.email,
                otp: otpCode,
                name: signupData.name,
                password: signupData.password,
                role: signupData.role,
                profile: signupData.profile
            });

            setSuccess(res.data.message);
            setTimeout(() => {
                navigate('/login', {
                    state: { message: 'Email verified successfully! Please log in.' }
                });
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed');
            setOtp(['', '', '', '', '', '']);
            document.getElementById('otp-0').focus();
        } finally {
            setLoading(false);
        }
    };

    // Resend OTP
    const handleResend = async () => {
        if (!canResend) return;

        setLoading(true);
        setError('');

        try {
            const res = await axios.post('https://job-portal-and-resume-builder-pruy.vercel.app/api/auth/resend-signup-otp', {
                email: signupData.email
            });

            setSuccess('OTP resent successfully!');
            setTimer(60);
            setCanResend(false);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend OTP');
        } finally {
            setLoading(false);
        }
    };

    if (!signupData) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full p-8 rounded-2xl shadow-2xl">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiMail className="text-primary text-3xl" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
                    <p className="text-gray-600">
                        We've sent a 6-digit code to<br />
                        <span className="text-primary font-semibold">{signupData.maskedEmail || signupData.email}</span>
                    </p>
                </div>

                <form onSubmit={handleVerify} className="space-y-6">
                    {/* OTP Input */}
                    <div>
                        <label className="block text-sm text-gray-600 mb-3 text-center">Enter OTP</label>
                        <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    id={`otp-${index}`}
                                    type="text"
                                    maxLength="1"
                                    value={digit}
                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className="w-12 h-14 text-center text-2xl font-bold bg-gray-50 border-2 border-gray-300 rounded-lg text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all"
                                    disabled={loading}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                            <FiCheckCircle /> {success}
                        </div>
                    )}

                    {/* Verify Button */}
                    <button
                        type="submit"
                        disabled={loading || otp.join('').length !== 6}
                        className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Verifying...' : 'Verify Email'}
                    </button>

                    {/* Resend OTP */}
                    <div className="text-center">
                        {!canResend ? (
                            <p className="text-gray-600 text-sm flex items-center justify-center gap-2">
                                <FiClock /> Resend OTP in {timer}s
                            </p>
                        ) : (
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={loading}
                                className="text-primary hover:text-primary/80 font-semibold text-sm transition-colors"
                            >
                                Resend OTP
                            </button>
                        )}
                    </div>
                </form>

                {/* Back to Register */}
                <div className="mt-6 text-center">
                    <button
                        onClick={() => navigate('/register')}
                        className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
                    >
                        ← Back to Registration
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
