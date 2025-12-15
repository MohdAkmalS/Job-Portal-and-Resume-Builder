import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FiUser, FiMail, FiPhone, FiDownload, FiCalendar, FiClock, FiFileText, FiCheckCircle, FiXCircle, FiMessageSquare } from 'react-icons/fi';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const ApplicationDetails = () => {
    const { id } = useParams();
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [note, setNote] = useState('');
    const [interviewData, setInterviewData] = useState({
        date: '',
        time: '',
        mode: 'Online',
        link: '',
        location: '',
        notes: ''
    });

    // Hidden ref for PDF generation
    const resumeRef = useRef();

    useEffect(() => {
        fetchApplication();
    }, [id]);

    const fetchApplication = async () => {
        try {
            const res = await axios.get(`https://job-portal-and-resume-builder-pruy.vercel.app/api/applications/${id}`, { withCredentials: true });
            setApplication(res.data.data);
            setNote(res.data.data.recruiterNotes || '');
        } catch (err) {
            console.error("Failed to fetch application", err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (status) => {
        try {
            await axios.patch(`https://job-portal-and-resume-builder-pruy.vercel.app/api/applications/${id}/status`, { status }, { withCredentials: true });
            fetchApplication();
            alert(`Application ${status}`);
        } catch (err) {
            alert("Failed to update status");
        }
    };

    const handleScheduleInterview = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`https://job-portal-and-resume-builder-pruy.vercel.app/api/applications/${id}/schedule`, interviewData, { withCredentials: true });
            fetchApplication();
            alert("Interview Scheduled!");
        } catch (err) {
            alert("Failed to schedule interview");
        }
    };

    const handleAddNote = async () => {
        try {
            await axios.put(`https://job-portal-and-resume-builder-pruy.vercel.app/api/applications/${id}/note`, { note }, { withCredentials: true });
            alert("Note saved");
        } catch (err) {
            alert("Failed to save note");
        }
    };

    const downloadResume = async () => {
        // If uploaded resume exists and is a URL
        if (application.resumeUrl && application.resumeUrl.startsWith('http') && !application.resumeUrl.includes('auto-generated')) {
            window.open(application.resumeUrl, '_blank');
            return;
        }

        // Generate PDF
        const input = document.getElementById('recruit-resume-node');
        if (!input) return alert("Resume data not available for generation.");

        try {
            const canvas = await html2canvas(input, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            const fileName = `${application.applicant.name}_${application.job.title}.pdf`.replace(/\s+/g, '_');
            pdf.save(fileName);
        } catch (err) {
            console.error("PDF generation failed", err);
            alert("Failed to generate PDF");
        }
    };

    if (loading) return <div className="text-white text-center mt-10">Loading details...</div>;
    if (!application) return <div className="text-white text-center mt-10">Application not found</div>;

    return (
        <div className="container mx-auto px-6 py-12 animate-fade-in-up">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Application Details</h1>
                    <p className="text-muted">Reviewing candidate for <span className="text-primary font-bold">{application.job?.title}</span></p>
                </div>
                <div className="flex gap-4">
                    <button onClick={downloadResume} className="btn-secondary flex items-center gap-2">
                        <FiDownload /> Download Resume
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Candidate Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Candidate Card */}
                    <div className="glass p-8 rounded-2xl border border-white/5 relative">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-6">
                                <div className="h-20 w-20 bg-gray-700 rounded-full flex items-center justify-center text-3xl text-gray-400">
                                    <FiUser />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">{application.applicant?.name}</h2>
                                    <div className="text-muted space-y-1 mt-2">
                                        <p className="flex items-center gap-2"><FiMail /> {application.applicant?.email}</p>
                                        <p className="flex items-center gap-2"><FiPhone /> {application.applicant?.phoneNumber || application.applicant?.profile?.phoneNumber || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                            <span className={`px-4 py-2 rounded-full text-sm font-bold border ${application.status === 'Shortlisted' ? 'border-green-500 text-green-400 bg-green-500/10' :
                                application.status === 'Hired' ? 'border-blue-500 text-blue-400 bg-blue-500/10' :
                                    application.status === 'Rejected' ? 'border-red-500 text-red-400 bg-red-500/10' :
                                        'border-blue-500 text-blue-400 bg-blue-500/10'
                                }`}>
                                {application.status}
                            </span>
                        </div>

                        <div className="mt-8 border-t border-white/10 pt-6">
                            <h3 className="text-lg font-bold text-white mb-4">Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {application.applicant?.profile?.skills?.map((skill, i) => (
                                    <span key={i} className="px-3 py-1 bg-white/5 text-white rounded-full text-sm">{skill}</span>
                                )) || <p className="text-muted italic">No skills listed</p>}
                            </div>
                        </div>

                        <div className="mt-8 border-t border-white/10 pt-6">
                            <h3 className="text-lg font-bold text-white mb-4">Experience</h3>
                            {application.applicant?.profile?.experience?.length > 0 ? (
                                <div className="space-y-4">
                                    {application.applicant.profile.experience.map((exp, i) => (
                                        <div key={i}>
                                            <h4 className="font-bold text-white">{exp.role} at {exp.company}</h4>
                                            <p className="text-sm text-muted">{new Date(exp.start).getFullYear()} - {exp.end ? new Date(exp.end).getFullYear() : 'Present'}</p>
                                            <p className="text-sm text-gray-400 mt-1">{exp.description}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="text-muted italic">No experience listed</p>}
                        </div>
                    </div>

                    {/* Job Details */}
                    <div className="glass p-6 rounded-2xl border border-white/5">
                        <h3 className="text-lg font-bold text-white mb-4">Job Details</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-muted">Job Title</p>
                                <p className="text-white font-medium">{application.job?.title}</p>
                            </div>
                            <div>
                                <p className="text-muted">Applied Date</p>
                                <p className="text-white font-medium">{new Date(application.appliedAt).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-muted">Location</p>
                                <p className="text-white font-medium">{application.job?.jobLocation}</p>
                            </div>
                            <div>
                                <p className="text-muted">Salary</p>
                                <p className="text-white font-medium">{application.job?.isSalaryNotDisclosed ? 'Not Disclosed' : `$${application.job?.salaryMin} - $${application.job?.salaryMax}`}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Actions */}
                <div className="space-y-6">
                    {/* Actions */}
                    <div className="glass p-6 rounded-2xl border border-white/5">
                        <h3 className="text-lg font-bold text-white mb-4">Actions</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => handleStatusUpdate('Shortlisted')} className="btn-primary flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700">
                                <FiCheckCircle /> Shortlist
                            </button>
                            <button onClick={() => handleStatusUpdate('Hired')} className="btn-primary flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 border-none text-white">
                                <FiCheckCircle /> Hired
                            </button>
                            <button onClick={() => handleStatusUpdate('Rejected')} className="btn-primary flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 border-none text-white">
                                <FiXCircle /> Reject
                            </button>
                        </div>
                    </div>

                    {/* Interview Schedule */}
                    <div className="glass p-6 rounded-2xl border border-white/5">
                        <h3 className="text-lg font-bold text-white mb-4">Schedule Interview</h3>
                        {application.interview ? (
                            <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/20">
                                <button disabled className="w-full bg-amber-500/20 text-amber-500 font-bold py-3 rounded-lg cursor-not-allowed mb-4">
                                    Interview Scheduled
                                </button>
                                <div className="space-y-2">
                                    <p className="text-sm text-muted"><span className="text-white font-medium">Date:</span> {new Date(application.interview.date).toLocaleDateString()}</p>
                                    <p className="text-sm text-muted"><span className="text-white font-medium">Time:</span> {application.interview.time}</p>
                                    <p className="text-sm text-muted"><span className="text-white font-medium">Mode:</span> {application.interview.mode}</p>
                                    {application.interview.mode === 'Online' && (
                                        <p className="text-sm text-muted truncate"><span className="text-white font-medium">Link:</span> <a href={application.interview.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{application.interview.link}</a></p>
                                    )}
                                    {application.interview.mode === 'Offline' && (
                                        <p className="text-sm text-muted"><span className="text-white font-medium">Location:</span> {application.interview.location}</p>
                                    )}
                                    {application.interview.notes && (
                                        <p className="text-sm text-muted border-t border-white/10 pt-2 mt-2"><span className="text-white font-medium">Internal Notes:</span> {application.interview.notes}</p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleScheduleInterview} className="space-y-4">
                                <div>
                                    <label className="text-xs text-muted mb-1 block">Date</label>
                                    <input type="date" required value={interviewData.date} onChange={e => setInterviewData({ ...interviewData, date: e.target.value })} className="input-field" />
                                </div>
                                <div>
                                    <label className="text-xs text-muted mb-1 block">Time</label>
                                    <input type="time" required value={interviewData.time} onChange={e => setInterviewData({ ...interviewData, time: e.target.value })} className="input-field" />
                                </div>
                                <div>
                                    <label className="text-xs text-muted mb-1 block">Mode</label>
                                    <select value={interviewData.mode} onChange={e => setInterviewData({ ...interviewData, mode: e.target.value })} className="input-field">
                                        <option value="Online">Online</option>
                                        <option value="Offline">Offline</option>
                                    </select>
                                </div>

                                {interviewData.mode === 'Online' ? (
                                    <div>
                                        <label className="text-xs text-muted mb-1 block">Meeting Link</label>
                                        <input type="url" required placeholder="https://meet.google.com/..." value={interviewData.link} onChange={e => setInterviewData({ ...interviewData, link: e.target.value })} className="input-field" />
                                    </div>
                                ) : (
                                    <div>
                                        <label className="text-xs text-muted mb-1 block">Location Address</label>
                                        <input type="text" required placeholder="Office/Building Address" value={interviewData.location} onChange={e => setInterviewData({ ...interviewData, location: e.target.value })} className="input-field" />
                                    </div>
                                )}

                                <div>
                                    <label className="text-xs text-muted mb-1 block">Internal Notes (Not visible to candidate)</label>
                                    <textarea rows="2" value={interviewData.notes} onChange={e => setInterviewData({ ...interviewData, notes: e.target.value })} className="input-field" placeholder="Notes for interviewers..."></textarea>
                                </div>

                                <button type="submit" className="btn-primary w-full">Confirm & Schedule</button>
                            </form>
                        )}
                    </div>

                    {/* Notes */}
                    <div className="glass p-6 rounded-2xl border border-white/5">
                        <h3 className="text-lg font-bold text-white mb-4">Recruiter Notes</h3>
                        <textarea
                            rows="4"
                            className="input-field mb-4"
                            placeholder="Add private notes..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        ></textarea>
                        <button onClick={handleAddNote} className="btn-secondary w-full flex items-center justify-center gap-2">
                            <FiMessageSquare /> Save Note
                        </button>
                    </div>
                </div>
            </div>

            {/* Hidden Node for PDF Generation */}
            <div id="recruit-resume-node" className="absolute left-[-9999px] top-0 bg-white text-black p-10 w-[800px] min-h-[1100px]">
                <header className="border-b-2 border-gray-800 pb-4 mb-6">
                    <h1 className="text-4xl font-bold uppercase mb-2 text-gray-900">{application.applicant?.name}</h1>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                        <span>{application.applicant?.email}</span> |
                        <span>{application.applicant?.phoneNumber || application.applicant?.profile?.phoneNumber}</span>
                    </div>
                </header>

                {application.applicant?.profile?.education?.length > 0 && (
                    <section className="mb-6">
                        <h2 className="text-xl font-bold uppercase mb-3 text-gray-800 border-b border-gray-300 pb-1">Education</h2>
                        {application.applicant.profile.education.map((edu, i) => (
                            <div key={i} className="mb-3">
                                <div className="flex justify-between font-bold text-gray-700">
                                    <span>{edu.institution}</span>
                                    <span>{edu.year}</span>
                                </div>
                                <p className="text-gray-600">{edu.degree} {edu.grade ? `- Grade: ${edu.grade}` : ''}</p>
                            </div>
                        ))}
                    </section>
                )}

                {application.applicant?.profile?.experience?.length > 0 && (
                    <section className="mb-6">
                        <h2 className="text-xl font-bold uppercase mb-3 text-gray-800 border-b border-gray-300 pb-1">Experience</h2>
                        {application.applicant.profile.experience.map((exp, i) => (
                            <div key={i} className="mb-4">
                                <div className="flex justify-between font-bold text-gray-700">
                                    <span>{exp.role}</span>
                                    <span>{exp.start} - {exp.end || 'Present'}</span>
                                </div>
                                <p className="italic text-gray-600 mb-1">{exp.company}</p>
                                <p className="text-gray-700 text-sm whitespace-pre-wrap">{exp.description}</p>
                            </div>
                        ))}
                    </section>
                )}

                {application.applicant?.profile?.skills?.length > 0 && (
                    <section className="mb-6">
                        <h2 className="text-xl font-bold uppercase mb-3 text-gray-800 border-b border-gray-300 pb-1">Skills</h2>
                        <div className="flex flex-wrap gap-2">
                            {application.applicant.profile.skills.map((skill, i) => (
                                <span key={i} className="bg-gray-200 px-2 py-1 rounded text-sm text-gray-800">{skill}</span>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default ApplicationDetails;
