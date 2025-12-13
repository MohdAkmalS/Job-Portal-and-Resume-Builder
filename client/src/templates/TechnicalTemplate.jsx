import React from 'react';

const TechnicalTemplate = ({ resumeData, styles, theme, fontClass }) => {
    return (
        <div className={`p-10 bg-white text-gray-900 ${fontClass} text-sm leading-relaxed min-h-[297mm]`}>
            {/* Header */}
            <header className="border-b-2 border-gray-800 pb-6 mb-6 flex justify-between items-start">
                <div>
                    <h1 className="text-4xl font-bold tracking-tighter mb-2 text-black">{resumeData.name}</h1>
                    <div className="text-gray-600 flex flex-col gap-1 text-xs">
                        <div className="flex gap-4">
                            <span>{resumeData.phoneNumber}</span>
                            <span>{resumeData.email}</span>
                        </div>
                        <div className="flex gap-4">
                            <span>{resumeData.social.linkedin}</span>
                            <span>{resumeData.social.github}</span>
                            <span>{resumeData.social.portfolio}</span>
                        </div>
                    </div>
                </div>
                {styles.showPhoto && resumeData.profileImage && (
                    <img src={resumeData.profileImage} alt={resumeData.name} className="w-24 h-24 rounded grayscale object-cover border border-gray-400" />
                )}
            </header>

            {/* Skills - Prominent for Technical */}
            <section className="mb-8">
                <h2 className="text-lg font-bold uppercase mb-3 border-b border-gray-300 pb-1 text-black">Technical Skills</h2>
                <div className="flex flex-wrap gap-2">
                    {resumeData.skills.map((skill, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-semibold text-gray-800">
                            {skill}
                        </span>
                    ))}
                </div>
            </section>

            {/* Summary */}
            {styles.showSummary && resumeData.about && (
                <section className="mb-8">
                    <h2 className="text-lg font-bold uppercase mb-3 border-b border-gray-300 pb-1 text-black">Profile</h2>
                    <p className="text-gray-700">{resumeData.about}</p>
                </section>
            )}

            {/* Experience */}
            <section className="mb-8">
                <h2 className="text-lg font-bold uppercase mb-3 border-b border-gray-300 pb-1 text-black">Experience</h2>
                {resumeData.experience.map((exp, i) => (
                    <div key={i} className="mb-6">
                        <div className="flex justify-between items-baseline mb-1">
                            <h3 className="font-bold text-base text-gray-800">{exp.role}</h3>
                            <span className="text-xs font-semibold text-gray-500">{exp.start} - {exp.end || 'Present'}</span>
                        </div>
                        <div className="text-sm font-semibold text-gray-600 mb-2">{exp.company}</div>
                        <p className="text-gray-700 whitespace-pre-line">{exp.description}</p>
                    </div>
                ))}
            </section>

            {/* Projects */}
            {styles.showProjects && resumeData.projects.length > 0 && (
                <section className="mb-8">
                    <h2 className="text-lg font-bold uppercase mb-3 border-b border-gray-300 pb-1 text-black">Projects</h2>
                    <div className="grid grid-cols-1 gap-4">
                        {resumeData.projects.map((proj, i) => (
                            <div key={i} className="border-l-2 border-gray-300 pl-4">
                                <div className="flex justify-between items-baseline">
                                    <h3 className="font-bold text-gray-800">{proj.title}</h3>
                                    {proj.link && <a href={proj.link} className="text-xs text-blue-600 hover:underline">{proj.link}</a>}
                                </div>
                                <p className="text-gray-700 mb-1">{proj.description}</p>
                                <div className="text-xs text-gray-500 mt-1">
                                    <span className="font-bold">Stack:</span> {proj.technologies}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Education */}
            <section className="mb-8">
                <h2 className="text-lg font-bold uppercase mb-3 border-b border-gray-300 pb-1 text-black">Education</h2>
                {resumeData.education.map((edu, i) => (
                    <div key={i} className="mb-2 flex justify-between">
                        <div>
                            <div className="font-bold text-gray-800">{edu.institution}</div>
                            <div className="text-gray-600 text-xs">{edu.degree}</div>
                        </div>
                        <div className="text-xs font-semibold text-gray-500">{edu.year}</div>
                    </div>
                ))}
            </section>

            {/* Certifications */}
            {styles.showCertifications && resumeData.certifications.length > 0 && (
                <section className="mb-8">
                    <h2 className="text-lg font-bold uppercase mb-3 border-b border-gray-300 pb-1 text-black">Certifications</h2>
                    <ul className="list-disc list-inside text-xs">
                        {resumeData.certifications.map((cert, i) => (
                            <li key={i} className="mb-1">
                                <span className="font-bold text-gray-800">{cert.name}</span> - {cert.organization} ({cert.year})
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </div>
    );
};

export default TechnicalTemplate;
