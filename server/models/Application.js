const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    applicant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['Applied', 'Shortlisted', 'Interview', 'Rejected', 'Hired'],
        default: 'Applied'
    },
    resumeUrl: {
        type: String // Link to resume
    },
    coverLetter: {
        type: String
    },
    // Interview Details
    interview: {
        date: Date,
        time: String,
        mode: {
            type: String,
            enum: ['Online', 'Offline']
        },
        link: String,     // For Online
        location: String, // For Offline
        notes: String     // Internal notes for recruiter reference
    },
    // Recruiter Internal Notes
    recruiterNotes: {
        type: String
    },
    appliedAt: {
        type: Date,
        default: Date.now
    }
});

// Ensure a user can only apply once per job
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
