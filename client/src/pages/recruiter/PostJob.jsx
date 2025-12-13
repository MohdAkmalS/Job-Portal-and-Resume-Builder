import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiSave, FiX, FiBriefcase } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const PostJob = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        type: 'Full-time',
        category: 'Software',
        description: '',
        responsibilities: '',
        requirements: '',
        jobLocation: '',
        salaryMin: '',
        salaryMax: '',
        isSalaryNotDisclosed: false,
        experienceLevel: '1-3',
        education: '',
        companyName: user?.profile?.companyName || '',
        deadline: '',
        keywords: ''
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Process array fields
            const payload = {
                ...formData,
                requirements: formData.requirements.split('\n').filter(line => line.trim() !== ''),
                keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k !== '')
            };

            await axios.post('http://localhost:5000/api/jobs', payload, { withCredentials: true });
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to post job');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-6 py-12 animate-fade-in-up">
            <div className="max-w-4xl mx-auto glass rounded-2xl p-8 border border-white/5">
                <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
                    <div className="p-3 bg-primary/20 text-primary rounded-xl">
                        <FiBriefcase size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Post a New Job</h1>
                        <p className="text-muted">Find the perfect candidate for your team</p>
                    </div>
                </div>

                {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-6">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Job Details Section */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-white">Job Details</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-muted mb-1">Job Title*</label>
                                <input name="title" required value={formData.title} onChange={handleChange} className="input-field" placeholder="e.g. Senior React Developer" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted mb-1">Job Category*</label>
                                <select name="category" value={formData.category} onChange={handleChange} className="input-field">
                                    <option>Software</option>
                                    <option>HR</option>
                                    <option>Marketing</option>
                                    <option>Sales</option>
                                    <option>Finance</option>
                                    <option>Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-muted mb-1">Job Type*</label>
                                <select name="type" value={formData.type} onChange={handleChange} className="input-field">
                                    <option>Full-time</option>
                                    <option>Part-time</option>
                                    <option>Internship</option>
                                    <option>Contract</option>
                                    <option>Remote</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted mb-1">Experience Level*</label>
                                <select name="experienceLevel" value={formData.experienceLevel} onChange={handleChange} className="input-field">
                                    <option>0-1</option>
                                    <option>1-3</option>
                                    <option>3-5</option>
                                    <option>5-7</option>
                                    <option>7+</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-muted mb-1">Job Description*</label>
                            <textarea name="description" required rows="4" value={formData.description} onChange={handleChange} className="input-field" placeholder="Describe the role and objectives..." />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-muted mb-1">Key Responsibilities</label>
                            <textarea name="responsibilities" rows="4" value={formData.responsibilities} onChange={handleChange} className="input-field" placeholder="List key duties..." />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-muted mb-1">Requirements / Skills (One per line)*</label>
                            <textarea name="requirements" required rows="4" value={formData.requirements} onChange={handleChange} className="input-field" placeholder="React.js&#10;Node.js&#10;Team Player" />
                        </div>
                    </div>

                    {/* Location & Compensation */}
                    <div className="space-y-6 pt-6 border-t border-white/10">
                        <h2 className="text-xl font-semibold text-white">Location & Compensation</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-muted mb-1">Job Location*</label>
                                <input name="jobLocation" required value={formData.jobLocation} onChange={handleChange} className="input-field" placeholder="London, UK or Remote" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted mb-1">Education Requirement</label>
                                <input name="education" value={formData.education} onChange={handleChange} className="input-field" placeholder="e.g. Bachelor's in CS" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-muted mb-1">Min Salary</label>
                                <input name="salaryMin" type="number" disabled={formData.isSalaryNotDisclosed} value={formData.salaryMin} onChange={handleChange} className="input-field" placeholder="50000" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted mb-1">Max Salary</label>
                                <input name="salaryMax" type="number" disabled={formData.isSalaryNotDisclosed} value={formData.salaryMax} onChange={handleChange} className="input-field" placeholder="80000" />
                            </div>
                            <div className="flex items-center pt-6">
                                <label className="flex items-center gap-2 cursor-pointer text-muted">
                                    <input
                                        type="checkbox"
                                        name="isSalaryNotDisclosed"
                                        checked={formData.isSalaryNotDisclosed}
                                        onChange={handleChange}
                                        className="w-4 h-4 rounded border-white/20 bg-surface/50 text-primary focus:ring-primary"
                                    />
                                    Don't disclose salary
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Meta & Actions */}
                    <div className="space-y-6 pt-6 border-t border-white/10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-muted mb-1">Application Deadline</label>
                                <input name="deadline" type="date" value={formData.deadline} onChange={handleChange} className="input-field" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted mb-1">Keywords (Comma separated)</label>
                                <input name="keywords" value={formData.keywords} onChange={handleChange} className="input-field" placeholder="React, Frontend, Senior" />
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 pt-4">
                            <button type="button" onClick={() => navigate('/dashboard')} className="px-6 py-3 rounded-xl border border-white/10 text-muted hover:text-white hover:bg-white/5 transition font-medium flex items-center gap-2">
                                <FiX /> Cancel
                            </button>
                            <button type="submit" disabled={loading} className="btn-primary py-3 px-8 flex items-center gap-2">
                                <FiSave /> {loading ? 'Publishing...' : 'Publish Job'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PostJob;
