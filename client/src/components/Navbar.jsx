import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const isAuthPage = ['/login', '/register'].includes(location.pathname);

    return (
        <nav className="fixed w-full z-50 transition-all duration-300 bg-slate-900 text-white shadow-md">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <Link to="/" className="flex items-center gap-2">
                    <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
                    <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent hover:opacity-80 transition">
                        JobPortal
                    </span>
                </Link>

                <div className="flex items-center gap-6">
                    {/* Hide Find Jobs on Auth Pages AND for Recruiters AND Seekers (moved to Dashboard/Menu) */}
                    {!isAuthPage && user?.role !== 'recruiter' && user?.role !== 'seeker' && (
                        <Link to="/jobs" className="text-muted hover:text-primary font-medium transition">Find Jobs</Link>
                    )}

                    {/* 'Post Job' removed from Navbar as requested (moving to Dashboard) */}

                    {user && !isAuthPage ? (
                        <div className="flex items-center gap-4">
                            <span className="text-gray-900 font-semibold bg-white px-4 py-2 rounded-lg shadow-md">Hello, {user.name}</span>
                            <button onClick={handleLogout} className="text-sm text-red-400 hover:text-red-300 font-medium transition">Logout</button>

                            {/* Hide Dashboard button if already on Dashboard */}
                            {location.pathname !== '/dashboard' && (
                                <Link to="/dashboard" className="btn-primary py-2 px-4 text-sm">Dashboard</Link>
                            )}
                        </div>
                    ) : (
                        // Hide Login/Get Started on Auth Pages
                        !isAuthPage && (
                            <div className="flex items-center gap-4">
                                <Link to="/login" className="text-muted hover:text-text font-medium transition">Login</Link>
                                <Link to="/register" className="btn-primary py-2 px-4 text-sm">Get Started</Link>
                            </div>
                        )
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
