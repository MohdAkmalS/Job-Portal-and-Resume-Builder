import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FiSave, FiDownload, FiUser, FiBriefcase, FiBook, FiCode, FiLayers, FiType, FiLayout, FiCheck } from 'react-icons/fi';
import ExecutiveTemplate from '../../templates/ExecutiveTemplate';
import CreativeTemplate from '../../templates/CreativeTemplate';
import TechnicalTemplate from '../../templates/TechnicalTemplate';
import { useAuth } from '../../context/AuthContext';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const ResumeBuilder = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('editor'); // editor, preview
    const [activeSection, setActiveSection] = useState('basic');
    const resumeRef = useRef(null);

    // State for Resume Data
    const [resumeData, setResumeData] = useState({
        name: '', email: '', phoneNumber: '',
        about: '',
        profileImage: '',
        social: { linkedin: '', github: '', portfolio: '' },
        skills: [],
        education: [],
        experience: [],
        projects: [],
        certifications: [],
        publications: [],
        areasOfInterest: [],
        achievements: [],
        hobbies: []
    });

    // State for Styling & Preferences
    const [styles, setStyles] = useState({
        template: 'modern', // classic, modern, border, minimal, colored
        themeColor: 'blue', // blue, black, green, purple, beige
        font: 'Poppins', // Poppins, Roboto, Georgia, Playfair Display
        fontSize: 'medium',
        showPhoto: true,
        showSummary: true,
        showProjects: true,
        showCertifications: true,
        showPublications: true,
        showAchievements: true,
        showHobbies: true
    });

    const [skillInput, setSkillInput] = useState('');
    const [interestInput, setInterestInput] = useState('');
    const [hobbyInput, setHobbyInput] = useState('');

    // Load initial data
    // Load initial data
    useEffect(() => {
        if (user) {
            setResumeData(prev => ({
                ...prev,
                name: user.name || '',
                email: user.email || '',
                phoneNumber: user.phoneNumber || '',
                about: user.profile?.about || '',
                profileImage: user.profile?.profileImage || '',
                social: user.profile?.social || { linkedin: '', github: '', portfolio: '' },
                skills: user.profile?.skills || [],
                education: user.profile?.education || [],
                experience: user.profile?.experience || [],
                projects: user.profile?.projects || [],
                certifications: user.profile?.certifications || [],
                publications: user.profile?.publications || [],
                areasOfInterest: user.profile?.areasOfInterest || [],
                achievements: user.profile?.achievements || [],
                hobbies: user.profile?.hobbies || []
            }));

            if (user.profile?.resumePreferences) {
                const prefs = user.profile.resumePreferences;
                setStyles(prev => ({
                    ...prev,
                    template: prefs.template || 'modern',
                    themeColor: prefs.themeColor || 'blue',
                    font: prefs.font || 'Poppins',
                    showPhoto: prefs.sectionVisibility?.photo ?? true,
                    showSummary: prefs.sectionVisibility?.summary ?? true,
                    showProjects: prefs.sectionVisibility?.projects ?? true,
                    showCertifications: prefs.sectionVisibility?.certifications ?? true,
                    showPublications: prefs.sectionVisibility?.publications ?? true,
                    showAchievements: prefs.sectionVisibility?.achievements ?? true,
                    showHobbies: prefs.sectionVisibility?.hobbies ?? true
                }));
            }
        }
    }, [user]);

    // --- Actions ---

    const handleDataChange = (field, value) => {
        setResumeData({ ...resumeData, [field]: value });
    };

    const handleNestedChange = (parent, field, value) => {
        setResumeData({
            ...resumeData,
            [parent]: { ...resumeData[parent], [field]: value }
        });
    };

    // Array manipulation
    const handleArrayChange = (type, index, field, value) => {
        const newArr = [...resumeData[type]];
        newArr[index] = { ...newArr[index], [field]: value };
        setResumeData({ ...resumeData, [type]: newArr });
    };

    const addArrayItem = (type, template) => {
        setResumeData({ ...resumeData, [type]: [...resumeData[type], template] });
    };

    const removeArrayItem = (type, index) => {
        setResumeData({ ...resumeData, [type]: resumeData[type].filter((_, i) => i !== index) });
    };

    const addSkill = (e) => {
        if (e.key === 'Enter' && skillInput) {
            e.preventDefault();
            if (!resumeData.skills.includes(skillInput)) setResumeData({ ...resumeData, skills: [...resumeData.skills, skillInput] });
            setSkillInput('');
        }
    };

    const addInterest = (e) => {
        if (e.key === 'Enter' && interestInput) {
            e.preventDefault();
            if (!resumeData.areasOfInterest.includes(interestInput)) {
                setResumeData({ ...resumeData, areasOfInterest: [...resumeData.areasOfInterest, interestInput] });
            }
            setInterestInput('');
        }
    };

    const addHobby = (e) => {
        if (e.key === 'Enter' && hobbyInput) {
            e.preventDefault();
            if (!resumeData.hobbies.includes(hobbyInput)) {
                setResumeData({ ...resumeData, hobbies: [...resumeData.hobbies, hobbyInput] });
            }
            setHobbyInput('');
        }
    };

    // Handle image upload
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file (JPG, PNG, etc.)');
            return;
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('Image size should be less than 2MB');
            return;
        }

        // Convert to base64
        const reader = new FileReader();
        reader.onloadend = () => {
            setResumeData({ ...resumeData, profileImage: reader.result });
        };
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setResumeData({ ...resumeData, profileImage: '' });
    };

    // Save Preference
    const saveData = async () => {
        setLoading(true);
        try {
            // Update Profile Data
            const profilePayload = {
                name: resumeData.name,
                phoneNumber: resumeData.phoneNumber,
                profile: {
                    about: resumeData.about,
                    profileImage: resumeData.profileImage,
                    social: resumeData.social,
                    skills: resumeData.skills,
                    education: resumeData.education,
                    experience: resumeData.experience,
                    projects: resumeData.projects,
                    certifications: resumeData.certifications,
                    publications: resumeData.publications,
                    areasOfInterest: resumeData.areasOfInterest,
                    achievements: resumeData.achievements,
                    hobbies: resumeData.hobbies,
                    resumePreferences: {
                        template: styles.template,
                        themeColor: styles.themeColor,
                        font: styles.font,
                        fontSize: styles.fontSize,
                        sectionVisibility: {
                            photo: styles.showPhoto,
                            summary: styles.showSummary,
                            projects: styles.showProjects,
                            certifications: styles.showCertifications,
                            publications: styles.showPublications,
                            achievements: styles.showAchievements,
                            hobbies: styles.showHobbies
                        }
                    }
                }
            };

            const res = await axios.put('https://jobportal-backend.vercel.app/api/auth/update-profile', profilePayload, { withCredentials: true });
            if (res.data.success) {
                alert('Data saved successfully!');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to save data.');
        } finally {
            setLoading(false);
        }
    };

    const generatePDF = async () => {
        const input = resumeRef.current;
        if (!input) return;

        try {
            const canvas = await html2canvas(input, { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${resumeData.name.replace(/\s+/g, '_')}_Resume.pdf`);
        } catch (err) {
            console.error("PDF Failed", err);
            alert("Failed to generate PDF");
        }
    };

    // --- Styles Map ---
    const colors = {
        blue: { primary: '#2563eb', secondary: '#eff6ff', text: '#1e3a8a' },
        black: { primary: '#1f2937', secondary: '#f3f4f6', text: '#111827' },
        green: { primary: '#059669', secondary: '#ecfdf5', text: '#064e3b' },
        purple: { primary: '#7c3aed', secondary: '#f5f3ff', text: '#4c1d95' },
        beige: { primary: '#d97706', secondary: '#fffbeb', text: '#78350f' },
    };

    const fonts = {
        'Poppins': 'font-sans',
        'Roboto': 'font-mono', // Approximation for demo
        'Georgia': 'font-serif',
        'Playfair Display': 'font-serif' // Approximation
    };

    const currentTheme = colors[styles.themeColor];

    // --- Components ---

    // Render the Resume Preview based on Template
    const ResumePreview = () => {
        const theme = colors[styles.themeColor];
        const fontClass = fonts[styles.font];

        const Container = ({ children, className = "" }) => (
            <div className={`w-[210mm] min-h-[297mm] bg-white text-black p-8 shadow-2xl mx-auto ${fontClass} ${className}`} ref={resumeRef}>
                {children}
            </div>
        );

        let TemplateContent;

        // --- Template 1: Classic Corporate ---
        if (styles.template === 'classic') {
            TemplateContent = (
                <Container>
                    <header className="border-b-2 pb-4 mb-6" style={{ borderColor: theme.primary }}>
                        <h1 className="text-4xl font-bold uppercase tracking-widest" style={{ color: theme.primary }}>{resumeData.name}</h1>
                        <div className="flex flex-wrap gap-4 text-sm mt-2 text-gray-600">
                            {resumeData.phoneNumber && <span>{resumeData.phoneNumber}</span>}
                            {resumeData.email && <span>{resumeData.email}</span>}
                            {resumeData.social.linkedin && <span>{resumeData.social.linkedin}</span>}
                        </div>
                    </header>

                    {styles.showSummary && resumeData.about && (
                        <section className="mb-6">
                            <h2 className="text-lg font-bold uppercase mb-2" style={{ color: theme.primary }}>Professional Summary</h2>
                            <p className="text-sm leading-relaxed text-gray-700">{resumeData.about}</p>
                        </section>
                    )}

                    <section className="mb-6">
                        <h2 className="text-lg font-bold uppercase mb-2" style={{ color: theme.primary }}>Experience</h2>
                        {resumeData.experience.map((exp, i) => (
                            <div key={i} className="mb-4">
                                <div className="flex justify-between font-bold text-gray-800">
                                    <span>{exp.role}</span>
                                    <span className="text-sm">{exp.start} - {exp.end || 'Present'}</span>
                                </div>
                                <div className="text-sm italic mb-1" style={{ color: theme.text }}>{exp.company}</div>
                                <p className="text-sm text-gray-600 whitespace-pre-wrap">{exp.description}</p>
                            </div>
                        ))}
                    </section>

                    <section className="mb-6">
                        <h2 className="text-lg font-bold uppercase mb-2" style={{ color: theme.primary }}>Education</h2>
                        {resumeData.education.map((edu, i) => (
                            <div key={i} className="mb-2">
                                <div className="flex justify-between font-bold text-gray-800">
                                    <span>{edu.institution}</span>
                                    <span className="text-sm">{edu.year}</span>
                                </div>
                                <div className="text-sm">{edu.degree} {edu.grade && `| Grade: ${edu.grade}`}</div>
                            </div>
                        ))}
                    </section>

                    <section className="mb-6">
                        <h2 className="text-lg font-bold uppercase mb-2" style={{ color: theme.primary }}>Skills</h2>
                        <div className="flex flex-wrap gap-2">
                            {resumeData.skills.map((skill, i) => (
                                <span key={i} className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-700">{skill}</span>
                            ))}
                        </div>
                    </section>

                    {styles.showCertifications && resumeData.certifications.length > 0 && (
                        <section className="mb-6">
                            <h2 className="text-lg font-bold uppercase mb-2" style={{ color: theme.primary }}>Certifications</h2>
                            {resumeData.certifications.map((cert, i) => (
                                <div key={i} className="mb-2">
                                    <div className="font-bold text-gray-800">{cert.name}</div>
                                    <div className="text-sm">{cert.organization} | {cert.year}</div>
                                </div>
                            ))}
                        </section>
                    )}

                    {styles.showPublications && resumeData.publications.length > 0 && (
                        <section className="mb-6">
                            <h2 className="text-lg font-bold uppercase mb-2" style={{ color: theme.primary }}>Publications</h2>
                            {resumeData.publications.map((pub, i) => (
                                <div key={i} className="mb-3">
                                    <div className="font-bold text-gray-800">{pub.title}</div>
                                    <div className="text-sm text-gray-600">{pub.publisher} ({pub.year})</div>
                                    {pub.link && <a href={pub.link} className="text-xs text-blue-600">{pub.link}</a>}
                                </div>
                            ))}
                        </section>
                    )}

                    {styles.showAchievements && resumeData.achievements.length > 0 && (
                        <section className="mb-6">
                            <h2 className="text-lg font-bold uppercase mb-2" style={{ color: theme.primary }}>Achievements</h2>
                            {resumeData.achievements.map((ach, i) => (
                                <div key={i} className="mb-3">
                                    <div className="flex justify-between">
                                        <span className="font-bold text-gray-800">{ach.title}</span>
                                        <span className="text-sm text-gray-500">{ach.year}</span>
                                    </div>
                                    <p className="text-sm text-gray-600">{ach.description}</p>
                                </div>
                            ))}
                        </section>
                    )}

                    {resumeData.areasOfInterest.length > 0 && (
                        <section className="mb-6">
                            <h2 className="text-lg font-bold uppercase mb-2" style={{ color: theme.primary }}>Areas of Interest</h2>
                            <div className="flex flex-wrap gap-2">
                                {resumeData.areasOfInterest.map((interest, i) => (
                                    <span key={i} className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-700">{interest}</span>
                                ))}
                            </div>
                        </section>
                    )}

                    {styles.showHobbies && resumeData.hobbies.length > 0 && (
                        <section className="mb-6">
                            <h2 className="text-lg font-bold uppercase mb-2" style={{ color: theme.primary }}>Hobbies</h2>
                            <div className="flex flex-wrap gap-2">
                                {resumeData.hobbies.map((hobby, i) => (
                                    <span key={i} className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-700">{hobby}</span>
                                ))}
                            </div>
                        </section>
                    )}
                </Container>
            );
        }

        // --- Template 2: Modern Gradient (and default) ---
        else if (styles.template === 'modern') {
            TemplateContent = (
                <Container className="grid grid-cols-12 gap-0 p-0 overflow-hidden">
                    {/* Sidebar */}
                    <div className="col-span-4 p-8 text-white h-full min-h-[297mm]" style={{ backgroundColor: theme.primary }}>
                        <div className="mb-8 text-center">
                            {styles.showPhoto && (
                                resumeData.profileImage ? (
                                    <img src={resumeData.profileImage} alt={resumeData.name} className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-white/20" />
                                ) : (
                                    <div className="w-32 h-32 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl">
                                        {resumeData.name.charAt(0)}
                                    </div>
                                )
                            )}
                            <h2 className="text-lg font-bold border-b border-white/30 pb-2 mb-4">Contact</h2>
                            <ul className="text-sm space-y-3 opacity-90">
                                <li>{resumeData.phoneNumber}</li>
                                <li className="break-all">{resumeData.email}</li>
                                <li className="break-all">{resumeData.social.linkedin}</li>
                            </ul>
                        </div>

                        <div className="mb-8">
                            <h2 className="text-lg font-bold border-b border-white/30 pb-2 mb-4">Skills</h2>
                            <div className="flex flex-wrap gap-2">
                                {resumeData.skills.map((skill, i) => (
                                    <span key={i} className="px-2 py-1 bg-white/20 rounded text-xs">{skill}</span>
                                ))}
                            </div>
                        </div>

                        <div className="mb-8">
                            <h2 className="text-lg font-bold border-b border-white/30 pb-2 mb-4">Education</h2>
                            {resumeData.education.map((edu, i) => (
                                <div key={i} className="mb-4">
                                    <div className="font-bold">{edu.degree}</div>
                                    <div className="text-xs opacity-80">{edu.institution}</div>
                                    <div className="text-xs opacity-80">{edu.year}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="col-span-8 p-8 bg-white">
                        <h1 className="text-5xl font-bold uppercase mb-2" style={{ color: theme.primary }}>{resumeData.name}</h1>
                        <p className="text-xl tracking-widest uppercase text-gray-500 mb-8">Professional Profile</p>

                        {styles.showSummary && (
                            <div className="mb-8">
                                <h3 className="text-xl font-bold uppercase mb-4 border-b-2 pb-2" style={{ borderColor: theme.primary, color: theme.text }}>Profile</h3>
                                <p className="text-gray-600 leading-relaxed">{resumeData.about}</p>
                            </div>
                        )}

                        <div className="mb-8">
                            <h3 className="text-xl font-bold uppercase mb-4 border-b-2 pb-2" style={{ borderColor: theme.primary, color: theme.text }}>Experience</h3>
                            {resumeData.experience.map((exp, i) => (
                                <div key={i} className="mb-6 relative pl-4 border-l-2" style={{ borderColor: theme.secondary }}>
                                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full" style={{ backgroundColor: theme.primary }}></div>
                                    <h4 className="text-lg font-bold" style={{ color: theme.text }}>{exp.role}</h4>
                                    <div className="text-sm font-semibold text-gray-500 mb-2">{exp.company} | {exp.start} - {exp.end || 'Present'}</div>
                                    <p className="text-gray-600 text-sm">{exp.description}</p>
                                </div>
                            ))}
                        </div>

                        {styles.showProjects && resumeData.projects.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-xl font-bold uppercase mb-4 border-b-2 pb-2" style={{ borderColor: theme.primary, color: theme.text }}>Projects</h3>
                                {resumeData.projects.map((proj, i) => (
                                    <div key={i} className="mb-4">
                                        <div className="flex justify-between items-baseline">
                                            <h4 className="font-bold" style={{ color: theme.text }}>{proj.title}</h4>
                                            {proj.link && <span className="text-xs text-blue-500">{proj.link}</span>}
                                        </div>
                                        <p className="text-sm text-gray-600">{proj.description}</p>
                                        <p className="text-xs text-gray-400 mt-1">Tech: {proj.technologies}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {styles.showCertifications && resumeData.certifications.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-xl font-bold uppercase mb-4 border-b-2 pb-2" style={{ borderColor: theme.primary, color: theme.text }}>Certifications</h3>
                                {resumeData.certifications.map((cert, i) => (
                                    <div key={i} className="mb-3">
                                        <h4 className="font-bold text-gray-800">{cert.name}</h4>
                                        <div className="text-sm text-gray-500">{cert.organization} | {cert.year}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {styles.showPublications && resumeData.publications.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-xl font-bold uppercase mb-4 border-b-2 pb-2" style={{ borderColor: theme.primary, color: theme.text }}>Publications</h3>
                                {resumeData.publications.map((pub, i) => (
                                    <div key={i} className="mb-4">
                                        <h4 className="font-bold" style={{ color: theme.text }}>{pub.title}</h4>
                                        <div className="text-sm text-gray-500">{pub.publisher} ({pub.year})</div>
                                        {pub.link && <a href={pub.link} className="text-xs text-blue-500">{pub.link}</a>}
                                    </div>
                                ))}
                            </div>
                        )}

                        {styles.showAchievements && resumeData.achievements.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-xl font-bold uppercase mb-4 border-b-2 pb-2" style={{ borderColor: theme.primary, color: theme.text }}>Achievements</h3>
                                {resumeData.achievements.map((ach, i) => (
                                    <div key={i} className="mb-4">
                                        <div className="flex justify-between items-baseline">
                                            <h4 className="font-bold" style={{ color: theme.text }}>{ach.title}</h4>
                                            <span className="text-sm text-gray-500">{ach.year}</span>
                                        </div>
                                        <p className="text-sm text-gray-600">{ach.description}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {resumeData.areasOfInterest.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-xl font-bold uppercase mb-4 border-b-2 pb-2" style={{ borderColor: theme.primary, color: theme.text }}>Areas of Interest</h3>
                                <div className="flex flex-wrap gap-2">
                                    {resumeData.areasOfInterest.map((interest, i) => (
                                        <span key={i} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">{interest}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {styles.showHobbies && resumeData.hobbies.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-xl font-bold uppercase mb-4 border-b-2 pb-2" style={{ borderColor: theme.primary, color: theme.text }}>Hobbies</h3>
                                <div className="flex flex-wrap gap-2">
                                    {resumeData.hobbies.map((hobby, i) => (
                                        <span key={i} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">{hobby}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </Container>
            );
        }


        // --- Template 3: Colored Section ---
        else if (styles.template === 'colored') {
            TemplateContent = (
                <Container className="p-0">
                    <header className="p-10 text-center" style={{ backgroundColor: theme.secondary }}>
                        {styles.showPhoto && resumeData.profileImage && (
                            <img src={resumeData.profileImage} alt={resumeData.name} className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-white shadow-lg" />
                        )}
                        <h1 className="text-4xl font-bold mb-2" style={{ color: theme.primary }}>{resumeData.name}</h1>
                        <div className="flex justify-center gap-4 text-sm font-medium" style={{ color: theme.text }}>
                            <span>{resumeData.email}</span>
                            <span>{resumeData.phoneNumber}</span>
                            <span>{resumeData.social.linkedin}</span>
                        </div>
                    </header>
                    <div className="p-10">
                        {styles.showSummary && <p className="mb-8 text-center italic text-gray-600 max-w-2xl mx-auto">{resumeData.about}</p>}

                        <div className="grid grid-cols-2 gap-10">
                            <div>
                                <h3 className="text-lg font-bold uppercase mb-4 border-b pb-2" style={{ borderColor: theme.primary, color: theme.primary }}>Experience</h3>
                                {resumeData.experience.map((exp, i) => (
                                    <div key={i} className="mb-6">
                                        <h4 className="font-bold text-gray-800">{exp.role}</h4>
                                        <div className="text-sm text-gray-500">{exp.company} ({exp.start}-{exp.end || 'Present'})</div>
                                        <p className="text-sm mt-2 text-gray-600">{exp.description}</p>
                                    </div>
                                ))}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold uppercase mb-4 border-b pb-2" style={{ borderColor: theme.primary, color: theme.primary }}>Education & Skills</h3>
                                {resumeData.education.map((edu, i) => (
                                    <div key={i} className="mb-4">
                                        <div className="font-bold text-gray-800">{edu.degree}</div>
                                        <div className="text-sm text-gray-500">{edu.institution}, {edu.year}</div>
                                    </div>
                                ))}

                                <h4 className="font-bold mt-6 mb-2 text-gray-800">Skills</h4>
                                <div className="flex flex-wrap gap-2">
                                    {resumeData.skills.map((skill, i) => (
                                        <span key={i} className="text-sm border rounded px-2 py-1" style={{ borderColor: theme.primary, color: theme.text }}>{skill}</span>
                                    ))}
                                </div>
                            </div>

                            {/* New Sections */}
                            <div>
                                {styles.showCertifications && resumeData.certifications.length > 0 && (
                                    <>
                                        <h3 className="text-lg font-bold uppercase mb-4 border-b pb-2 mt-6" style={{ borderColor: theme.primary, color: theme.primary }}>Certifications</h3>
                                        {resumeData.certifications.map((cert, i) => (
                                            <div key={i} className="mb-3">
                                                <div className="font-bold text-gray-800">{cert.name}</div>
                                                <div className="text-sm text-gray-500">{cert.organization} ({cert.year})</div>
                                            </div>
                                        ))}
                                    </>
                                )}

                                {styles.showPublications && resumeData.publications.length > 0 && (
                                    <>
                                        <h3 className="text-lg font-bold uppercase mb-4 border-b pb-2 mt-6" style={{ borderColor: theme.primary, color: theme.primary }}>Publications</h3>
                                        {resumeData.publications.map((pub, i) => (
                                            <div key={i} className="mb-3">
                                                <div className="font-bold text-gray-800">{pub.title}</div>
                                                <div className="text-sm text-gray-500">{pub.publisher} ({pub.year})</div>
                                            </div>
                                        ))}
                                    </>
                                )}

                                {styles.showAchievements && resumeData.achievements.length > 0 && (
                                    <>
                                        <h3 className="text-lg font-bold uppercase mb-4 border-b pb-2 mt-6" style={{ borderColor: theme.primary, color: theme.primary }}>Achievements</h3>
                                        {resumeData.achievements.map((ach, i) => (
                                            <div key={i} className="mb-3">
                                                <div className="flex justify-between">
                                                    <span className="font-bold text-gray-800">{ach.title}</span>
                                                    <span className="text-sm text-gray-500">{ach.year}</span>
                                                </div>
                                                <p className="text-sm text-gray-600">{ach.description}</p>
                                            </div>
                                        ))}
                                    </>
                                )}

                                {resumeData.areasOfInterest.length > 0 && (
                                    <>
                                        <h3 className="text-lg font-bold uppercase mb-4 border-b pb-2 mt-6" style={{ borderColor: theme.primary, color: theme.primary }}>Areas of Interest</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {resumeData.areasOfInterest.map((interest, i) => (
                                                <span key={i} className="text-sm border rounded px-2 py-1" style={{ borderColor: theme.primary, color: theme.text }}>{interest}</span>
                                            ))}
                                        </div>
                                    </>
                                )}

                                {styles.showHobbies && resumeData.hobbies.length > 0 && (
                                    <>
                                        <h3 className="text-lg font-bold uppercase mb-4 border-b pb-2 mt-6" style={{ borderColor: theme.primary, color: theme.primary }}>Hobbies</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {resumeData.hobbies.map((hobby, i) => (
                                                <span key={i} className="text-sm border rounded px-2 py-1" style={{ borderColor: theme.primary, color: theme.text }}>{hobby}</span>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </Container>
            );
        }
        // --- Template 4: Minimal ---
        else if (styles.template === 'minimal') {
            TemplateContent = (
                <Container>
                    <div className={`max-w-3xl mx-auto py-12 px-8 ${fontClass}`}>
                        <header className="text-center mb-10">
                            {styles.showPhoto && resumeData.profileImage && (
                                <img src={resumeData.profileImage} alt={resumeData.name} className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border border-gray-200" />
                            )}
                            <h1 className="text-3xl uppercase tracking-widest mb-3 font-light text-gray-900">{resumeData.name}</h1>
                            <div className="flex justify-center flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500 tracking-wide">
                                <span>{resumeData.phoneNumber}</span>
                                <span>{resumeData.email}</span>
                                {resumeData.social.linkedin && <span>{resumeData.social.linkedin}</span>}
                                {resumeData.social.portfolio && <span>{resumeData.social.portfolio}</span>}
                            </div>
                        </header>

                        <hr className="border-gray-200 mb-10" />

                        {styles.showSummary && resumeData.about && (
                            <section className="mb-10 text-center">
                                <p className="text-gray-600 leading-7 max-w-2xl mx-auto">{resumeData.about}</p>
                            </section>
                        )}

                        <section className="mb-10 text-center">
                            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-6">Skills</h2>
                            <div className="flex flex-wrap justify-center gap-2">
                                {resumeData.skills.map((skill, i) => (
                                    <span key={i} className="text-sm border border-gray-200 rounded px-3 py-1 text-gray-600">{skill}</span>
                                ))}
                            </div>
                        </section>

                        <section className="mb-10">
                            <div className="flex items-center mb-8">
                                <div className="flex-1 border-t border-gray-100"></div>
                                <h2 className="px-4 text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Experience</h2>
                                <div className="flex-1 border-t border-gray-100"></div>
                            </div>
                            {resumeData.experience.map((exp, i) => (
                                <div key={i} className="mb-8 last:mb-0">
                                    <div className="text-center mb-2">
                                        <h3 className="text-lg font-medium text-gray-800">{exp.role}</h3>
                                        <div className="text-sm text-gray-500 uppercase tracking-wider mb-1 mt-1">{exp.company}</div>
                                        <div className="text-xs text-gray-400">{exp.start} — {exp.end || 'Present'}</div>
                                    </div>
                                    <p className="text-gray-600 text-sm leading-relaxed text-center max-w-2xl mx-auto">{exp.description}</p>
                                </div>
                            ))}
                        </section>

                        {styles.showProjects && resumeData.projects.length > 0 && (
                            <section className="mb-10">
                                <div className="flex items-center mb-8">
                                    <div className="flex-1 border-t border-gray-100"></div>
                                    <h2 className="px-4 text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Projects</h2>
                                    <div className="flex-1 border-t border-gray-100"></div>
                                </div>
                                <div className="grid grid-cols-1 gap-6">
                                    {resumeData.projects.map((proj, i) => (
                                        <div key={i} className="text-center">
                                            <h3 className="font-medium text-gray-800">{proj.title}</h3>
                                            <p className="text-sm text-gray-600 mt-1 mb-2 max-w-2xl mx-auto">{proj.description}</p>
                                            <div className="text-xs text-gray-400 font-mono">{proj.technologies}</div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        <section>
                            <div className="flex items-center mb-8">
                                <div className="flex-1 border-t border-gray-100"></div>
                                <h2 className="px-4 text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Education</h2>
                                <div className="flex-1 border-t border-gray-100"></div>
                            </div>
                            {resumeData.education.map((edu, i) => (
                                <div key={i} className="text-center mb-4 last:mb-0">
                                    <h3 className="font-medium text-gray-800">{edu.institution}</h3>
                                    <div className="text-sm text-gray-600">{edu.degree}</div>
                                    <div className="text-xs text-gray-400 mt-1">{edu.year}</div>
                                </div>
                            ))}
                        </section>
                    </div>
                </Container>
            );
        }
        // New templates
        else if (styles.template === 'executive') {
            TemplateContent = <ExecutiveTemplate resumeData={resumeData} styles={styles} theme={theme} fontClass={fontClass} />;
        } else if (styles.template === 'creative') {
            TemplateContent = <CreativeTemplate resumeData={resumeData} styles={styles} theme={theme} fontClass={fontClass} />;
        } else if (styles.template === 'technical') {
            TemplateContent = <TechnicalTemplate resumeData={resumeData} styles={styles} theme={theme} fontClass={fontClass} />;
        } else {
            // Fallback to a default message if no template matches
            TemplateContent = (
                <Container className="grid grid-cols-12 gap-0 p-0 overflow-hidden">
                    <div className="col-span-12 p-10 flex items-center justify-center">
                        <p className="text-gray-500">Select a template to generate resume.</p>
                    </div>
                </Container>
            );
        }

        return <>{TemplateContent}</>;
    };


    return (
        <div className="container mx-auto px-6 py-8 animate-fade-in-up h-[calc(100vh-80px)] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2"><FiLayers /> Advanced Resume Builder</h1>
                <div className="flex gap-4">
                    <button onClick={saveData} className="btn-secondary flex items-center gap-2 py-2 px-4 shadow-none border border-white/10 hover:bg-white/5 bg-transparent">
                        <FiSave /> Save Data
                    </button>
                    <button onClick={generatePDF} className="btn-primary flex items-center gap-2 py-2 px-6">
                        <FiDownload /> Download PDF
                    </button>
                </div>
            </div>

            <div className="flex-1 flex gap-6 overflow-hidden">
                {/* Editor Panel */}
                <div className="w-1/3 flex flex-col glass rounded-2xl border border-white/5 overflow-hidden">
                    {/* Tabs */}
                    <div className="flex border-b border-white/10">
                        <button onClick={() => setActiveTab('editor')} className={`flex-1 py-4 text-sm font-bold ${activeTab === 'editor' ? 'text-primary bg-primary/10 border-b-2 border-primary' : 'text-muted hover:text-white'}`}>Content</button>
                        <button onClick={() => setActiveTab('style')} className={`flex-1 py-4 text-sm font-bold ${activeTab === 'style' ? 'text-primary bg-primary/10 border-b-2 border-primary' : 'text-muted hover:text-white'}`}>Design</button>
                    </div>

                    <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                        {activeTab === 'editor' ? (
                            <div className="space-y-6">
                                {/* Basic Info */}
                                <div className="space-y-4">
                                    <h3 className="text-white font-bold flex items-center gap-2"><FiUser /> Personal Info</h3>
                                    <input className="input-field" placeholder="Full Name" value={resumeData.name} onChange={e => handleDataChange('name', e.target.value)} />
                                    <input className="input-field" placeholder="Email" value={resumeData.email} onChange={e => handleDataChange('email', e.target.value)} />
                                    <input className="input-field" placeholder="Phone" value={resumeData.phoneNumber} onChange={e => handleDataChange('phoneNumber', e.target.value)} />
                                    <input className="input-field" placeholder="LinkedIn" value={resumeData.social.linkedin} onChange={e => handleNestedChange('social', 'linkedin', e.target.value)} />
                                    <textarea className="input-field" placeholder="Professional Summary" rows="3" value={resumeData.about} onChange={e => handleDataChange('about', e.target.value)} />
                                    <input type="file" accept="image/*" className="input-field" onChange={handleImageUpload} />
                                    {resumeData.profileImage && (
                                        <div className="mt-2 flex items-center gap-2">
                                            <img src={resumeData.profileImage} alt="Profile" className="w-16 h-16 rounded-full object-cover" />
                                            <button type="button" className="text-red-400 text-sm" onClick={removeImage}>Remove Photo</button>
                                        </div>
                                    )}
                                </div>

                                {/* Experience */}
                                <div className="space-y-4 pt-4 border-t border-white/10">
                                    <h3 className="text-white font-bold flex items-center gap-2"><FiBriefcase /> Experience</h3>
                                    {resumeData.experience.map((exp, i) => (
                                        <div key={i} className="bg-white/5 p-4 rounded-xl space-y-2 relative group">
                                            <button onClick={() => removeArrayItem('experience', i)} className="text-red-400 absolute top-2 right-2 text-xs opacity-0 group-hover:opacity-100">Remove</button>
                                            <input className="input-field text-sm" placeholder="Role" value={exp.role} onChange={e => handleArrayChange('experience', i, 'role', e.target.value)} />
                                            <input className="input-field text-sm" placeholder="Company" value={exp.company} onChange={e => handleArrayChange('experience', i, 'company', e.target.value)} />
                                            <div className="flex gap-2">
                                                <input className="input-field text-sm" placeholder="Start" value={exp.start} onChange={e => handleArrayChange('experience', i, 'start', e.target.value)} />
                                                <input className="input-field text-sm" placeholder="End" value={exp.end} onChange={e => handleArrayChange('experience', i, 'end', e.target.value)} />
                                            </div>
                                            <textarea className="input-field text-sm" placeholder="Description" rows="2" value={exp.description} onChange={e => handleArrayChange('experience', i, 'description', e.target.value)} />
                                        </div>
                                    ))}
                                    <button onClick={() => addArrayItem('experience', { role: '', company: '', start: '', end: '', description: '' })} className="text-xs text-primary font-bold hover:underline">+ Add Experience</button>
                                </div>

                                {/* Skills */}
                                <div className="space-y-4 pt-4 border-t border-white/10">
                                    <h3 className="text-white font-bold flex items-center gap-2"><FiCode /> Skills</h3>
                                    <input className="input-field" placeholder="Type skill and press Enter" value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={addSkill} />
                                    <div className="flex flex-wrap gap-2">
                                        {resumeData.skills.map((skill, i) => (
                                            <span key={i} className="px-2 py-1 bg-white/10 rounded-full text-xs text-white flex items-center gap-1">
                                                {skill} <button onClick={() => setResumeData({ ...resumeData, skills: resumeData.skills.filter(s => s !== skill) })} className="hover:text-red-400">×</button>
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Education */}
                                <div className="space-y-4 pt-4 border-t border-white/10">
                                    <h3 className="text-white font-bold flex items-center gap-2"><FiBook /> Education</h3>
                                    {resumeData.education.map((edu, i) => (
                                        <div key={i} className="bg-white/5 p-4 rounded-xl space-y-2 relative group">
                                            <button onClick={() => removeArrayItem('education', i)} className="text-red-400 absolute top-2 right-2 text-xs opacity-0 group-hover:opacity-100">Remove</button>
                                            <input className="input-field text-sm" placeholder="Degree" value={edu.degree} onChange={e => handleArrayChange('education', i, 'degree', e.target.value)} />
                                            <input className="input-field text-sm" placeholder="Institution" value={edu.institution} onChange={e => handleArrayChange('education', i, 'institution', e.target.value)} />
                                            <div className="flex gap-2">
                                                <input className="input-field text-sm" placeholder="Year" value={edu.year} onChange={e => handleArrayChange('education', i, 'year', e.target.value)} />
                                                <input className="input-field text-sm" placeholder="Grade (optional)" value={edu.grade} onChange={e => handleArrayChange('education', i, 'grade', e.target.value)} />
                                            </div>
                                        </div>
                                    ))}
                                    <button onClick={() => addArrayItem('education', { degree: '', institution: '', year: '', grade: '' })} className="text-xs text-primary font-bold hover:underline">+ Add Education</button>
                                </div>

                                {/* Certifications */}
                                <div className="space-y-4 pt-4 border-t border-white/10">
                                    <h3 className="text-white font-bold flex items-center gap-2"><FiCheck /> Certifications</h3>
                                    {resumeData.certifications.map((cert, i) => (
                                        <div key={i} className="bg-white/5 p-4 rounded-xl space-y-2 relative group">
                                            <button onClick={() => removeArrayItem('certifications', i)} className="text-red-400 absolute top-2 right-2 text-xs opacity-0 group-hover:opacity-100">Remove</button>
                                            <input className="input-field text-sm" placeholder="Certification Name" value={cert.name} onChange={e => handleArrayChange('certifications', i, 'name', e.target.value)} />
                                            <input className="input-field text-sm" placeholder="Organization" value={cert.organization} onChange={e => handleArrayChange('certifications', i, 'organization', e.target.value)} />
                                            <input className="input-field text-sm" placeholder="Year" value={cert.year} onChange={e => handleArrayChange('certifications', i, 'year', e.target.value)} />
                                        </div>
                                    ))}
                                    <button onClick={() => addArrayItem('certifications', { name: '', organization: '', year: '' })} className="text-xs text-primary font-bold hover:underline">+ Add Certification</button>
                                </div>

                                {/* Publications */}
                                <div className="space-y-4 pt-4 border-t border-white/10">
                                    <h3 className="text-white font-bold flex items-center gap-2"><FiBook /> Publications</h3>
                                    {resumeData.publications.map((pub, i) => (
                                        <div key={i} className="bg-white/5 p-4 rounded-xl space-y-2 relative group">
                                            <button onClick={() => removeArrayItem('publications', i)} className="text-red-400 absolute top-2 right-2 text-xs opacity-0 group-hover:opacity-100">Remove</button>
                                            <input className="input-field text-sm" placeholder="Title" value={pub.title} onChange={e => handleArrayChange('publications', i, 'title', e.target.value)} />
                                            <input className="input-field text-sm" placeholder="Publisher" value={pub.publisher} onChange={e => handleArrayChange('publications', i, 'publisher', e.target.value)} />
                                            <div className="flex gap-2">
                                                <input className="input-field text-sm" placeholder="Year" value={pub.year} onChange={e => handleArrayChange('publications', i, 'year', e.target.value)} />
                                                <input className="input-field text-sm" placeholder="Link (optional)" value={pub.link} onChange={e => handleArrayChange('publications', i, 'link', e.target.value)} />
                                            </div>
                                        </div>
                                    ))}
                                    <button onClick={() => addArrayItem('publications', { title: '', publisher: '', year: '', link: '' })} className="text-xs text-primary font-bold hover:underline">+ Add Publication</button>
                                </div>

                                {/* Achievements */}
                                <div className="space-y-4 pt-4 border-t border-white/10">
                                    <h3 className="text-white font-bold flex items-center gap-2"><FiCheck /> Achievements</h3>
                                    {resumeData.achievements.map((ach, i) => (
                                        <div key={i} className="bg-white/5 p-4 rounded-xl space-y-2 relative group">
                                            <button onClick={() => removeArrayItem('achievements', i)} className="text-red-400 absolute top-2 right-2 text-xs opacity-0 group-hover:opacity-100">Remove</button>
                                            <input className="input-field text-sm" placeholder="Achievement Title" value={ach.title} onChange={e => handleArrayChange('achievements', i, 'title', e.target.value)} />
                                            <input className="input-field text-sm" placeholder="Year" value={ach.year} onChange={e => handleArrayChange('achievements', i, 'year', e.target.value)} />
                                            <textarea className="input-field text-sm" placeholder="Description" rows="2" value={ach.description} onChange={e => handleArrayChange('achievements', i, 'description', e.target.value)} />
                                        </div>
                                    ))}
                                    <button onClick={() => addArrayItem('achievements', { title: '', description: '', year: '' })} className="text-xs text-primary font-bold hover:underline">+ Add Achievement</button>
                                </div>

                                {/* Projects */}
                                <div className="space-y-4 pt-4 border-t border-white/10">
                                    <h3 className="text-white font-bold flex items-center gap-2"><FiLayers /> Projects</h3>
                                    {resumeData.projects.map((proj, i) => (
                                        <div key={i} className="bg-white/5 p-4 rounded-xl space-y-2 relative group">
                                            <button onClick={() => removeArrayItem('projects', i)} className="text-red-400 absolute top-2 right-2 text-xs opacity-0 group-hover:opacity-100">Remove</button>
                                            <input className="input-field text-sm" placeholder="Project Title" value={proj.title} onChange={e => handleArrayChange('projects', i, 'title', e.target.value)} />
                                            <textarea className="input-field text-sm" placeholder="Description" rows="2" value={proj.description} onChange={e => handleArrayChange('projects', i, 'description', e.target.value)} />
                                            <input className="input-field text-sm" placeholder="Technologies (e.g., React, Node.js)" value={proj.technologies} onChange={e => handleArrayChange('projects', i, 'technologies', e.target.value)} />
                                            <input className="input-field text-sm" placeholder="Project Link (optional)" value={proj.link} onChange={e => handleArrayChange('projects', i, 'link', e.target.value)} />
                                        </div>
                                    ))}
                                    <button onClick={() => addArrayItem('projects', { title: '', description: '', technologies: '', link: '' })} className="text-xs text-primary font-bold hover:underline">+ Add Project</button>
                                </div>

                                {/* Areas of Interest */}
                                <div className="space-y-4 pt-4 border-t border-white/10">
                                    <h3 className="text-white font-bold flex items-center gap-2"><FiLayers /> Areas of Interest</h3>
                                    <input className="input-field" placeholder="Type interest and press Enter" value={interestInput} onChange={e => setInterestInput(e.target.value)} onKeyDown={addInterest} />
                                    <div className="flex flex-wrap gap-2">
                                        {resumeData.areasOfInterest.map((interest, i) => (
                                            <span key={i} className="px-2 py-1 bg-white/10 rounded-full text-xs text-white flex items-center gap-1">
                                                {interest} <button onClick={() => setResumeData({ ...resumeData, areasOfInterest: resumeData.areasOfInterest.filter(int => int !== interest) })} className="hover:text-red-400">×</button>
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Hobbies */}
                                <div className="space-y-4 pt-4 border-t border-white/10">
                                    <h3 className="text-white font-bold flex items-center gap-2"><FiUser /> Hobbies</h3>
                                    <input className="input-field" placeholder="Type hobby and press Enter" value={hobbyInput} onChange={e => setHobbyInput(e.target.value)} onKeyDown={addHobby} />
                                    <div className="flex flex-wrap gap-2">
                                        {resumeData.hobbies.map((hobby, i) => (
                                            <span key={i} className="px-2 py-1 bg-white/10 rounded-full text-xs text-white flex items-center gap-1">
                                                {hobby} <button onClick={() => setResumeData({ ...resumeData, hobbies: resumeData.hobbies.filter(h => h !== hobby) })} className="hover:text-red-400">×</button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-white font-bold mb-4 flex items-center gap-2"><FiLayout /> Templates</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {['modern', 'classic', 'colored', 'minimal', 'executive', 'creative', 'technical'].map(t => (
                                            <div key={t} onClick={() => setStyles({ ...styles, template: t })}
                                                className={`cursor-pointer p-3 rounded-xl border ${styles.template === t ? 'border-primary bg-primary/20' : 'border-white/10 bg-white/5'} hover:border-primary/50 text-center capitalize text-sm text-white`}>
                                                {t}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-white font-bold mb-4 flex items-center gap-2"><FiLayers /> Color Theme</h3>
                                    <div className="flex gap-3">
                                        {Object.keys(colors).map(c => (
                                            <button key={c} onClick={() => setStyles({ ...styles, themeColor: c })}
                                                className={`w-8 h-8 rounded-full border-2 ${styles.themeColor === c ? 'border-white scale-110' : 'border-transparent opacity-70'} transition`}
                                                style={{ backgroundColor: colors[c].primary }} />
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-white font-bold mb-4 flex items-center gap-2"><FiType /> Typography</h3>
                                    <select value={styles.font} onChange={e => setStyles({ ...styles, font: e.target.value })} className="input-field">
                                        {Object.keys(fonts).map(f => <option key={f} value={f}>{f}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <h3 className="text-white font-bold mb-4">Section Visibility</h3>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-3 text-sm text-muted cursor-pointer">
                                            <input type="checkbox" checked={styles.showPhoto} onChange={e => setStyles({ ...styles, showPhoto: e.target.checked })} /> Show Photo
                                        </label>
                                        <label className="flex items-center gap-3 text-sm text-muted cursor-pointer">
                                            <input type="checkbox" checked={styles.showSummary} onChange={e => setStyles({ ...styles, showSummary: e.target.checked })} /> Show Summary
                                        </label>
                                        <label className="flex items-center gap-3 text-sm text-muted cursor-pointer">
                                            <input type="checkbox" checked={styles.showProjects} onChange={e => setStyles({ ...styles, showProjects: e.target.checked })} /> Show Projects
                                        </label>
                                        <label className="flex items-center gap-3 text-sm text-muted cursor-pointer">
                                            <input type="checkbox" checked={styles.showCertifications} onChange={e => setStyles({ ...styles, showCertifications: e.target.checked })} /> Show Certifications
                                        </label>
                                        <label className="flex items-center gap-3 text-sm text-muted cursor-pointer">
                                            <input type="checkbox" checked={styles.showPublications} onChange={e => setStyles({ ...styles, showPublications: e.target.checked })} /> Show Publications
                                        </label>
                                        <label className="flex items-center gap-3 text-sm text-muted cursor-pointer">
                                            <input type="checkbox" checked={styles.showAchievements} onChange={e => setStyles({ ...styles, showAchievements: e.target.checked })} /> Show Achievements
                                        </label>
                                        <label className="flex items-center gap-3 text-sm text-muted cursor-pointer">
                                            <input type="checkbox" checked={styles.showHobbies} onChange={e => setStyles({ ...styles, showHobbies: e.target.checked })} /> Show Hobbies
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Preview Panel */}
                <div className="flex-2 bg-gray-900/50 rounded-2xl border border-white/5 p-8 flex justify-center items-start overflow-y-auto backdrop-blur-sm">
                    <div className="origin-top scale-[0.6] sm:scale-[0.7] md:scale-[0.65] lg:scale-[0.85] transition-transform duration-300">
                        <ResumePreview />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResumeBuilder;
