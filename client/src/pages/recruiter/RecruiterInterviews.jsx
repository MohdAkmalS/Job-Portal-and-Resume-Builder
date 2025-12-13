import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FiCalendar, FiClock, FiVideo, FiMapPin, FiUser, FiBriefcase, FiArrowRight } from 'react-icons/fi';

const RecruiterInterviews = () => {
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInterviews = async () => {
            try {
                // Fetch all applications with status='Interview'
                // Reusing the getRecruiterApplications logic but filtering?
                // Or I can add a dedicated endpoint query param ?status=Interview to /applications
                const res = await axios.get('http://localhost:5000/api/applications/recruiter', { withCredentials: true });
                if (res.data.success) {
                    const scheduled = res.data.data.filter(app => app.interview && app.interview.date);
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
            <h1 className="text-3xl font-bold text-white mb-8">Scheduled Interviews</h1>

            {loading ? <p className="text-white">Loading schedule...</p> : (
                interviews.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {interviews.map(app => (
                            <div key={app._id} className="glass p-6 rounded-2xl border border-white/5 hover:border-amber-500/30 transition group relative">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center text-xl">
                                            <FiCalendar />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-lg">{app.applicant?.name}</h3>
                                            <p className="text-sm text-muted">{app.applicant?.email}</p>
                                        </div>
                                    </div>
                                    <Link to={`/recruiter/application-details/${app._id}`} className="text-sm btn-secondary py-2 px-4 flex items-center gap-2">
                                        View Details <FiArrowRight />
                                    </Link>
                                </div>

                                <div className="space-y-3 pl-16">
                                    <div className="flex items-center gap-2 text-sm text-gray-300">
                                        <FiBriefcase className="text-muted" /> <span className="text-muted">Role:</span> {app.job?.title}
                                    </div>

                                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 mt-2">
                                        <h4 className="text-xs uppercase text-muted font-bold mb-2">Interview Details</h4>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div className="flex items-center gap-2 text-white">
                                                <FiCalendar className="text-primary" />
                                                {app.interview?.date ? new Date(app.interview.date).toLocaleDateString() : 'N/A'}
                                            </div>
                                            <div className="flex items-center gap-2 text-white">
                                                <FiClock className="text-primary" />
                                                {app.interview?.time || 'N/A'}
                                            </div>
                                            <div className="col-span-2 flex items-center gap-2 text-white">
                                                {app.interview?.mode === 'Online' ? <FiVideo className="text-green-400" /> : <FiMapPin className="text-red-400" />}
                                                {app.interview?.mode}
                                                {app.interview?.mode === 'Online' && app.interview?.link && (
                                                    <a href={app.interview.link} target="_blank" rel="noopener noreferrer" className="ml-2 text-xs text-primary underline truncate max-w-[150px]">Link</a>
                                                )}
                                                {app.interview?.mode === 'Offline' && app.interview?.location && (
                                                    <span className="ml-2 text-xs text-muted truncate max-w-[150px]">{app.interview.location}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 glass rounded-2xl border border-white/5">
                        <div className="h-20 w-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl text-muted">
                            <FiCalendar />
                        </div>
                        <h3 className="text-xl font-bold text-white">No scheduled interviews yet.</h3>
                        <p className="text-muted mt-2">Schedule interviews from the "Pending Reviews" section.</p>
                        <Link to="/applications" className="btn-primary mt-6 inline-block">Review Applications</Link>
                    </div>
                )
            )}
        </div>
    );
};

export default RecruiterInterviews;
