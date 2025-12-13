import React from 'react';

const ExecutiveTemplate = ({ resumeData, styles, theme, fontClass }) => {
    return (
        <div className={`p-12 bg-white text-gray-900 ${fontClass} min-h-[297mm]`}>
            {/* Header */}
            <header className="border-b-4 pb-6 mb-8 flex justify-between items-center" style={{ borderColor: theme.primary }}>
                <div className="flex-1">
                    <h1 className="text-5xl font-bold uppercase tracking-tight mb-2" style={{ color: theme.primary }}>{resumeData.name}</h1>
                    <div className="text-lg font-medium text-gray-600 flex flex-wrap gap-4 mt-2">
                        <span>{resumeData.phoneNumber}</span>
                        <span>|</span>
                        <span>{resumeData.email}</span>
                        {resumeData.social.linkedin && (
                            <>
                                <span>|</span>
                                <span>{resumeData.social.linkedin}</span>
                            </>
                        )}
                    </div>
                </div>
                {styles.showPhoto && resumeData.profileImage && (
                    <img src={resumeData.profileImage} alt={resumeData.name} className="w-32 h-32 rounded-lg object-cover shadow-lg border-2 ml-6" style={{ borderColor: theme.primary }} />
                )}
            </header>

            {/* Summary */}
            {styles.showSummary && resumeData.about && (
                <section className="mb-8">
                    <h2 className="text-xl font-bold uppercase mb-3 border-b pb-1" style={{ color: theme.primary, borderColor: theme.secondary }}>Executive Summary</h2>
                    <p className="text-gray-700 leading-relaxed text-justify">{resumeData.about}</p>
                </section>
            )}

            {/* Experience */}
            <section className="mb-8">
                <h2 className="text-xl font-bold uppercase mb-4 border-b pb-1" style={{ color: theme.primary, borderColor: theme.secondary }}>Professional Experience</h2>
                {resumeData.experience.map((exp, i) => (
                    <div key={i} className="mb-6">
                        <div className="flex justify-between items-baseline mb-1">
                            <h3 className="text-lg font-bold text-gray-800">{exp.role}</h3>
                            <span className="text-sm font-semibold text-gray-500">{exp.start} - {exp.end || 'Present'}</span>
                        </div>
                        <div className="text-md font-medium text-gray-600 mb-2">{exp.company}</div>
                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{exp.description}</p>
                    </div>
                ))}
            </section>

            {/* Skills & Education Grid */}
            <div className="grid grid-cols-2 gap-10">
                <div>
                    <section className="mb-8">
                        <h2 className="text-xl font-bold uppercase mb-4 border-b pb-1" style={{ color: theme.primary, borderColor: theme.secondary }}>Education</h2>
                        {resumeData.education.map((edu, i) => (
                            <div key={i} className="mb-4">
                                <h3 className="font-bold text-gray-800">{edu.institution}</h3>
                                <div className="text-sm text-gray-600">{edu.degree}</div>
                                <div className="text-sm text-gray-500 italic">{edu.year}</div>
                            </div>
                        ))}
                    </section>
                </div>
                <div>
                    <section className="mb-8">
                        <h2 className="text-xl font-bold uppercase mb-4 border-b pb-1" style={{ color: theme.primary, borderColor: theme.secondary }}>Core Competencies</h2>
                        <div className="flex flex-wrap gap-2">
                            {resumeData.skills.map((skill, i) => (
                                <span key={i} className="bg-gray-100 text-gray-800 px-3 py-1 rounded text-sm font-medium border" style={{ borderColor: theme.secondary }}>
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </section>
                </div>
            </div>

            {/* Projects */}
            {styles.showProjects && resumeData.projects.length > 0 && (
                <section className="mb-8">
                    <h2 className="text-xl font-bold uppercase mb-4 border-b pb-1" style={{ color: theme.primary, borderColor: theme.secondary }}>Key Projects</h2>
                    {resumeData.projects.map((proj, i) => (
                        <div key={i} className="mb-4">
                            <h3 className="font-bold text-gray-800">{proj.title}</h3>
                            <p className="text-sm text-gray-700 mb-1">{proj.description}</p>
                            <p className="text-xs text-gray-500">Technologies: {proj.technologies}</p>
                        </div>
                    ))}
                </section>
            )}

            {/* Certifications & Awards */}
            <div className="grid grid-cols-2 gap-10">
                {styles.showCertifications && resumeData.certifications.length > 0 && (
                    <section className="mb-8">
                        <h2 className="text-xl font-bold uppercase mb-4 border-b pb-1" style={{ color: theme.primary, borderColor: theme.secondary }}>Certifications</h2>
                        {resumeData.certifications.map((cert, i) => (
                            <div key={i} className="mb-2">
                                <div className="font-bold text-gray-800 text-sm">{cert.name}</div>
                                <div className="text-xs text-gray-500">{cert.organization} | {cert.year}</div>
                            </div>
                        ))}
                    </section>
                )}
                {styles.showAchievements && resumeData.achievements.length > 0 && (
                    <section className="mb-8">
                        <h2 className="text-xl font-bold uppercase mb-4 border-b pb-1" style={{ color: theme.primary, borderColor: theme.secondary }}>Achievements</h2>
                        {resumeData.achievements.map((ach, i) => (
                            <div key={i} className="mb-2">
                                <div className="font-bold text-gray-800 text-sm">{ach.title}</div>
                                <div className="text-xs text-gray-600">{ach.description}</div>
                            </div>
                        ))}
                    </section>
                )}
            </div>
        </div>
    );
};

export default ExecutiveTemplate;
