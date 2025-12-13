import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiTrash2, FiSave, FiUser, FiBriefcase, FiBook, FiCode, FiFileText, FiDownload } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const ProfileBuilder = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [activeSection, setActiveSection] = useState('basic');
    const [message, setMessage] = useState(null);

    const [formData, setFormData] = useState({
        name: '', email: '', phoneNumber: '',
        about: '',
        social: { linkedin: '', github: '', portfolio: '' },
        skills: [],
        education: [],
        experience: [],
        projects: [],
        template: 'modern'
    });

    const [skillInput, setSkillInput] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phoneNumber: user.phoneNumber || '',
                about: user.profile?.about || '',
                social: user.profile?.social || { linkedin: '', github: '', portfolio: '' },
                skills: user.profile?.skills || [],
                education: user.profile?.education || [],
                experience: user.profile?.experience || [],
                projects: user.profile?.projects || [],
                template: 'modern'
            });
        }
    }, [user]);

    const generatePDF = async () => {
        if (!formData.name || !formData.email) {
            return alert("Please fill at least your Basic Information to generate a resume.");
        }

        const input = document.getElementById('resume-preview-node');
        if (!input) return;

        try {
            const canvas = await html2canvas(input, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${formData.name.replace(/\s+/g, '_')}_Resume.pdf`);
        } catch (err) {
            console.error("PDF generation failed", err);
            alert("Failed to generate PDF");
        }
    };

    const handleBasicChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSocialChange = (e) => setFormData({
        ...formData,
        social: { ...formData.social, [e.target.name]: e.target.value }
    });

    // Array Helpers
    const addItem = (field, template) => {
        setFormData({ ...formData, [field]: [...formData[field], template] });
    };

    const removeItem = (field, index) => {
        const newArray = formData[field].filter((_, i) => i !== index);
        setFormData({ ...formData, [field]: newArray });
    };

    const updateItem = (field, index, subField, value) => {
        const newArray = [...formData[field]];
        newArray[index] = { ...newArray[index], [subField]: value };
        setFormData({ ...formData, [field]: newArray });
    };

    // Skills
    const addSkill = (e) => {
        if (e.key === 'Enter' && skillInput) {
            e.preventDefault();
            if (!formData.skills.includes(skillInput)) {
                setFormData({ ...formData, skills: [...formData.skills, skillInput] });
            }
            setSkillInput('');
        }
    };
    const removeSkill = (skill) => {
        setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const payload = {
                name: formData.name,
                email: formData.email,
                phoneNumber: formData.phoneNumber,
                profile: {
                    about: formData.about,
                    social: formData.social,
                    skills: formData.skills,
                    education: formData.education,
                    experience: formData.experience,
                    projects: formData.projects
                }
            };
            await axios.put('https://jobportal-backend.vercel.app/api/auth/profile', payload, { withCredentials: true });
            setMessage({ type: 'success', text: 'Profile saved successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to save profile' });
        } finally {
            setLoading(false);
        }
    };

    const SectionBtn = ({ id, label, icon }) => (
        <button
            type="button"
            onClick={() => setActiveSection(id)}
            className={`w-full text-left px-6 py-4 flex items-center gap-3 transition-colors ${activeSection === id ? 'bg-primary/20 text-white border-r-2 border-primary' : 'text-muted hover:bg-white/5'
                }`}
        >
            {icon} {label}
        </button>
    );

    return (
        <div className="container mx-auto px-6 py-12 animate-fade-in-up">
            <h1 className="text-3xl font-bold text-white mb-8">Build Your Resume</h1>

            {message && (
                <div className={`p-4 rounded-xl mb-6 ${message.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Nav */}
                <div className="lg:w-1/4 glass h-fit rounded-2xl overflow-hidden border border-white/5">
                    <SectionBtn id="basic" label="Basic Info" icon={<FiUser />} />
                    <SectionBtn id="education" label="Education" icon={<FiBook />} />
                    <SectionBtn id="experience" label="Experience" icon={<FiBriefcase />} />
                    <SectionBtn id="projects" label="Projects" icon={<FiCode />} />
                </div>

                {/* Form Area */}
                <div className="lg:w-3/4 glass p-8 rounded-2xl border border-white/5 min-h-[500px]">

                    <SectionBtn id="projects" label="Projects" icon={<FiCode />} />
                    <SectionBtn id="templates" label="Resume Templates" icon={<FiFileText />} />
                </div>

                {/* Form Area */}
                <div className="lg:w-3/4 glass p-8 rounded-2xl border border-white/5 min-h-[500px]">

                    {/* Templates Section */}
                    {activeSection === 'templates' && (
                        <div className="animate-fade-in space-y-8">
                            <h2 className="text-2xl font-bold text-white mb-6">Choose Your Resume Style</h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { id: 'modern', name: 'Modern', color: 'bg-primary' },
                                    { id: 'traditional', name: 'Traditional', color: 'bg-gray-700' },
                                    { id: 'minimal', name: 'Minimal', color: 'bg-white' },
                                ].map(template => (
                                    <div key={template.id} className="cursor-pointer group">
                                        <div className={`h-64 rounded-xl border-2 ${formData.template === template.id ? 'border-primary' : 'border-white/10'} hover:border-primary transition overflow-hidden relative bg-white/5`}>
                                            <div className={`absolute top-0 left-0 w-full h-2 ${template.color}`}></div>
                                            <div className="p-4 space-y-2 opacity-50">
                                                <div className="h-2 w-1/2 bg-white/20 rounded"></div>
                                                <div className="h-2 w-3/4 bg-white/20 rounded"></div>
                                                <div className="h-20 w-full bg-white/10 rounded mt-4"></div>
                                            </div>
                                            {/* Preview Overlay */}
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                                <button onClick={() => setFormData({ ...formData, template: template.id })} className="btn-primary py-2 px-6">Select</button>
                                            </div>
                                        </div>
                                        <h3 className="text-center text-white mt-3 font-medium">{template.name}</h3>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-center mt-12 gap-4">
                                <button type="button" onClick={generatePDF} className="btn-secondary flex items-center gap-2">
                                    <FiDownload /> Download Resume (PDF)
                                </button>
                                <p className="text-muted text-sm mt-3 text-center w-full block">
                                    * Creates a PDf with your selected style.
                                </p>
                            </div>

                            {/* Hidden PDF Source Area */}
                            <div id="resume-preview-node" className="absolute left-[-9999px] top-0 bg-white text-black p-10 w-[800px] min-h-[1100px]">
                                <div className={`h-full ${formData.template === 'modern' ? 'font-sans' : formData.template === 'traditional' ? 'font-serif' : 'font-mono'}`}>
                                    <header className="border-b-2 border-gray-800 pb-4 mb-6">
                                        <h1 className="text-4xl font-bold uppercase mb-2 text-gray-900">{formData.name || 'Your Name'}</h1>
                                        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                                            <span>{formData.email}</span> |
                                            <span>{formData.phoneNumber}</span> |
                                            <span>{formData.social?.linkedin}</span>
                                        </div>
                                    </header>

                                    {formData.education?.length > 0 && (
                                        <section className="mb-6">
                                            <h2 className="text-xl font-bold uppercase mb-3 text-gray-800 border-b border-gray-300 pb-1">Education</h2>
                                            {formData.education.map((edu, i) => (
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

                                    {formData.experience?.length > 0 && (
                                        <section className="mb-6">
                                            <h2 className="text-xl font-bold uppercase mb-3 text-gray-800 border-b border-gray-300 pb-1">Experience</h2>
                                            {formData.experience.map((exp, i) => (
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

                                    {formData.projects?.length > 0 && (
                                        <section className="mb-6">
                                            <h2 className="text-xl font-bold uppercase mb-3 text-gray-800 border-b border-gray-300 pb-1">Projects</h2>
                                            {formData.projects.map((proj, i) => (
                                                <div key={i} className="mb-4">
                                                    <h3 className="font-bold text-gray-700">{proj.title}</h3>
                                                    <p className="text-gray-700 text-sm">{proj.description}</p>
                                                </div>
                                            ))}
                                        </section>
                                    )}

                                    {formData.skills?.length > 0 && (
                                        <section className="mb-6">
                                            <h2 className="text-xl font-bold uppercase mb-3 text-gray-800 border-b border-gray-300 pb-1">Skills</h2>
                                            <div className="flex flex-wrap gap-2">
                                                {formData.skills.map((skill, i) => (
                                                    <span key={i} className="bg-gray-200 px-2 py-1 rounded text-sm text-gray-800">{skill}</span>
                                                ))}
                                            </div>
                                        </section>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Basic Info */}
                    {activeSection === 'basic' && (
                        <div className="space-y-6 animate-fade-in">
                            <h2 className="text-xl font-bold text-white mb-4">Personal Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div><label className="label">Full Name</label><input name="name" value={formData.name} onChange={handleBasicChange} className="input-field" /></div>
                                <div><label className="label">Email</label><input name="email" value={formData.email} onChange={handleBasicChange} className="input-field" /></div>
                                <div><label className="label">Phone</label><input name="phoneNumber" value={formData.phoneNumber} onChange={handleBasicChange} className="input-field" /></div>
                                <div><label className="label">LinkedIn</label><input name="linkedin" value={formData.social.linkedin} onChange={handleSocialChange} className="input-field" /></div>
                                <div><label className="label">GitHub</label><input name="github" value={formData.social.github} onChange={handleSocialChange} className="input-field" /></div>
                                <div><label className="label">Portfolio</label><input name="portfolio" value={formData.social.portfolio} onChange={handleSocialChange} className="input-field" /></div>
                            </div>
                            <div>
                                <label className="label">About Me</label>
                                <textarea name="about" rows="4" value={formData.about} onChange={handleBasicChange} className="input-field" placeholder="Professional summary..." />
                            </div>
                            <div>
                                <label className="label">Skills (Press Enter to add)</label>
                                <input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={addSkill} className="input-field" placeholder="e.g. React, Node.js" />
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {formData.skills.map(skill => (
                                        <span key={skill} className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm flex items-center gap-2">
                                            {skill} <button type="button" onClick={() => removeSkill(skill)}><FiTrash2 size={14} /></button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Education */}
                    {activeSection === 'education' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-white">Education History</h2>
                                <button type="button" onClick={() => addItem('education', { degree: '', institution: '', year: '', grade: '' })} className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
                                    <FiPlus /> Add Education
                                </button>
                            </div>
                            {formData.education.map((edu, index) => (
                                <div key={index} className="bg-white/5 p-6 rounded-xl relative group">
                                    <button type="button" onClick={() => removeItem('education', index)} className="absolute top-4 right-4 text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition"><FiTrash2 /></button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div><label className="label">Degree</label><input value={edu.degree} onChange={e => updateItem('education', index, 'degree', e.target.value)} className="input-field" /></div>
                                        <div><label className="label">Institution</label><input value={edu.institution} onChange={e => updateItem('education', index, 'institution', e.target.value)} className="input-field" /></div>
                                        <div><label className="label">Year</label><input value={edu.year} onChange={e => updateItem('education', index, 'year', e.target.value)} className="input-field" /></div>
                                        <div><label className="label">Grade/CGPA</label><input value={edu.grade} onChange={e => updateItem('education', index, 'grade', e.target.value)} className="input-field" /></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Experience */}
                    {activeSection === 'experience' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-white">Work Experience</h2>
                                <button type="button" onClick={() => addItem('experience', { role: '', company: '', start: '', end: '', description: '' })} className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
                                    <FiPlus /> Add Experience
                                </button>
                            </div>
                            {formData.experience.map((exp, index) => (
                                <div key={index} className="bg-white/5 p-6 rounded-xl relative group">
                                    <button type="button" onClick={() => removeItem('experience', index)} className="absolute top-4 right-4 text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition"><FiTrash2 /></button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div><label className="label">Role</label><input value={exp.role} onChange={e => updateItem('experience', index, 'role', e.target.value)} className="input-field" /></div>
                                        <div><label className="label">Company</label><input value={exp.company} onChange={e => updateItem('experience', index, 'company', e.target.value)} className="input-field" /></div>
                                        <div><label className="label">Start Date</label><input type="date" value={exp.start} onChange={e => updateItem('experience', index, 'start', e.target.value)} className="input-field" /></div>
                                        <div><label className="label">End Date</label><input type="date" value={exp.end} onChange={e => updateItem('experience', index, 'end', e.target.value)} className="input-field" /></div>
                                        <div className="col-span-2"><label className="label">Description</label><textarea rows="3" value={exp.description} onChange={e => updateItem('experience', index, 'description', e.target.value)} className="input-field" /></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Projects */}
                    {activeSection === 'projects' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-white">Projects</h2>
                                <button type="button" onClick={() => addItem('projects', { title: '', technologies: '', description: '', link: '' })} className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
                                    <FiPlus /> Add Project
                                </button>
                            </div>
                            {formData.projects.map((proj, index) => (
                                <div key={index} className="bg-white/5 p-6 rounded-xl relative group">
                                    <button type="button" onClick={() => removeItem('projects', index)} className="absolute top-4 right-4 text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition"><FiTrash2 /></button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div><label className="label">Title</label><input value={proj.title} onChange={e => updateItem('projects', index, 'title', e.target.value)} className="input-field" /></div>
                                        <div><label className="label">Technologies</label><input value={proj.technologies} onChange={e => updateItem('projects', index, 'technologies', e.target.value)} className="input-field" /></div>
                                        <div className="col-span-2"><label className="label">Link</label><input value={proj.link} onChange={e => updateItem('projects', index, 'link', e.target.value)} className="input-field" /></div>
                                        <div className="col-span-2"><label className="label">Description</label><textarea rows="3" value={proj.description} onChange={e => updateItem('projects', index, 'description', e.target.value)} className="input-field" /></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Save Button */}
                    <div className="pt-8 border-t border-white/10 flex justify-end">
                        <button type="submit" disabled={loading} className="btn-primary py-3 px-8 flex items-center gap-2">
                            <FiSave /> {loading ? 'Saving...' : 'Save Profile'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ProfileBuilder;
