import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FiShield, FiClock, FiCheckCircle } from 'react-icons/fi';

const ResetPasswordOTP = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const resetData = location.state;

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        if (!resetData || !resetData.email) {
            navigate('/forgot-password');
        }
    }, [resetData, navigate]);

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
            return () => clearInterval(interval);
        } else {
            setCanResend(true);
        }
    }, [timer]);

    const handleOtpChange = (index, value) => {
        if (value.length > 1) return;
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`).focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`).focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (!/^\d+$/.test(pastedData)) return;

        const newOtp = pastedData.split('');
        while (newOtp.length < 6) newOtp.push('');
        setOtp(newOtp);
    };

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
            await axios.post('https://job-portal-and-resume-builder-pruy.vercel.app/api/auth/verify-reset-otp', {
                email: resetData.email,
                otp: otpCode
            });

            setSuccess('OTP verified! Redirecting...');
            setTimeout(() => {
                navigate('/reset-password', { state: { email: resetData.email } });
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed');
            setOtp(['', '', '', '', '', '']);
            document.getElementById('otp-0').focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!canResend) return;

        setLoading(true);
        setError('');

        try {
            await axios.post('https://job-portal-and-resume-builder-pruy.vercel.app/api/auth/forgot-password', {
                email: resetData.email
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

    if (!resetData) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
            <div className="glass max-w-md w-full p-8 rounded-2xl border border-white/10">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiShield className="text-primary text-3xl" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Verify OTP</h2>
                    <p className="text-gray-400">
                        Enter the code sent to<br />
                        <span className="text-primary font-semibold">{resetData.maskedEmail || resetData.email}</span>
                    </p>
                </div>

                <form onSubmit={handleVerify} className="space-y-6">
                    <div>
                        <label className="block text-sm text-gray-400 mb-3 text-center">Enter OTP</label>
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
                                    className="w-12 h-14 text-center text-2xl font-bold bg-white/5 border border-white/10 rounded-lg text-white focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all"
                                    disabled={loading}
                                />
                            ))}
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                            <FiCheckCircle /> {success}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || otp.join('').length !== 6}
                        className="w-full btn-primary py-3 disabled:opacity-50"
                    >
                        {loading ? 'Verifying...' : 'Verify OTP'}
                    </button>

                    <div className="text-center">
                        {!canResend ? (
                            <p className="text-gray-400 text-sm flex items-center justify-center gap-2">
                                <FiClock /> Resend OTP in {timer}s
                            </p>
                        ) : (
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={loading}
                                className="text-primary hover:text-primary/80 font-semibold text-sm"
                            >
                                Resend OTP
                            </button>
                        )}
                    </div>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => navigate('/forgot-password')}
                        className="text-gray-400 hover:text-white text-sm"
                    >
                        ← Back
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordOTP;
