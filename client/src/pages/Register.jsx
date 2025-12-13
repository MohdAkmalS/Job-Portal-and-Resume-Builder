import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FiUser, FiBriefcase, FiCheck } from 'react-icons/fi';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';

const Register = () => {
    const [step, setStep] = useState(1);
    const [role, setRole] = useState(null);
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', confirmPassword: '',
        skills: '', // Seeker
        companyName: '', designation: '' // Recruiter
    });
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleRoleSelect = (selectedRole) => {
        setRole(selectedRole);
        setStep(2);
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

    const handleNext = (e) => {
        e.preventDefault();
        setError(''); // Clear previous errors

        // Validation for Step 2
        if (step === 2) {
            if (!validatePasswordStrength(formData.password)) {
                return setError('Password must include minimum 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.');
            }
            if (formData.password !== formData.confirmPassword) {
                return setError("Passwords don't match");
            }
        }

        setStep(step + 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            return setError("Passwords don't match");
        }

        try {
            const profileData = role === 'seeker'
                ? { skills: formData.skills.split(',').map(s => s.trim()) }
                : { companyName: formData.companyName, designation: formData.designation };

            // Send OTP instead of creating account
            const res = await axios.post('http://localhost:5000/api/auth/send-signup-otp', {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role,
                profile: profileData
            });

            // Navigate to OTP verification page with signup data
            navigate('/verify-email', {
                state: {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    role,
                    profile: profileData,
                    maskedEmail: res.data.maskedEmail
                }
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
            {/* Background Blobs */}
            <div className="absolute top-20 -left-10 w-96 h-96 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
            <div className="absolute bottom-20 -right-10 w-96 h-96 bg-secondary rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>

            <div className="max-w-2xl w-full space-y-8 glass p-10 rounded-2xl relative overflow-hidden z-10">
                {/* Progress Bar */}
                <div className="absolute top-0 left-0 h-2 bg-surface w-full">
                    <div
                        className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>

                <div className="text-center">
                    <h2 className="mt-2 text-3xl font-extrabold text-white">
                        {step === 1 ? "Join as a..." : step === 2 ? "Basic Information" : "Complete Profile"}
                    </h2>
                    <p className="mt-2 text-sm text-muted">
                        {step === 1 ? "Choose how you want to use the platform" : step === 2 ? "Let's get to know you" : "Almost there"}
                    </p>
                </div>

                {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-md text-center">{error}</div>}

                {/* Step 1: Role Selection */}
                {step === 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                        <button
                            onClick={() => handleRoleSelect('seeker')}
                            className="group relative p-6 border border-white/10 bg-surface/50 rounded-xl hover:border-primary hover:bg-primary/10 transition-all duration-300 flex flex-col items-center text-center backdrop-blur-sm"
                        >
                            <div className="h-16 w-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <FiUser size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Job Seeker</h3>
                            <p className="text-muted text-sm">Find your dream job, build your resume, and get hired.</p>
                        </button>

                        <button
                            onClick={() => handleRoleSelect('recruiter')}
                            className="group relative p-6 border border-white/10 bg-surface/50 rounded-xl hover:border-secondary hover:bg-secondary/10 transition-all duration-300 flex flex-col items-center text-center backdrop-blur-sm"
                        >
                            <div className="h-16 w-16 bg-secondary/20 text-secondary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <FiBriefcase size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Recruiter</h3>
                            <p className="text-muted text-sm">Post jobs, manage applications, and find top talent.</p>
                        </button>
                    </div>
                )}

                {/* Step 2: Basic Info */}
                {step === 2 && (
                    <form onSubmit={handleNext} className="mt-8 space-y-6 animate-fade-in-up">
                        <div className="space-y-4">
                            <input name="name" type="text" required placeholder="Full Name" value={formData.name} onChange={handleChange} className="input-field" />
                            <input name="email" type="email" required placeholder="Email Address" value={formData.email} onChange={handleChange} className="input-field" />
                            <div>
                                <input name="password" type="password" required placeholder="Password" value={formData.password} onChange={handleChange} className="input-field" />
                                <PasswordStrengthIndicator password={formData.password} />
                            </div>
                            <input name="confirmPassword" type="password" required placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} className="input-field" />
                        </div>
                        <div className="flex justify-between">
                            <button type="button" onClick={() => setStep(1)} className="text-muted hover:text-white transition">Back</button>
                            <button type="submit" className="btn-primary">Next Step</button>
                        </div>
                    </form>
                )}

                {/* Step 3: Role Details */}
                {step === 3 && (
                    <form onSubmit={handleSubmit} className="mt-8 space-y-6 animate-fade-in-up">
                        {role === 'seeker' ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-muted mb-1">Top Skills (comma separated)</label>
                                    <input name="skills" type="text" placeholder="e.g. React, Node.js, Design" value={formData.skills} onChange={handleChange} className="input-field" />
                                    <p className="text-xs text-muted mt-1">You can add detailed experience and education later in your profile</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-muted mb-1">Company Name</label>
                                    <input name="companyName" type="text" required placeholder="Company Name" value={formData.companyName} onChange={handleChange} className="input-field" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-muted mb-1">Your Designation</label>
                                    <input name="designation" type="text" required placeholder="e.g. HR Manager" value={formData.designation} onChange={handleChange} className="input-field" />
                                </div>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <button type="button" onClick={() => setStep(2)} className="text-muted hover:text-white transition">Back</button>
                            <button type="submit" className="w-full ml-4 btn-primary shadow-lg shadow-primary/40">Complete Registration</button>
                        </div>
                    </form>
                )}

                <div className="text-center mt-4">
                    <p className="text-sm text-muted">Already have an account? <Link to="/login" className="text-primary font-semibold hover:text-accent transition">Login</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Register;
