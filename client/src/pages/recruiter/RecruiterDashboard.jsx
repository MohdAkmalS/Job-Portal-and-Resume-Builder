import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FiPlusSquare, FiUsers, FiBriefcase, FiSettings, FiActivity, FiClock, FiCheckCircle, FiVideo } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const RecruiterDashboard = () => {
    const { user } = useAuth();
    const [statsData, setStatsData] = useState({
        totalJobs: 0,
        totalApplications: 0,
        pendingReviews: 0,
        shortlisted: 0,
        interview: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get('https://jobportal-backend.vercel.app/api/jobs/stats', { withCredentials: true });
                setStatsData(res.data.data);
            } catch (err) {
                console.error("Failed to fetch stats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    // Stats mapped from API data
    const stats = [
        { title: 'Total Jobs Posted', value: statsData.totalJobs, icon: <FiBriefcase />, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { title: 'Total Applications', value: statsData.totalApplications, icon: <FiUsers />, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        { title: 'Pending Reviews', value: statsData.pendingReviews, icon: <FiClock />, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        { title: 'Shortlisted', value: statsData.shortlisted, icon: <FiCheckCircle />, color: 'text-green-500', bg: 'bg-green-500/10' },
        { title: 'Interviews Scheduled', value: statsData.interview, icon: <FiVideo />, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    ];

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Recruiter Dashboard</h1>
                    <p className="text-slate-700 mt-1 font-medium">Welcome back, {user?.name}</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                    let linkTo = '/applications'; // Default
                    if (stat.title === 'Total Jobs Posted') linkTo = '/my-jobs';
                    else if (stat.title === 'Total Applications') linkTo = '/applications'; // All
                    else if (stat.title === 'Pending Reviews') linkTo = '/applications?status=Applied';
                    else if (stat.title === 'Shortlisted') linkTo = '/applications?status=Shortlisted';
                    else if (stat.title === 'Interviews Scheduled') linkTo = '/recruiter/interviews';

                    return (
                        <Link to={linkTo} key={index} className="glass p-6 rounded-2xl flex items-center gap-4 hover:scale-[1.02] transition-transform duration-300 cursor-pointer">
                            <div className={`p-4 rounded-xl ${stat.bg} ${stat.color} text-2xl`}>
                                {stat.icon}
                            </div>
                            <div>
                                <p className="text-slate-600 text-sm font-medium">{stat.title}</p>
                                <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                            </div>
                        </Link>
                    )
                })}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Link to="/post-job" className="group p-6 glass rounded-2xl border border-white/5 hover:border-primary/50 transition-all duration-300">
                    <div className="h-12 w-12 bg-primary/20 text-primary rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <FiPlusSquare size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Post a New Job</h3>
                    <p className="text-slate-600 text-sm">Create a new job listing to find talent.</p>
                </Link>

                <Link to="/applications" className="group p-6 glass rounded-2xl border border-white/5 hover:border-purple-500/50 transition-all duration-300">
                    <div className="h-12 w-12 bg-purple-500/20 text-purple-400 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <FiUsers size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Review Applications</h3>
                    <p className="text-slate-600 text-sm">View and manage candidate applications.</p>
                </Link>

                <Link to="/my-jobs" className="group p-6 glass rounded-2xl border border-white/5 hover:border-blue-500/50 transition-all duration-300">
                    <div className="h-12 w-12 bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <FiBriefcase size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Manage Jobs</h3>
                    <p className="text-slate-600 text-sm">Edit, close, or track your posted jobs.</p>
                </Link>

                <Link to="/company-profile" className="group p-6 glass rounded-2xl border border-white/5 hover:border-pink-500/50 transition-all duration-300">
                    <div className="h-12 w-12 bg-pink-500/20 text-pink-400 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <FiSettings size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Company Profile</h3>
                    <p className="text-slate-600 text-sm">Update company details and branding.</p>
                </Link>
            </div>
        </div>
    );
};

export default RecruiterDashboard;
