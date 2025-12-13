import React from 'react';

const CreativeTemplate = ({ resumeData, styles, theme, fontClass }) => {
    return (
        <div className={`flex min-h-[297mm] bg-white text-gray-800 ${fontClass}`}>
            {/* Left Sidebar */}
            <div className="w-1/3 p-8 text-white flex flex-col justify-between" style={{ backgroundColor: theme.primary }}>
                <div>
                    {styles.showPhoto && resumeData.profileImage && (
                        <img src={resumeData.profileImage} alt={resumeData.name} className="w-40 h-40 rounded-full mx-auto mb-6 object-cover border-4 border-white/30" />
                    )}
                    <h1 className="text-3xl font-bold mb-2 text-center leading-tight">{resumeData.name}</h1>
                    <div className="text-center text-white/80 text-sm mb-8">Professional Profile</div>

                    <div className="mb-8">
                        <h3 className="uppercase tracking-widest text-xs font-bold border-b border-white/20 pb-2 mb-4">Contact</h3>
                        <div className="text-sm space-y-2 text-white/90 break-words">
                            <div>{resumeData.phoneNumber}</div>
                            <div>{resumeData.email}</div>
                            <div>{resumeData.social.linkedin}</div>
                            <div>{resumeData.social.portfolio}</div>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h3 className="uppercase tracking-widest text-xs font-bold border-b border-white/20 pb-2 mb-4">Skills</h3>
                        <div className="flex flex-wrap gap-2">
                            {resumeData.skills.map((skill, i) => (
                                <span key={i} className="px-2 py-1 bg-white/20 rounded text-xs">{skill}</span>
                            ))}
                        </div>
                    </div>

                    {resumeData.areasOfInterest.length > 0 && (
                        <div className="mb-8">
                            <h3 className="uppercase tracking-widest text-xs font-bold border-b border-white/20 pb-2 mb-4">Interests</h3>
                            <ul className="text-sm space-y-1 text-white/90">
                                {resumeData.areasOfInterest.map((interest, i) => (
                                    <li key={i}>• {interest}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Content */}
            <div className="w-2/3 p-10 bg-gray-50">
                {styles.showSummary && resumeData.about && (
                    <section className="mb-8 p-6 bg-white shadow-sm rounded-lg border-l-4" style={{ borderColor: theme.primary }}>
                        <h2 className="text-lg font-bold uppercase mb-3 tracking-wider flex items-center gap-2" style={{ color: theme.primary }}>
                            About Me
                        </h2>
                        <p className="text-gray-600 leading-relaxed text-sm">{resumeData.about}</p>
                    </section>
                )}

                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: theme.primary }}>
                        <span className="w-8 h-1 rounded-full" style={{ backgroundColor: theme.secondary }}></span> Experience
                    </h2>
                    <div className="space-y-6">
                        {resumeData.experience.map((exp, i) => (
                            <div key={i} className="relative pl-6 border-l-2 border-gray-200">
                                <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full" style={{ backgroundColor: theme.primary }}></div>
                                <h3 className="font-bold text-gray-800 text-lg">{exp.role}</h3>
                                <div className="flex justify-between text-sm text-gray-500 mb-2 font-medium">
                                    <span>{exp.company}</span>
                                    <span>{exp.start} - {exp.end || 'Present'}</span>
                                </div>
                                <p className="text-gray-600 text-sm whitespace-pre-wrap">{exp.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {styles.showProjects && resumeData.projects.length > 0 && (
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: theme.primary }}>
                            <span className="w-8 h-1 rounded-full" style={{ backgroundColor: theme.secondary }}></span> Projects
                        </h2>
                        <div className="grid gap-4">
                            {resumeData.projects.map((proj, i) => (
                                <div key={i} className="bg-white p-4 rounded shadow-sm border border-gray-100">
                                    <h3 className="font-bold text-gray-800">{proj.title}</h3>
                                    <p className="text-gray-600 text-sm mt-1">{proj.description}</p>
                                    <p className="text-xs text-gray-400 mt-2 font-mono bg-gray-50 inline-block px-2 py-1 rounded">Tech: {proj.technologies}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: theme.primary }}>
                        <span className="w-8 h-1 rounded-full" style={{ backgroundColor: theme.secondary }}></span> Education
                    </h2>
                    {resumeData.education.map((edu, i) => (
                        <div key={i} className="mb-4 flex justify-between items-center bg-white p-4 rounded shadow-sm">
                            <div>
                                <h3 className="font-bold text-gray-800">{edu.institution}</h3>
                                <div className="text-sm text-gray-600">{edu.degree}</div>
                            </div>
                            <div className="text-sm font-bold text-gray-400">{edu.year}</div>
                        </div>
                    ))}
                </section>
            </div>
        </div>
    );
};

export default CreativeTemplate;
