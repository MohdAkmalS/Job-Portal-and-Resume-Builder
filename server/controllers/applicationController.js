const Application = require('../models/Application');
const Job = require('../models/Job');

// @desc    Apply to a job
// @route   POST /api/applications/:jobId
// @access  Private (Seeker)
exports.applyForJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId);
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        // Check if already applied
        const existingApplication = await Application.findOne({
            job: req.params.jobId,
            applicant: req.user.id
        });

        if (existingApplication) {
            return res.status(400).json({ success: false, message: 'You have already applied for this job' });
        }

        const application = await Application.create({
            job: req.params.jobId,
            applicant: req.user.id,
            resumeUrl: req.body.resumeUrl,
            coverLetter: req.body.coverLetter
        });

        res.status(201).json({ success: true, data: application });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get applications for a job (Recruiter)
// @route   GET /api/applications/job/:jobId
// @access  Private (Recruiter)
exports.getJobApplications = async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId);

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        if (job.postedBy.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        const applications = await Application.find({ job: req.params.jobId })
            .populate('applicant', 'name email profile')
            .sort('-appliedAt');

        res.status(200).json({ success: true, count: applications.length, data: applications });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get all applications for logged-in applicant (Seeker)
// @route   GET /api/applications/me
// @access  Private (Seeker)
exports.getSeekerStats = async (req, res) => {
    try {
        // Complete history
        const applications = await Application.find({ applicant: req.user.id })
            .sort('-appliedAt')
            .populate('job', 'title companyName type jobLocation');

        // Calculate counts for dashboard (assuming these variables would be defined elsewhere or calculated here)
        const totalApplied = applications.length;
        const shortlisted = applications.filter(app => app.status === 'Shortlisted').length;
        const interview = applications.filter(app => app.status === 'Interview').length;
        const hired = applications.filter(app => app.status === 'Hired').length;

        res.status(200).json({
            success: true,
            data: {
                totalApplied,
                shortlisted,
                interview,
                hired,
                recent: applications.slice(0, 3), // Keep for dashboard
                applications // Full list for history page
            }
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get all applications for logged-in recruiter (across all jobs)
// @route   GET /api/applications/recruiter
// @access  Private (Recruiter)
exports.getRecruiterApplications = async (req, res) => {
    try {
        // Find all jobs by this recruiter
        const jobs = await Job.find({ postedBy: req.user.id }).select('_id');
        const jobIds = jobs.map(job => job._id);

        const applications = await Application.find({ job: { $in: jobIds } })
            .populate('job', 'title')
            .populate('applicant', 'name email profile')
            .sort('-appliedAt');

        res.status(200).json({ success: true, count: applications.length, data: applications });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update application status
// @route   PATCH /api/applications/:id/status
// @access  Private (Recruiter)
exports.updateApplicationStatus = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id).populate('job');

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        // Verify ownership via Job
        if (application.job.postedBy.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        application.status = req.body.status;
        await application.save();

        res.status(200).json({ success: true, data: application });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Schedule Interview
// @route   POST /api/applications/:id/schedule
// @access  Private (Recruiter)
exports.scheduleInterview = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id).populate('job');

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        if (application.job.postedBy.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        application.interview = {
            date: req.body.date,
            time: req.body.time,
            mode: req.body.mode,
            notes: req.body.notes
        };
        application.status = 'Interview'; // Auto update status
        await application.save();

        res.status(200).json({ success: true, data: application });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};


// @desc    Get single application details
// @route   GET /api/applications/:id
// @access  Private (Recruiter)
exports.getApplicationById = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id)
            .populate('job')
            .populate('applicant', 'name email phoneNumber profile');

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        // Verify Recruiter owns the job
        if (application.job.postedBy.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        res.status(200).json({ success: true, data: application });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Add Note to Application
// @route   PUT /api/applications/:id/note
// @access  Private (Recruiter)
exports.addApplicationNote = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id).populate('job');

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        if (application.job.postedBy.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        application.recruiterNotes = req.body.note;
        await application.save();

        res.status(200).json({ success: true, data: application });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
