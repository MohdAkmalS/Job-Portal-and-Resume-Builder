import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FiEye, FiDownload, FiCheck, FiX, FiCalendar, FiFilter } from 'react-icons/fi';

const ReviewApplications = () => {
    const [applications, setApplications] = useState([]);
    const [filteredApps, setFilteredApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [scheduleModal, setScheduleModal] = useState(false);

    // Filters
    const [statusFilter, setStatusFilter] = useState('All');
    const [jobFilter, setJobFilter] = useState('All');

    // Interview Form
    const [interviewData, setInterviewData] = useState({ date: '', time: '', mode: 'Online', notes: '' });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const status = params.get('status');
        if (status) {
            setStatusFilter(status);
        }
        fetchApplications();
    }, []);

    useEffect(() => {
        filterApplications();
    }, [applications, statusFilter, jobFilter]);

    const fetchApplications = async () => {
        try {
            const res = await axios.get('https://job-portal-and-resume-builder-pruy.vercel.app/api/applications/recruiter', { withCredentials: true });
            setApplications(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filterApplications = () => {
        let result = applications;
        if (statusFilter !== 'All') {
            result = result.filter(app => app.status === statusFilter);
        }
        if (jobFilter !== 'All') {
            result = result.filter(app => (app.job?.title || 'Job Removed') === jobFilter);
        }
        setFilteredApps(result);
    };

    const updateStatus = async (id, status) => {
        try {
            await axios.patch(`https://job-portal-and-resume-builder-pruy.vercel.app/api/applications/${id}/status`, { status }, { withCredentials: true });
            fetchApplications();
            if (selectedApp) setSelectedApp(prev => ({ ...prev, status }));
        } catch (err) {
            console.error(err);
        }
    };

    const handleScheduleInterview = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`https://job-portal-and-resume-builder-pruy.vercel.app/api/applications/${selectedApp._id}/schedule`, interviewData, { withCredentials: true });
            fetchApplications();
            setScheduleModal(false);
            setShowModal(false);
            alert('Interview Scheduled!');
        } catch (err) {
            alert('Failed to schedule');
        }
    };

    const uniqueJobs = [...new Set(applications.map(app => app.job?.title || 'Job Removed'))];

    if (loading) return <div className="text-center text-white mt-10">Loading applications...</div>;

    return (
        <div className="container mx-auto px-6 py-12 animate-fade-in-up">
            <h1 className="text-3xl font-bold mb-8 text-slate-900">Review Applications</h1>

            {/* Filters */}
            <div className="glass p-6 rounded-xl mb-8 border border-white/5 flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                    <FiFilter /> Filters:
                </div>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-surface/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary">
                    <option value="All">All Statuses</option>
                    <option value="Applied">Applied</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Interview">Interview</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Hired">Hired</option>
                </select>
                <select value={jobFilter} onChange={(e) => setJobFilter(e.target.value)} className="bg-surface/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary">
                    <option value="All">All Jobs</option>
                    {uniqueJobs.map((job, idx) => (
                        <option key={idx} value={job}>{job}</option>
                    ))}
                </select>
            </div>

            {/* Table */}
            <div className="glass rounded-2xl overflow-hidden border border-white/5">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-slate-700 uppercase text-sm font-semibold">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Candidate</th>
                            <th className="px-6 py-4 font-semibold">Job Applied For</th>
                            <th className="px-6 py-4 font-semibold">Applied Date</th>
                            <th className="px-6 py-4 font-semibold">Status</th>
                            <th className="px-6 py-4 font-semibold text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredApps.map(app => (
                            <tr key={app._id} className="hover:bg-white/5 transition">
                                <td className="px-6 py-4">
                                    <div className="font-semibold text-slate-900">{app.applicant?.name || 'Unknown Candidate'}</div>
                                    <div className="text-sm text-slate-600">{app.applicant?.email || 'No Email'}</div>
                                </td>
                                <td className="px-6 py-4 text-slate-900">
                                    {app.job?.title || <span className="text-red-400 italic">Job Removed</span>}
                                </td>
                                <td className="px-6 py-4 text-slate-600">{new Date(app.appliedAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${app.status === 'Applied' ? 'bg-blue-500/20 text-blue-400' :
                                        app.status === 'Shortlisted' ? 'bg-purple-500/20 text-purple-400' :
                                            app.status === 'Interview' ? 'bg-amber-500/20 text-amber-400' :
                                                app.status === 'Hired' ? 'bg-green-500/20 text-green-400' :
                                                    'bg-red-500/20 text-red-400'
                                        }`}>
                                        {app.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Link to={`/recruiter/application-details/${app._id}`} className="btn-primary py-1 px-3 text-sm inline-block">
                                        View Details
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredApps.length === 0 && <div className="p-8 text-center text-slate-600">No applications found.</div>}
            </div>

            {/* Candidate Detail Modal */}
            {showModal && selectedApp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="glass w-full max-w-2xl rounded-2xl p-8 max-h-[90vh] overflow-y-auto animate-fade-in-up border border-white/10 relative">
                        <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-muted hover:text-white"><FiX size={24} /></button>

                        <h2 className="text-2xl font-bold text-white mb-2">{selectedApp.applicant?.name}</h2>
                        <p className="text-muted mb-6">Applied for <span className="text-primary">{selectedApp.job?.title}</span></p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div>
                                <h3 className="text-sm font-semibold text-muted uppercase mb-2">Contact Info</h3>
                                <p className="text-white">Email: {selectedApp.applicant?.email}</p>
                                <p className="text-white">Phone: {selectedApp.applicant?.profile?.phoneNumber || 'N/A'}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-muted uppercase mb-2">Experience & Skills</h3>
                                <p className="text-white">Exp: {selectedApp.applicant?.profile?.experience || 'N/A'}</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {selectedApp.applicant?.profile?.skills?.map((skill, i) => (
                                        <span key={i} className="px-2 py-1 bg-white/10 rounded text-xs text-white">{skill}</span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mb-8">
                            <h3 className="text-sm font-semibold text-muted uppercase mb-2">Resume / Links</h3>
                            {selectedApp.resumeUrl ? (
                                <a href={selectedApp.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-2">
                                    <FiDownload /> View Resume
                                </a>
                            ) : <span className="text-muted">No resume uploaded</span>}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap justify-between gap-4 pt-6 border-t border-white/10">
                            <div className="flex gap-2">
                                <button onClick={() => updateStatus(selectedApp._id, 'Shortlisted')} className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition flex items-center gap-2">
                                    <FiCheck /> Shortlist
                                </button>
                                <button onClick={() => updateStatus(selectedApp._id, 'Rejected')} className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition flex items-center gap-2">
                                    <FiX /> Reject
                                </button>
                            </div>
                            <button onClick={() => setScheduleModal(true)} className="btn-primary py-2 px-6 flex items-center gap-2">
                                <FiCalendar /> Schedule Interview
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Schedule Interview Modal */}
            {scheduleModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="glass w-full max-w-md rounded-2xl p-6 border border-white/10 animate-fade-in-up">
                        <h3 className="text-xl font-bold text-white mb-4">Schedule Interview</h3>
                        <form onSubmit={handleScheduleInterview} className="space-y-4">
                            <div>
                                <label className="block text-sm text-muted mb-1">Date</label>
                                <input type="date" required value={interviewData.date} onChange={e => setInterviewData({ ...interviewData, date: e.target.value })} className="input-field" />
                            </div>
                            <div>
                                <label className="block text-sm text-muted mb-1">Time</label>
                                <input type="time" required value={interviewData.time} onChange={e => setInterviewData({ ...interviewData, time: e.target.value })} className="input-field" />
                            </div>
                            <div>
                                <label className="block text-sm text-muted mb-1">Mode</label>
                                <select value={interviewData.mode} onChange={e => setInterviewData({ ...interviewData, mode: e.target.value })} className="input-field">
                                    <option>Online</option>
                                    <option>Offline</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-muted mb-1">Notes / Meeting Link</label>
                                <textarea rows="3" value={interviewData.notes} onChange={e => setInterviewData({ ...interviewData, notes: e.target.value })} className="input-field" placeholder="Zoom link or address..." />
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <button type="button" onClick={() => setScheduleModal(false)} className="px-4 py-2 text-muted hover:text-white">Cancel</button>
                                <button type="submit" className="btn-primary py-2 px-6">Confirm Schedule</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReviewApplications;
