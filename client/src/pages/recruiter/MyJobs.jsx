import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiEdit, FiTrash2, FiEye, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const MyJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const res = await axios.get('https://jobportal-backend.vercel.app/api/jobs/my-jobs', { withCredentials: true });
            setJobs(res.data.data);
        } catch (err) {
            setError('Failed to fetch jobs');
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (id) => {
        try {
            await axios.patch(`https://jobportal-backend.vercel.app/api/jobs/${id}/status`, {}, { withCredentials: true });
            fetchJobs(); // Refresh
        } catch (err) {
            console.error(err);
        }
    };

    const deleteJob = async (id) => {
        if (!window.confirm('Are you sure you want to delete this job?')) return;
        try {
            await axios.delete(`https://jobportal-backend.vercel.app/api/jobs/${id}`, { withCredentials: true });
            // Remove from list
            setJobs(jobs.filter(job => job._id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="text-center text-white mt-10">Loading jobs...</div>;

    return (
        <div className="container mx-auto px-6 py-12 animate-fade-in-up">
            <h1 className="text-3xl font-bold mb-8 text-white">Manage Posted Jobs</h1>

            {error && <div className="text-red-500 mb-4">{error}</div>}

            <div className="glass rounded-2xl overflow-hidden border border-white/5">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-muted uppercase text-sm">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Job Title</th>
                            <th className="px-6 py-4 font-semibold">Posted Date</th>
                            <th className="px-6 py-4 font-semibold text-center">Applications</th>
                            <th className="px-6 py-4 font-semibold">Status</th>
                            <th className="px-6 py-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {jobs.map(job => (
                            <tr key={job._id} className="hover:bg-white/5 transition">
                                <td className="px-6 py-4">
                                    <div className="font-semibold text-white">{job.title}</div>
                                    <div className="text-sm text-muted">{job.jobLocation} • {job.type}</div>
                                </td>
                                <td className="px-6 py-4 text-muted">
                                    {new Date(job.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-center font-bold text-white">
                                    {job.applicationCount || 0}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${job.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                        }`}>
                                        {job.status.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right flex justify-end gap-3">
                                    <Link to={`/applications`} className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition" title="View Applications">
                                        <FiEye />
                                    </Link>
                                    <button onClick={() => toggleStatus(job._id)} className="p-2 bg-purple-500/10 text-purple-400 rounded-lg hover:bg-purple-500/20 transition" title="Toggle Status">
                                        {job.status === 'active' ? <FiXCircle /> : <FiCheckCircle />}
                                    </button>
                                    <button onClick={() => deleteJob(job._id)} className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition" title="Delete Job">
                                        <FiTrash2 />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {jobs.length === 0 && (
                    <div className="p-8 text-center text-muted">No jobs posted yet. <Link to="/post-job" className="text-primary hover:underline">Post one now</Link></div>
                )}
            </div>
        </div>
    );
};

export default MyJobs;
