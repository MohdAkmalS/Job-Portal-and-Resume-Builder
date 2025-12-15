import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiSearch, FiMapPin, FiBriefcase, FiDollarSign, FiXCircle, FiUser, FiFileText, FiGlobe, FiMap, FiInfo, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const FindJobs = () => {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        jobLocation: '',
        category: '',
        type: '',
        experienceLevel: ''
    });

    const [selectedJob, setSelectedJob] = useState(null);
    const [applyMode, setApplyMode] = useState('profile'); // profile, manual, upload
    const [manualData, setManualData] = useState({
        name: '', email: '', phone: '', address: '',
        qualification: '', gradYear: '', cgpa: '', experienceYears: '',
        currentCompany: '', prevCompany: '', skills: '',
        expRole: '', expDuration: '', expDesc: ''
    });
    const [resumeFile, setResumeFile] = useState(null);
    const [appliedJobIds, setAppliedJobIds] = useState([]);

    useEffect(() => {
        const fetchAppliedStatus = async () => {
            try {
                const res = await axios.get('https://job-portal-and-resume-builder-pruy.vercel.app/api/applications/my-stats', { withCredentials: true });
                // Extract IDs from the application list
                const ids = res.data.data.applications.map(app => {
                    // Handle populate (object) or raw ID or null
                    const jobId = app.job?._id || app.job;
                    return jobId ? String(jobId) : null;
                }).filter(id => id !== null); // Filter out nulls
                setAppliedJobIds(ids);
            } catch (err) {
                console.error("Failed to fetch application status", err);
            }
        };
        fetchAppliedStatus();
        fetchJobs();
    }, [filters]);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const query = new URLSearchParams(filters).toString();
            const cleanQuery = query.replace(/[^=&]+=(&|$)/g, "").replace(/&$/, "");

            const res = await axios.get(`https://job-portal-and-resume-builder-pruy.vercel.app/api/jobs?${cleanQuery}`);
            setJobs(res.data.data);
        } catch (err) {
            console.error("Failed to fetch jobs");
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleApplySubmit = async (e) => {
        e.preventDefault();

        if (!resumeFile) {
            return alert("Please upload your resume (PDF) to proceed.");
        }

        try {
            let payload = {
                method: applyMode,
                resumeUrl: 'uploaded-resume.pdf', // Mock upload URL, separate file upload logic needed for real backend
                ...manualData
            };

            // In a real implementation:
            // const formData = new FormData();
            // formData.append('resume', resumeFile);
            // ... append other fields ...
            // await axios.post(url, formData, headers)

            await axios.post(`https://job-portal-and-resume-builder-pruy.vercel.app/api/applications/${selectedJob._id}/apply`,
                payload,
                { withCredentials: true }
            );
            alert("Application submitted successfully!");

            // IMMEDIATE UI UPDATE: Add to applied list
            setAppliedJobIds(prev => [...prev, String(selectedJob._id)]);

            setSelectedJob(null);
            // Reset form
            setResumeFile(null);
        } catch (err) {
            alert(err.response?.data?.message || "Failed to apply");
        }
    };

    return (
        <div className="container mx-auto px-6 py-12 animate-fade-in-up">
            <h1 className="text-3xl font-bold text-white mb-8">Find Your Dream Job</h1>

            {/* Apply Modal */}
            {selectedJob && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white p-0 rounded-2xl w-full max-w-2xl relative border border-slate-100 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-sm z-10">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Apply for {selectedJob.title}</h2>
                                <p className="text-slate-500 text-sm">{selectedJob.companyName}</p>
                            </div>
                            <button onClick={() => setSelectedJob(null)} className="text-slate-400 hover:text-red-500 transition-colors"><FiXCircle size={24} /></button>
                        </div>

                        <div className="p-8">
                            <form onSubmit={handleApplySubmit} className="space-y-6">
                                {/* Step 1: Method Selection */}
                                <div className="space-y-4">
                                    <h3 className="text-slate-900 font-bold text-lg mb-4">Step 1: Choose Application Method</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div onClick={() => navigate(`/seeker/profile-preview/${selectedJob._id}`, { state: { job: selectedJob } })} className={`p-4 rounded-xl border cursor-pointer hover:bg-slate-50 bg-white border-slate-200 transition-colors shadow-sm`}>
                                            <div className="flex items-center gap-3 mb-2">
                                                <FiUser className="text-xl text-primary" />
                                                <h3 className="font-bold text-slate-900">Use Profile</h3>
                                            </div>
                                            <p className="text-xs text-slate-500">Review your details and attach resume before applying.</p>
                                        </div>
                                        <div onClick={() => navigate(`/seeker/manual-application/${selectedJob._id}`)} className={`p-4 rounded-xl border cursor-pointer hover:bg-slate-50 bg-white border-slate-200 transition-colors shadow-sm`}>
                                            <div className="flex items-center gap-3 mb-2">
                                                <FiFileText className="text-xl text-primary" />
                                                <h3 className="font-bold text-slate-900">Fill Manually</h3>
                                            </div>
                                            <p className="text-xs text-slate-500">Go to manual application form.</p>
                                        </div>
                                    </div>
                                </div>



                                {/* About Company Section */}
                                <div className="mt-8 border-t border-slate-100 pt-6">
                                    <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2"><FiGlobe className="text-primary" /> About Company</h3>
                                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="h-16 w-16 bg-white rounded-lg flex items-center justify-center text-2xl font-bold text-slate-700 uppercase shadow-sm border border-slate-200">
                                                {selectedJob.companyName?.substring(0, 2) || 'CO'}
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-bold text-slate-900">{selectedJob.companyName}</h4>
                                                <p className="text-sm text-slate-500">{selectedJob.jobLocation}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2 text-sm text-slate-600">
                                            <p>{selectedJob.companyDescription || "A leading company in the industry."}</p>
                                            <div className="flex gap-6 mt-4 pt-4 border-t border-slate-200/50">
                                                {selectedJob.website && (
                                                    <a href={selectedJob.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                                                        <FiGlobe /> Website
                                                    </a>
                                                )}
                                                <span className="flex items-center gap-2 text-slate-500">
                                                    <FiMap /> {selectedJob.jobLocation}
                                                </span>
                                                <span className="flex items-center gap-2 text-slate-500">
                                                    <FiInfo /> {selectedJob.category || 'Tech'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>


                            </form>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Filters Sidebar */}
                {/* Filters Sidebar */}
                <div className="bg-slate-900 text-white p-6 rounded-2xl h-fit shadow-2xl space-y-6 border border-slate-800">
                    <h3 className="text-xl font-bold flex items-center gap-2"><FiSearch className="text-primary" /> Filters</h3>

                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Location</label>
                        <input name="jobLocation" value={filters.jobLocation} onChange={handleFilterChange} style={{ backgroundColor: '#ffffff', color: '#111827' }} className="input-field border-white/10 placeholder-gray-400 focus:ring-2 focus:ring-primary" placeholder="e.g. Remote, London" />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Category</label>
                        <select name="category" value={filters.category} onChange={handleFilterChange} style={{ backgroundColor: '#ffffff', color: '#111827' }} className="input-field border-white/10 focus:ring-2 focus:ring-primary [&>option]:bg-white [&>option]:text-gray-900">
                            <option value="">All Categories</option>
                            <option>Software</option>
                            <option>HR</option>
                            <option>Marketing</option>
                            <option>Sales</option>
                            <option>Finance</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Job Type</label>
                        <select name="type" value={filters.type} onChange={handleFilterChange} style={{ backgroundColor: '#ffffff', color: '#111827' }} className="input-field border-white/10 focus:ring-2 focus:ring-primary [&>option]:bg-white [&>option]:text-gray-900">
                            <option value="">All Types</option>
                            <option>Full-time</option>
                            <option>Part-time</option>
                            <option>Remote</option>
                            <option>Contract</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Experience</label>
                        <select name="experienceLevel" value={filters.experienceLevel} onChange={handleFilterChange} style={{ backgroundColor: '#ffffff', color: '#111827' }} className="input-field border-white/10 focus:ring-2 focus:ring-primary [&>option]:bg-white [&>option]:text-gray-900">
                            <option value="">Any Experience</option>
                            <option>0-1</option>
                            <option>1-3</option>
                            <option>3-5</option>
                            <option>5-7</option>
                            <option>7+</option>
                        </select>
                    </div>
                </div>

                {/* Job Grid */}
                <div className="lg:col-span-3 space-y-6">
                    {loading ? <p className="text-white">Loading jobs...</p> : (
                        jobs.length > 0 ? (
                            jobs.map(job => (
                                <div key={job._id} className="glass p-6 rounded-2xl border border-white/5 hover:border-primary/30 transition-all group relative">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-bold text-white group-hover:text-primary transition">{job.title}</h3>
                                            <p className="text-muted">{job.companyName}</p>
                                        </div>
                                        <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-semibold text-white border border-white/10">{job.type}</span>
                                    </div>

                                    <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted">
                                        <div className="flex items-center gap-1"><FiMapPin /> {job.jobLocation}</div>
                                        <div className="flex items-center gap-1"><FiBriefcase /> {job.experienceLevel} Yrs</div>
                                        <div className="flex items-center gap-1"><FiDollarSign /> {job.isSalaryNotDisclosed ? 'Not Disclosed' : `$${job.salaryMin} - $${job.salaryMax}`}</div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-white/5 flex gap-2">
                                        {job.requirements.slice(0, 3).map((skill, i) => (
                                            <span key={i} className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">{skill}</span>
                                        ))}
                                    </div>

                                    <div className="mt-6 flex justify-end">
                                        {appliedJobIds.includes(job._id) ? (
                                            <div className="flex flex-col items-end gap-1">
                                                <button disabled className="btn-primary py-2 px-6 opacity-50 cursor-not-allowed">Apply Now</button>
                                                <span className="text-xs text-red-400 font-medium">You have already applied for this job.</span>
                                            </div>
                                        ) : (
                                            <button onClick={() => setSelectedJob(job)} className="btn-primary py-2 px-6">Apply Now</button>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : <p className="text-muted">No jobs found matching your criteria.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FindJobs;
