import { useAuth } from '../context/AuthContext';
import RecruiterDashboard from './recruiter/RecruiterDashboard';
import SeekerDashboard from './seeker/SeekerDashboard';

const Dashboard = () => {
    const { user } = useAuth();

    if (user?.role === 'recruiter') {
        return (
            <div className="container mx-auto px-6 py-12">
                <RecruiterDashboard />
            </div>
        );
    }

    if (user?.role === 'seeker') {
        return <SeekerDashboard />;
    }

    return (
        <div className="container mx-auto px-6 py-12 animate-fade-in-up">
            <h1 className="text-3xl font-bold mb-6 text-white">Dashboard</h1>
            <div className="glass p-8 rounded-2xl">
                <h2 className="text-xl font-semibold mb-4 text-white">Welcome, {user?.name}!</h2>
                <div className="bg-surface/50 p-4 rounded-lg border border-white/5">
                    <p className="text-muted"><strong>Email:</strong> <span className="text-text">{user?.email}</span></p>
                    <p className="text-muted mt-2"><strong>Role:</strong> <span className="capitalize px-2 py-1 bg-primary/20 text-primary rounded text-sm font-semibold">{user?.role}</span></p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
