import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FiArrowLeft, FiCheckCircle, FiUploadCloud, FiEdit2, FiBriefcase, FiMapPin, FiCalendar } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const ProfilePreview = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    // Initialize job from state if available (Instant Load), otherwise null
    const [job, setJob] = useState(location.state?.job || null);

    // Only show loading if we DON'T have a job yet
    const [loading, setLoading] = useState(!location.state?.job);

    const [submitting, setSubmitting] = useState(false);
    const [freshUser, setFreshUser] = useState(null);
    const [resumeFile, setResumeFile] = useState(null);
    const [hasApplied, setHasApplied] = useState(false);

    useEffect(() => {
        const init = async () => {
            console.log("ProfilePreview Init. JobID:", jobId, "Has State Job:", !!location.state?.job);

            // 1. Fetch Job (Background update or Initial Fetch)
            if (jobId) {
                try {
                    const jobRes = await axios.get(`https://job-portal-and-resume-builder-pruy.vercel.app/api/jobs/${jobId}`);
                    console.log("API Job Response:", jobRes.data);

                    if (jobRes.data.success && jobRes.data.data) {
                        setJob(jobRes.data.data);
                    } else if (jobRes.data && !jobRes.data.success) {
                        // Fallback handling if success flag is missing but structure is flat
                        setJob(prev => prev || jobRes.data);
                    }
                } catch (err) {
                    console.error("Job fetch failed", err);
                }
            }

            // 2. Fetch Fresh User Data AND Application Status
            try {
                const [userRes, statsRes] = await Promise.all([
                    axios.get('https://job-portal-and-resume-builder-pruy.vercel.app/api/auth/me', { withCredentials: true }),
                    axios.get('https://job-portal-and-resume-builder-pruy.vercel.app/api/applications/my-stats', { withCredentials: true })
                ]);

                if (userRes.data.success) setFreshUser(userRes.data.user);

                // Check if already applied
                const applied = statsRes.data.data.applications.some(app => {
                    const appJobId = app.job?._id || app.job;
                    return appJobId === jobId;
                });
                setHasApplied(applied);

            } catch (err) {
                console.error("Data fetch failed", err);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [jobId]);

    const handleSubmit = async () => {
        if (!resumeFile) return;
        setSubmitting(true);
        try {
            // 1. Upload Resume
            const formData = new FormData();
            formData.append('resume', resumeFile);

            const uploadRes = await axios.post('https://job-portal-and-resume-builder-pruy.vercel.app/api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });

            if (!uploadRes.data.success) throw new Error("Resume upload failed");
            const realResumeUrl = uploadRes.data.filePath;

            // 2. Submit Application
            const payload = {
                method: 'profile',
                resumeUrl: realResumeUrl
            };

            await axios.post(`https://job-portal-and-resume-builder-pruy.vercel.app/api/applications/${jobId}/apply`, payload, { withCredentials: true });

            navigate('/my-applications');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || err.message || "Application Failed");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="text-white p-10">Loading...</div>;
    if (!job) return <div className="text-white p-10">Job not found.</div>;

    // Use freshUser for display
    const userData = freshUser || user;
    const profile = userData?.profile || {};

    return (
        <div className="container mx-auto px-6 py-12 animate-fade-in-up">
            <button onClick={() => navigate('/find-jobs')} className="text-muted hover:text-white flex items-center gap-2 mb-6">
                <FiArrowLeft /> Back to Jobs
            </button>

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Review Application</h1>
                <p className="text-muted text-lg">Applying for <span className="text-primary">{job.title}</span> at {job.companyName}</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left: Preview */}
                <div className="flex-1 space-y-8">
                    <div className="glass p-8 rounded-2xl border border-white/5 space-y-6 relative">
                        <button
                            onClick={() => navigate('/seeker/profile')}
                            className="absolute top-8 right-8 text-primary hover:text-primary/80 flex items-center gap-2 text-sm font-bold border border-primary/20 bg-primary/10 px-4 py-2 rounded-lg"
                        >
                            <FiEdit2 /> Edit Details
                        </button>

                        {/* Personal Info */}
                        <section>
                            <h2 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">Personal Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div><p className="text-muted">Full Name</p><p className="text-white font-bold">{userData.name}</p></div>
                                <div><p className="text-muted">Email</p><p className="text-white font-bold">{userData.email}</p></div>
                                <div><p className="text-muted">Phone</p><p className="text-white">{userData.phoneNumber || 'Not provided'}</p></div>
                                <div><p className="text-muted">Location</p><p className="text-white">{profile.address || 'Not provided'}</p></div>
                            </div>
                        </section>

                        {/* Education */}
                        <section>
                            <h2 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">Education</h2>
                            {profile.education && profile.education.length > 0 ? (
                                <div className="space-y-4">
                                    {profile.education.map((edu, i) => (
                                        <div key={i} className="bg-white/5 p-4 rounded-lg">
                                            <div className="font-bold text-white">{edu.degree}</div>
                                            <div className="text-muted text-sm">{edu.institution}</div>
                                            <div className="flex gap-4 text-xs text-muted mt-2">
                                                <span>Year: {edu.year}</span>
                                                {edu.cgpa && <span>CGPA/Percentage: {edu.cgpa}</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="text-muted italic">No education details added.</p>}
                        </section>

                        {/* Skills */}
                        <section>
                            <h2 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">Skills</h2>
                            <div className="flex flex-wrap gap-2">
                                {profile.skills && profile.skills.length > 0 ? (
                                    profile.skills.map((skill, i) => (
                                        <span key={i} className="px-3 py-1 bg-white/10 rounded-full text-sm text-white border border-white/10">{skill}</span>
                                    ))
                                ) : <p className="text-muted italic">No skills added.</p>}
                            </div>
                        </section>

                        {/* Experience */}
                        <section>
                            <h2 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">Experience</h2>
                            {profile.experience && profile.experience.length > 0 ? (
                                <div className="space-y-4">
                                    {profile.experience.map((exp, i) => (
                                        <div key={i} className="bg-white/5 p-4 rounded-lg">
                                            <div className="flex justify-between font-bold text-white"><span>{exp.role}</span> <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">{exp.duration}</span></div>
                                            <div className="text-muted text-sm mb-2 opacity-80">{exp.company}</div>
                                            <p className="text-gray-400 text-sm">{exp.description}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="text-muted italic">No experience details added.</p>}
                        </section>

                        {/* Projects */}
                        <section>
                            <h2 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">Projects</h2>
                            {profile.projects && profile.projects.length > 0 ? (
                                <div className="space-y-4">
                                    {profile.projects.map((proj, i) => (
                                        <div key={i} className="bg-white/5 p-4 rounded-lg border-l-2 border-primary">
                                            <div className="font-bold text-white text-lg">{proj.title}</div>
                                            <p className="text-gray-400 text-sm mt-1">{proj.description}</p>
                                            {proj.technologies && <div className="text-xs text-primary font-mono mt-2">{proj.technologies}</div>}
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="text-muted italic">No projects added.</p>}
                        </section>

                        {/* Links */}
                        <section>
                            <h2 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">Links</h2>
                            <div className="space-y-2 text-sm">
                                {profile.linkedin ? <div><p className="text-muted">LinkedIn</p><a href={profile.linkedin} target="_blank" className="text-primary hover:underline">{profile.linkedin}</a></div> : <p className="text-muted">LinkedIn: No link provided</p>}
                                {profile.github ? <div><p className="text-muted">GitHub</p><a href={profile.github} target="_blank" className="text-primary hover:underline">{profile.github}</a></div> : <p className="text-muted">GitHub: No link provided</p>}
                                {profile.portfolio ? <div><p className="text-muted">Portfolio</p><a href={profile.portfolio} target="_blank" className="text-primary hover:underline">{profile.portfolio}</a></div> : <p className="text-muted">Portfolio: No link provided</p>}
                            </div>
                        </section>
                    </div>
                </div>

                {/* Right/Bottom: Action */}
                <div className="lg:w-1/3 space-y-6">
                    <div className="glass p-8 rounded-2xl border border-white/5 sticky top-6">
                        <h3 className="text-xl font-bold text-white mb-6">Final Step</h3>

                        <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors mb-6 ${resumeFile ? 'border-green-500/50 bg-green-500/10' : 'border-white/20 hover:border-primary/50'}`}>
                            <FiUploadCloud className={`mx-auto text-4xl mb-4 ${resumeFile ? 'text-green-500' : 'text-muted'}`} />
                            {resumeFile ? (
                                <div>
                                    <p className="text-green-400 font-bold text-sm mb-2">{resumeFile.name}</p>
                                    <button onClick={() => setResumeFile(null)} className="text-xs text-red-400 hover:underline">Remove</button>
                                </div>
                            ) : (
                                <div>
                                    <label className="btn-secondary cursor-pointer inline-block w-full py-2 text-sm">
                                        <span>Select PDF Resume</span>
                                        <input type="file" accept=".pdf" className="hidden" onChange={e => setResumeFile(e.target.files[0])} />
                                    </label>
                                    <p className="text-muted text-xs mt-2">Required *</p>
                                </div>
                            )}
                        </div>

                        {!resumeFile && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs text-center font-medium">
                                Please upload your resume before submitting.
                            </div>
                        )}

                        <button
                            onClick={handleSubmit}
                            disabled={!resumeFile || submitting || hasApplied}
                            className={`w-full py-4 flex items-center justify-center gap-2 font-bold text-lg rounded-xl transition-all ${(!resumeFile || submitting || hasApplied) ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50' : 'btn-primary shadow-lg shadow-primary/20'}`}
                        >
                            {submitting ? 'Submitting...' : hasApplied ? 'Applied' : <><FiCheckCircle /> Submit Application</>}
                        </button>
                        {hasApplied && (
                            <p className="text-red-400 text-center text-sm mt-3 font-medium">
                                You have already applied for this job.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePreview;
