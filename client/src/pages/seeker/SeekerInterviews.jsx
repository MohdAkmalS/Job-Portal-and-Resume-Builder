import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiCalendar, FiClock, FiVideo, FiMapPin, FiBriefcase, FiAlertCircle } from 'react-icons/fi';

const SeekerInterviews = () => {
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInterviews = async () => {
            try {
                // Using my-stats to get full history then filter
                const res = await axios.get('https://job-portal-and-resume-builder-pruy.vercel.app/api/applications/my-stats', { withCredentials: true });
                if (res.data.success) {
                    // Filter for status='Interview'
                    const scheduled = res.data.data.applications.filter(app => app.status === 'Interview');
                    setInterviews(scheduled);
                }
            } catch (err) {
                console.error("Failed to fetch interviews", err);
            } finally {
                setLoading(false);
            }
        };
        fetchInterviews();
    }, []);

    return (
        <div className="container mx-auto px-6 py-12 animate-fade-in-up">
            <h1 className="text-3xl font-bold text-white mb-2">My Scheduled Interviews</h1>
            <p className="text-muted mb-8">Keep track of your upcoming interviews and prepare ahead.</p>

            {loading ? <p className="text-white">Loading...</p> : (
                interviews.length > 0 ? (
                    <div className="space-y-6">
                        {/* Banner */}
                        <div className="bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 p-4 rounded-xl flex items-center gap-3 text-white mb-6">
                            <FiAlertCircle className="text-primary text-xl" />
                            <span className="font-medium">Prepare and attend the interview on scheduled time. Good luck!</span>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            {interviews.map(app => (
                                <div key={app._id} className="glass p-8 rounded-2xl border border-white/5 hover:border-primary/30 transition flex flex-col md:flex-row justify-between items-center gap-6">
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold text-white mb-2">
                                            {app.job ? app.job.title : <span className="text-gray-400 italic">Job Removed</span>}
                                        </h3>
                                        <p className="text-lg text-primary font-medium mb-4 flex items-center gap-2">
                                            {app.job ? (
                                                <>
                                                    <FiBriefcase /> {app.job.companyName}
                                                </>
                                            ) : (
                                                <span className="text-gray-500">Company details unavailable</span>
                                            )}
                                        </p>

                                        <div className="flex flex-wrap gap-6 text-sm">
                                            <div className="flex items-center gap-2 text-gray-300 bg-white/5 px-4 py-2 rounded-lg">
                                                <FiCalendar className="text-primary" /> {new Date(app.interview?.date).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-300 bg-white/5 px-4 py-2 rounded-lg">
                                                <FiClock className="text-primary" /> {app.interview?.time}
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-300 bg-white/5 px-4 py-2 rounded-lg">
                                                {app.interview?.mode === 'Online' ? <FiVideo className="text-green-400" /> : <FiMapPin className="text-red-400" />}
                                                {app.interview?.mode}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-shrink-0 w-full md:w-auto text-center md:text-right">
                                        {app.interview?.mode === 'Online' && app.interview?.link ? (
                                            <a href={app.interview.link} target="_blank" rel="noopener noreferrer" className="btn-primary py-3 px-8 text-lg w-full md:w-auto inline-block">
                                                Join Meeting
                                            </a>
                                        ) : (
                                            <div className="bg-white/10 p-4 rounded-xl border border-white/10 max-w-xs mx-auto md:ml-auto">
                                                <p className="text-xs text-muted uppercase font-bold mb-1">Location</p>
                                                <p className="text-white text-sm break-words">{app.interview?.location}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-16 glass rounded-2xl border border-white/5">
                        <div className="h-20 w-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl text-muted">
                            <FiCalendar />
                        </div>
                        <h3 className="text-xl font-bold text-white">No scheduled interviews yet.</h3>
                        <p className="text-muted mt-2">Check your applications status or find more jobs.</p>
                    </div>
                )
            )}
        </div>
    );
};

export default SeekerInterviews;
