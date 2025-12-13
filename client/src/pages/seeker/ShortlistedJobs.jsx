import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiBriefcase, FiMapPin, FiCalendar, FiDownload, FiCheckCircle } from 'react-icons/fi';

const ShortlistedJobs = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchApps = async () => {
            try {
                // Fetch all and filter client-side for now as we don't have a specific filtered endpoint
                const res = await axios.get('http://localhost:5000/api/applications/my-stats', { withCredentials: true });
                // The stats endpoint returns .applications (full list) as per my latest view of controller
                // Wait, the controller code I viewed showed `applications` being returned in the data object.
                const allApps = res.data.data.applications || [];
                const shortlisted = allApps.filter(app => app.status === 'Shortlisted' || app.status === 'Interview');
                setApplications(shortlisted);
            } catch (err) {
                console.error("Failed to fetch applications", err);
            } finally {
                setLoading(false);
            }
        };
        fetchApps();
    }, []);

    return (
        <div className="container mx-auto px-6 py-12 animate-fade-in-up">
            <h1 className="text-3xl font-bold text-white mb-2">Shortlisted Applications</h1>
            <p className="text-muted mb-8">Congratulations! You have been shortlisted for these positions.</p>

            <div className="space-y-4">
                {loading ? <div className="text-white">Loading...</div> : (
                    applications.length > 0 ? (
                        applications.map(app => (
                            <div key={app._id} className="glass p-6 rounded-2xl border border-purple-500/20 hover:border-purple-500/50 transition group">
                                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                            {app.job ? app.job.title : <span className="text-gray-400 italic">Job Removed</span>}
                                            <span className="text-xs px-2 py-1 rounded-full border border-purple-500 text-purple-400 bg-purple-500/10">
                                                {app.status}
                                            </span>
                                        </h3>
                                        <p className="text-muted text-sm mt-1 flex items-center gap-4">
                                            {app.job ? (
                                                <>
                                                    <span className="flex items-center gap-1"><FiBriefcase /> {app.job.companyName}</span>
                                                    <span className="flex items-center gap-1"><FiMapPin /> {app.job.jobLocation}</span>
                                                </>
                                            ) : (
                                                <span className="text-gray-500">Details unavailable</span>
                                            )}
                                            <span className="flex items-center gap-1"><FiCalendar /> Applied: {new Date(app.appliedAt).toLocaleDateString()}</span>
                                        </p>
                                    </div>

                                    <div className="flex flex-col items-end gap-2">
                                        {app.interview && (
                                            <div className="text-right bg-amber-500/10 px-4 py-2 rounded-lg border border-amber-500/20">
                                                <div className="text-xs text-amber-400 uppercase font-bold mb-1">Upcoming Interview</div>
                                                <div className="text-white font-mono text-sm">
                                                    {new Date(app.interview.date).toLocaleDateString()} @ {app.interview.time}
                                                </div>
                                                <div className="text-xs text-muted">Mode: {app.interview.mode}</div>
                                            </div>
                                        )}

                                        <div className="flex gap-2 mt-2">
                                            {/* Mock Download Resume Button - in real app would link to generated PDF */}
                                            <button className="btn-secondary py-2 px-4 text-sm flex items-center gap-2" title="Download your submitted resume">
                                                <FiDownload /> Resume
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 glass rounded-2xl border border-white/5">
                            <p className="text-muted mb-2">No shortlisted applications yet.</p>
                            <p className="text-sm text-muted/60">Keep applying! Your profile is being reviewed.</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default ShortlistedJobs;
