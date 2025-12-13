import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FiBriefcase, FiFileText, FiCheckCircle, FiClock, FiSearch } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const SeekerDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalApplied: 0,
        shortlisted: 0,
        interview: 0,
        hired: 0,
        recent: [],
        applications: []
    });
    const [loading, setLoading] = useState(true);
    const [appliedJobIds, setAppliedJobIds] = useState([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get('https://jobportal-backend.vercel.app/api/applications/my-stats', { withCredentials: true });
                const recRes = await axios.get('https://jobportal-backend.vercel.app/api/jobs/recommendations', { withCredentials: true });
                setStats({ ...res.data.data, recommendations: recRes.data.data });

                // Extract applied IDs
                if (res.data.data.applications) {
                    const ids = res.data.data.applications.map(app => (app.job._id || app.job));
                    setAppliedJobIds(ids);
                }
            } catch (err) {
                console.error("Failed to fetch seeker stats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    // Calculate Profile Completeness
    const calculateCompleteness = () => {
        if (!user || !user.profile) return 0;
        let score = 0;
        const totalWeight = 100;

        // Basic Info (20%)
        if (user.name && user.email && user.phoneNumber) score += 20;

        // Summary (10%)
        if (user.profile.about) score += 10;

        // Skills (15%)
        if (user.profile.skills && user.profile.skills.length > 0) score += 15;

        // Experience (20%)
        if (user.profile.experience && user.profile.experience.length > 0) score += 20;

        // Education (15%)
        if (user.profile.education && user.profile.education.length > 0) score += 15;

        // Projects (10%)
        if (user.profile.projects && user.profile.projects.length > 0) score += 10;

        // Photo (10%)
        if (user.profile.profileImage) score += 10;

        return score;
    };

    const completionPercentage = calculateCompleteness();

    const statCards = [
        { title: 'Jobs Applied', value: stats.totalApplied, icon: <FiBriefcase />, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { title: 'Shortlisted', value: stats.shortlisted, icon: <FiCheckCircle />, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        { title: 'Interviews', value: stats.interview, icon: <FiClock />, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        { title: 'Profile Status', value: `${completionPercentage}%`, icon: <FiFileText />, color: completionPercentage === 100 ? 'text-green-500' : 'text-orange-500', bg: completionPercentage === 100 ? 'bg-green-500/10' : 'bg-orange-500/10' },
    ];

    if (loading) return <div className="text-center mt-10 text-white">Loading dashboard...</div>;

    return (
        <div className="container mx-auto px-6 py-12 space-y-8 animate-fade-in-up">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Seeker Dashboard</h1>
                    <p className="text-slate-700 mt-1 font-medium">Track your applications and finding your dream job.</p>
                </div>
            </div>

            {/* Hired Banner - Show if hired > 0 */}
            {stats.hired > 0 && (
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 mb-8 text-white relative overflow-hidden animate-pulse-slow">
                    <div className="absolute top-0 right-0 p-4 opacity-20">
                        <FiBriefcase size={100} />
                    </div>
                    <div className="relative z-10">
                        <h2 className="text-2xl font-bold mb-2">🎉 Congratulations! You have been Hired!</h2>
                        <p className="text-white/90">You have been selected for {stats.hired} job(s). Check your application status for next steps.</p>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Link to="/my-applications" className="glass p-6 rounded-2xl flex items-center gap-4 hover:scale-[1.02] transition-transform duration-300 cursor-pointer">
                    <div className={`p-4 rounded-xl bg-blue-500/10 text-blue-500 text-2xl`}>
                        <FiBriefcase />
                    </div>
                    <div>
                        <p className="text-slate-600 text-sm font-medium">Jobs Applied</p>
                        <h3 className="text-2xl font-bold text-slate-900">{stats.totalApplied}</h3>
                    </div>
                </Link>

                <Link to="/shortlisted-jobs" className="glass p-6 rounded-2xl flex items-center gap-4 hover:scale-[1.02] transition-transform duration-300 cursor-pointer">
                    <div className={`p-4 rounded-xl bg-purple-500/10 text-purple-500 text-2xl`}>
                        <FiCheckCircle />
                    </div>
                    <div>
                        <p className="text-slate-600 text-sm font-medium">Shortlisted</p>
                        <h3 className="text-2xl font-bold text-slate-900">{stats.shortlisted}</h3>
                    </div>
                </Link>

                <Link to="/seeker/interviews" className="glass p-6 rounded-2xl flex items-center gap-4 hover:scale-[1.02] transition-transform duration-300 cursor-pointer">
                    <div className={`p-4 rounded-xl bg-amber-500/10 text-amber-500 text-2xl`}>
                        <FiClock />
                    </div>
                    <div>
                        <p className="text-slate-600 text-sm font-medium">Interviews</p>
                        <h3 className="text-2xl font-bold text-slate-900">{stats.interview}</h3>
                    </div>
                </Link>

                <Link to="/seeker/profile" className="glass p-6 rounded-2xl flex items-center gap-4 hover:scale-[1.02] transition-transform duration-300 cursor-pointer group">
                    <div className={`p-4 rounded-xl bg-green-500/10 text-green-500 text-2xl group-hover:bg-green-500/20 transition`}>
                        <FiFileText />
                    </div>
                    <div>
                        <p className="text-slate-600 text-sm font-medium">Profile Status</p>
                        <h3 className="text-2xl font-bold text-slate-900">{completionPercentage}%</h3>
                        <span className="text-xs text-red-400 group-hover:underline">{completionPercentage < 100 ? 'Complete now' : 'View Profile'}</span>
                    </div>
                </Link>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link to="/find-jobs" className="group p-8 glass rounded-2xl border border-white/5 hover:border-primary/50 transition-all duration-300 flex flex-col items-center text-center">
                    <div className="h-16 w-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <FiSearch size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Find Jobs</h3>
                    <p className="text-slate-600">Browse thousands of jobs and apply today.</p>
                </Link>

                <Link to="/seeker/profile" className="group p-8 glass rounded-2xl border border-white/5 hover:border-purple-500/50 transition-all duration-300 flex flex-col items-center text-center">
                    <div className="h-16 w-16 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <FiFileText size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Build Resume</h3>
                    <p className="text-slate-600">Update your profile and manage your resume.</p>
                </Link>

                <Link to="/my-applications" className="group p-8 glass rounded-2xl border border-white/5 hover:border-green-500/50 transition-all duration-300 flex flex-col items-center text-center">
                    <div className="h-16 w-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <FiCheckCircle size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Applied Jobs</h3>
                    <p className="text-slate-600">Track status of your recent applications.</p>
                </Link>
            </div>

            {/* Recommended Jobs */}
            <div className="glass p-8 rounded-2xl border border-white/5">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <FiSearch className="text-primary" /> Recommended for You
                </h3>
                {stats.recommendations && stats.recommendations.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {stats.recommendations.map(job => (
                            <div key={job._id} className="bg-white/5 p-6 rounded-xl border border-white/10 hover:border-primary/50 transition relative group">
                                <h4 className="font-bold text-slate-900 text-lg">{job.title}</h4>
                                <p className="text-slate-600 text-sm mb-4">{job.companyName}</p>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {job.requirements.slice(0, 3).map((r, i) => (
                                        <span key={i} className="text-xs px-2 py-1 bg-black/30 rounded text-muted">{r}</span>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center mt-auto">
                                    <span className="text-sm font-mono text-primary">${job.salaryMin} - ${job.salaryMax}</span>
                                    {appliedJobIds.includes(job._id) ? (
                                        <span className="text-xs font-bold uppercase tracking-wider text-green-500">Applied</span>
                                    ) : (
                                        <Link to="/find-jobs" className="text-xs font-bold uppercase tracking-wider text-white hover:text-primary transition">View</Link>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-muted">
                        <p>Add skills to your profile to get personalized job recommendations!</p>
                        <Link to="/seeker/profile" className="text-primary hover:underline mt-2 inline-block">Update Profile</Link>
                    </div>
                )}
            </div>

            {/* Recent Applications */}
            <div className="glass rounded-2xl p-8 border border-white/5">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Recent Applications</h3>
                {stats.recent.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-white">
                            <thead className="text-slate-700 text-sm uppercase bg-white/5 font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Job Title</th>
                                    <th className="px-6 py-4">Company</th>
                                    <th className="px-6 py-4">Applied Date</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {stats.recent.map(app => (
                                    <tr key={app._id} className="hover:bg-white/5">
                                        <td className="px-6 py-4 font-medium">
                                            {app.job ? app.job.title : <span className="text-gray-400 italic">Job Removed</span>}
                                        </td>
                                        <td className="px-6 py-4 text-muted">
                                            {app.job ? app.job.companyName : <span className="text-gray-500">-</span>}
                                        </td>
                                        <td className="px-6 py-4 text-muted">{new Date(app.appliedAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${app.status === 'Shortlisted' ? 'bg-purple-500/20 text-purple-400' :
                                                app.status === 'Interview' ? 'bg-amber-500/20 text-amber-400' :
                                                    'bg-blue-500/20 text-blue-400'
                                                }`}>
                                                {app.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-muted text-center py-4">You haven't applied to any jobs yet.</p>
                )}
            </div>
        </div>
    );
};

export default SeekerDashboard;
