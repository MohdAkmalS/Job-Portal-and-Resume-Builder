import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [weakPasswordWarning, setWeakPasswordWarning] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await login(email, password);
            // Check if backend flagged weak password
            if (response?.weakPassword) {
                setWeakPasswordWarning(true);
            }
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            {/* Background Blobs */}
            <div className="absolute top-0 -left-4 w-72 h-72 bg-primary rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-secondary rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-accent rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

            <div className="max-w-md w-full glass p-8 rounded-2xl animate-fade-in-up z-10">
                <h2 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Welcome Back</h2>
                <p className="text-center text-muted mb-8">Sign in to continue your journey</p>

                {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg mb-4 text-sm text-center">{error}</div>}

                {weakPasswordWarning && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 p-3 rounded-lg mb-4 text-sm">
                        <p className="font-semibold">⚠️ Your password is weak</p>
                        <p className="text-xs mt-1">Please <Link to="/change-password" className="underline font-medium">update your password</Link> for better security.</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-text mb-1">Email Address</label>
                        <input
                            type="email"
                            required
                            className="input-field"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text mb-1">Password</label>
                        <input
                            type="password"
                            required
                            className="input-field"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end">
                        <Link to="/forgot-password" className="text-sm text-primary hover:text-primary/80 transition-colors">
                            Forgot Password?
                        </Link>
                    </div>

                    <button type="submit" className="w-full btn-primary py-3 text-lg">
                        Sign In
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-muted">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-primary font-semibold hover:text-accent transition">Create Account</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
