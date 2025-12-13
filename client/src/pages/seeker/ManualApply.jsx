import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiArrowLeft, FiCheckCircle, FiUploadCloud, FiTrash2, FiPlus, FiEdit2 } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const ManualApply = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    // States
    const [step, setStep] = useState(1); // 1: Form, 2: Preview
    const [submitting, setSubmitting] = useState(false);
    const [job, setJob] = useState(null);
    const [resumeFile, setResumeFile] = useState(null);
    const [hasApplied, setHasApplied] = useState(false);

    // Form State - Initialize with empty values to show form immediately
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        linkedin: '',
        portfolio: '',
        skills: '', // Comma separated string for UI, parsed on submit
        education: [{ degree: '', college: '', year: '', cgpa: '' }],
        experience: [{ company: '', role: '', duration: '', responsibilities: '' }],
        projects: [{ title: '', description: '', technologies: '' }]
    });

    // Initial Data Fetch (Non-blocking)
    useEffect(() => {
        const init = async () => {
            // 1. Fetch Job Details
            try {
                const res = await axios.get(`https://jobportal-backend.vercel.app/api/jobs/${jobId}`);
                if (res.data.success) {
                    setJob(res.data.data);
                }
            } catch (err) {
                console.error("Job fetch failed", err);
            }

            // 2. Pre-fill User Data if available
            if (user) {
                setFormData(prev => ({
                    ...prev,
                    fullName: user.name || '',
                    email: user.email || '',
                    phone: user.phoneNumber || '',
                    address: user.profile?.address || '',
                    skills: user.profile?.skills?.join(', ') || '',
                    // Keep other complex arrays empty or map if user profile has them (assuming profile structure matches)
                }));
            }

            // 3. Check for existing application
            try {
                const statsRes = await axios.get('https://jobportal-backend.vercel.app/api/applications/my-stats', { withCredentials: true });
                const applied = statsRes.data.data.applications.some(app => {
                    const appJobId = app.job?._id || app.job;
                    return appJobId && String(appJobId) === String(jobId);
                });
                setHasApplied(applied);
            } catch (err) {
                console.error("Failed to check application status", err);
            }
        };
        init();
    }, [jobId, user]);

    // Handlers for Complex Fields
    const handleEducationChange = (index, field, value) => {
        const newEducation = [...formData.education];
        newEducation[index][field] = value;
        setFormData({ ...formData, education: newEducation });
    };

    const addEducation = () => {
        setFormData({ ...formData, education: [...formData.education, { degree: '', college: '', year: '', cgpa: '' }] });
    };

    const removeEducation = (index) => {
        const newEducation = formData.education.filter((_, i) => i !== index);
        setFormData({ ...formData, education: newEducation });
    };

    const handleExperienceChange = (index, field, value) => {
        const newExp = [...formData.experience];
        newExp[index][field] = value;
        setFormData({ ...formData, experience: newExp });
    };

    const addExperience = () => {
        setFormData({ ...formData, experience: [...formData.experience, { company: '', role: '', duration: '', responsibilities: '' }] });
    };

    const removeExperience = (index) => {
        const newExp = formData.experience.filter((_, i) => i !== index);
        setFormData({ ...formData, experience: newExp });
    };

    const handleProjectChange = (index, field, value) => {
        const newProj = [...formData.projects];
        newProj[index][field] = value;
        setFormData({ ...formData, projects: newProj });
    };

    const addProject = () => {
        setFormData({ ...formData, projects: [...formData.projects, { title: '', description: '', technologies: '' }] });
    };

    const removeProject = (index) => {
        const newProj = formData.projects.filter((_, i) => i !== index);
        setFormData({ ...formData, projects: newProj });
    };

    // Submission
    const handleSubmit = async () => {
        if (!resumeFile) return;

        setSubmitting(true);
        try {
            // 1. Upload Resume
            const formData = new FormData();
            formData.append('resume', resumeFile);

            const uploadRes = await axios.post('https://jobportal-backend.vercel.app/api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });

            if (!uploadRes.data.success) throw new Error("Resume upload failed");
            const realResumeUrl = uploadRes.data.filePath;

            // 2. Construct Payload
            const payload = {
                jobId,
                resumeUrl: realResumeUrl,
                coverLetter: `Applied manually.`,
                manualData: formData // Sending it anyway as per previous logic
            };

            await axios.post(`https://jobportal-backend.vercel.app/api/applications/${jobId}/apply`, payload, { withCredentials: true });

            // Success Redirect
            navigate('/my-applications');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || err.message || "Application Failed");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto px-6 py-12 animate-fade-in-up">
            {/* Header */}
            <button onClick={() => step === 2 ? setStep(1) : navigate('/find-jobs')} className="text-muted hover:text-white flex items-center gap-2 mb-6">
                <FiArrowLeft /> {step === 2 ? 'Edit Details' : 'Back to Jobs'}
            </button>

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">
                    {step === 1 ? 'Apply Manually' : 'Review Application'}
                </h1>
                <p className="text-muted text-lg">
                    {job ? `For ${job.title} at ${job.companyName}` : 'Loading job details...'}
                </p>
            </div>

            {/* STEP 1: FORM */}
            {step === 1 && (
                <div className="glass p-8 rounded-2xl border border-white/5 space-y-8">
                    {/* Personal Info */}
                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">Personal Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="block text-sm text-muted mb-1">Full Name *</label><input className="input-field" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} /></div>
                            <div><label className="block text-sm text-muted mb-1">Email *</label><input className="input-field" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} /></div>
                            <div><label className="block text-sm text-muted mb-1">Phone *</label><input className="input-field" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} /></div>
                            <div><label className="block text-sm text-muted mb-1">Address *</label><input className="input-field" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} /></div>
                            <div><label className="block text-sm text-muted mb-1">LinkedIn (Optional)</label><input className="input-field" value={formData.linkedin} onChange={e => setFormData({ ...formData, linkedin: e.target.value })} /></div>
                            <div><label className="block text-sm text-muted mb-1">Portfolio (Optional)</label><input className="input-field" value={formData.portfolio} onChange={e => setFormData({ ...formData, portfolio: e.target.value })} /></div>
                        </div>
                    </section>

                    {/* Education */}
                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2 flex justify-between items-center">
                            Education <button onClick={addEducation} className="text-sm text-primary flex items-center gap-1"><FiPlus /> Add</button>
                        </h2>
                        {formData.education.map((edu, index) => (
                            <div key={index} className="bg-white/5 p-4 rounded-xl mb-4 relative">
                                {formData.education.length > 1 && <button onClick={() => removeEducation(index)} className="absolute top-2 right-2 text-red-400 hover:text-red-300"><FiTrash2 /></button>}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div><input placeholder="Degree (e.g. B.Tech)" className="input-field" value={edu.degree} onChange={e => handleEducationChange(index, 'degree', e.target.value)} /></div>
                                    <div><input placeholder="College / University" className="input-field" value={edu.college} onChange={e => handleEducationChange(index, 'college', e.target.value)} /></div>
                                    <div><input placeholder="Graduation Year" className="input-field" value={edu.year} onChange={e => handleEducationChange(index, 'year', e.target.value)} /></div>
                                    <div><input placeholder="CGPA / Percentage" className="input-field" value={edu.cgpa} onChange={e => handleEducationChange(index, 'cgpa', e.target.value)} /></div>
                                </div>
                            </div>
                        ))}
                    </section>

                    {/* Skills */}
                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">Skills</h2>
                        <textarea
                            className="input-field w-full"
                            rows="2"
                            placeholder="Enter skills separated by commas (e.g. React, Node.js, Python)"
                            value={formData.skills}
                            onChange={e => setFormData({ ...formData, skills: e.target.value })}
                        ></textarea>
                    </section>

                    {/* Experience */}
                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2 flex justify-between items-center">
                            Experience <button onClick={addExperience} className="text-sm text-primary flex items-center gap-1"><FiPlus /> Add</button>
                        </h2>
                        {formData.experience.map((exp, index) => (
                            <div key={index} className="bg-white/5 p-4 rounded-xl mb-4 relative">
                                {formData.experience.length > 1 && <button onClick={() => removeExperience(index)} className="absolute top-2 right-2 text-red-400 hover:text-red-300"><FiTrash2 /></button>}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                                    <input placeholder="Company Name" className="input-field" value={exp.company} onChange={e => handleExperienceChange(index, 'company', e.target.value)} />
                                    <input placeholder="Role / Job Title" className="input-field" value={exp.role} onChange={e => handleExperienceChange(index, 'role', e.target.value)} />
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    <input placeholder="Duration (e.g. 2020 - 2022)" className="input-field" value={exp.duration} onChange={e => handleExperienceChange(index, 'duration', e.target.value)} />
                                    <textarea placeholder="Responsibilities" className="input-field" rows="2" value={exp.responsibilities} onChange={e => handleExperienceChange(index, 'responsibilities', e.target.value)}></textarea>
                                </div>
                            </div>
                        ))}
                    </section>

                    {/* Projects */}
                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2 flex justify-between items-center">
                            Projects <button onClick={addProject} className="text-sm text-primary flex items-center gap-1"><FiPlus /> Add</button>
                        </h2>
                        {formData.projects.map((proj, index) => (
                            <div key={index} className="bg-white/5 p-4 rounded-xl mb-4 relative">
                                {formData.projects.length > 1 && <button onClick={() => removeProject(index)} className="absolute top-2 right-2 text-red-400 hover:text-red-300"><FiTrash2 /></button>}
                                <div className="space-y-3">
                                    <input placeholder="Project Title" className="input-field" value={proj.title} onChange={e => handleProjectChange(index, 'title', e.target.value)} />
                                    <textarea placeholder="Description" className="input-field" rows="2" value={proj.description} onChange={e => handleProjectChange(index, 'description', e.target.value)}></textarea>
                                    <input placeholder="Technologies Used" className="input-field" value={proj.technologies} onChange={e => handleProjectChange(index, 'technologies', e.target.value)} />
                                </div>
                            </div>
                        ))}
                    </section>

                    <div className="pt-4 flex justify-end">
                        <button onClick={() => setStep(2)} className="btn-primary py-3 px-8 text-lg shadow-lg shadow-primary/20">
                            Continue to Preview
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 2: PREVIEW */}
            {step === 2 && (
                <div className="space-y-8">
                    <div className="glass p-8 rounded-2xl border border-white/5 space-y-6">
                        {/* Preview Sections */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm border-b border-white/10 pb-6">
                            <div><p className="text-muted">Full Name</p><p className="text-white text-lg font-bold">{formData.fullName}</p></div>
                            <div><p className="text-muted">Email</p><p className="text-white text-lg font-bold">{formData.email}</p></div>
                            <div><p className="text-muted">Phone</p><p className="text-white">{formData.phone}</p></div>
                            <div><p className="text-muted">Address</p><p className="text-white">{formData.address}</p></div>
                            {formData.linkedin && <div><p className="text-muted">LinkedIn</p><p className="text-primary">{formData.linkedin}</p></div>}
                            {formData.portfolio && <div><p className="text-muted">Portfolio</p><p className="text-primary">{formData.portfolio}</p></div>}
                        </div>

                        <div>
                            <h3 className="text-white font-bold mb-3">Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {formData.skills.split(',').map((skill, i) => skill.trim() && (
                                    <span key={i} className="px-3 py-1 bg-white/10 rounded-full text-sm text-white border border-white/10">{skill.trim()}</span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-white font-bold mb-3">Education</h3>
                            <div className="space-y-3">
                                {formData.education.map((edu, i) => (
                                    <div key={i} className="bg-white/5 p-4 rounded-lg">
                                        <div className="flex justify-between font-bold text-white"><span>{edu.degree}</span> <span>{edu.year}</span></div>
                                        <div className="text-muted text-sm">{edu.college}</div>
                                        <div className="text-muted text-xs mt-1">CGPA: {edu.cgpa}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-white font-bold mb-3">Experience</h3>
                            <div className="space-y-3">
                                {formData.experience.map((exp, i) => (
                                    <div key={i} className="bg-white/5 p-4 rounded-lg">
                                        <div className="flex justify-between font-bold text-white"><span>{exp.role}</span> <span className="text-sm font-normal bg-primary/20 text-primary px-2 py-0.5 rounded">{exp.duration}</span></div>
                                        <div className="text-muted text-sm font-medium mb-2 opacity-80">{exp.company}</div>
                                        <p className="text-gray-400 text-sm whitespace-pre-wrap">{exp.responsibilities}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-white font-bold mb-3">Projects</h3>
                            <div className="space-y-3">
                                {formData.projects.map((proj, i) => (
                                    <div key={i} className="bg-white/5 p-4 rounded-lg border-l-2 border-primary">
                                        <div className="font-bold text-white text-lg">{proj.title}</div>
                                        <p className="text-gray-400 text-sm mt-1 mb-2">{proj.description}</p>
                                        <div className="text-xs text-primary font-mono">{proj.technologies}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Resume Upload & Submit */}
                    <div className="glass p-8 rounded-2xl border border-white/5">
                        <h3 className="text-xl font-bold text-white mb-6">Final Step: Upload Resume</h3>

                        <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${resumeFile ? 'border-green-500/50 bg-green-500/10' : 'border-white/20 hover:border-primary/50'}`}>
                            <FiUploadCloud className={`mx-auto text-4xl mb-4 ${resumeFile ? 'text-green-500' : 'text-muted'}`} />
                            {resumeFile ? (
                                <div>
                                    <p className="text-green-400 font-bold text-lg mb-2">{resumeFile.name}</p>
                                    <button onClick={() => setResumeFile(null)} className="text-sm text-red-400 hover:underline">Remove and Upload Different</button>
                                </div>
                            ) : (
                                <div>
                                    <label className="btn-secondary cursor-pointer inline-block">
                                        <span>Select PDF Resume</span>
                                        <input type="file" accept=".pdf" className="hidden" onChange={e => setResumeFile(e.target.files[0])} />
                                    </label>
                                    <p className="text-muted text-xs mt-3">Supported Format: PDF (Max 5MB)</p>
                                </div>
                            )}
                        </div>

                        {!resumeFile && (
                            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center font-medium">
                                Please upload your resume before submitting.
                            </div>
                        )}

                        <div className="flex gap-4 mt-8">
                            <button onClick={() => setStep(1)} className="btn-secondary flex-1 py-4 flex items-center justify-center gap-2">
                                <FiEdit2 /> Edit Application
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={!resumeFile || submitting || hasApplied}
                                className={`flex-1 py-4 flex items-center justify-center gap-2 font-bold text-lg rounded-xl transition-all ${(!resumeFile || submitting || hasApplied) ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50' : 'btn-primary shadow-lg shadow-primary/20'}`}
                            >
                                {submitting ? 'Submitting...' : hasApplied ? 'Applied' : <><FiCheckCircle /> Submit Application</>}
                            </button>
                            {hasApplied && (
                                <p className="text-red-400 text-center text-sm w-full absolute -bottom-8 left-0 font-medium">
                                    You have already applied for this job.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManualApply;
