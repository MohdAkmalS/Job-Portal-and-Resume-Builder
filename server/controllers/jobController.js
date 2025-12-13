const Job = require('../models/Job');

// @desc    Create a new job
// @route   POST /api/jobs
// @access  Private (Recruiter)
exports.createJob = async (req, res) => {
    try {
        // Add user to req.body
        req.body.postedBy = req.user.id;
        req.body.companyName = req.user.profile.companyName;

        const job = await Job.create(req.body);

        res.status(201).json({
            success: true,
            data: job
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get all jobs (Public) with Filters
// @route   GET /api/jobs
// @access  Public
exports.getJobs = async (req, res) => {
    try {
        let query = { status: 'active' };

        // Filtering
        if (req.query.jobLocation) {
            query.jobLocation = { $regex: req.query.jobLocation, $options: 'i' };
        }
        if (req.query.category) {
            query.category = req.query.category;
        }
        if (req.query.type) {
            query.type = req.query.type;
        }
        if (req.query.experienceLevel) {
            query.experienceLevel = req.query.experienceLevel;
        }

        // Sorting
        let sort = '-createdAt'; // Default new first

        const jobs = await Job.find(query).sort(sort);
        res.status(200).json({ success: true, count: jobs.length, data: jobs });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get jobs posted by current recruiter
// @route   GET /api/jobs/my-jobs
// @access  Private (Recruiter)
exports.getMyJobs = async (req, res) => {
    // Lazy load Application model
    const Application = require('../models/Application');
    try {
        const jobs = await Job.find({ postedBy: req.user.id }).sort('-createdAt');

        // Get application counts for each job
        const jobsWithStats = await Promise.all(jobs.map(async (job) => {
            const applicationCount = await Application.countDocuments({ job: job._id });
            return {
                ...job.toObject(),
                applicationCount
            };
        }));

        res.status(200).json({ success: true, count: jobsWithStats.length, data: jobsWithStats });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private (Recruiter)
exports.updateJob = async (req, res) => {
    try {
        let job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        // Make sure user is job owner
        if (job.postedBy.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized to update this job' });
        }

        job = await Job.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: job });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private (Recruiter)
exports.deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        if (job.postedBy.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized to delete this job' });
        }

        await job.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Toggle Job Status (Active/Closed)
// @route   PATCH /api/jobs/:id/status
// @access  Private (Recruiter)
exports.toggleJobStatus = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        if (job.postedBy.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        job.status = job.status === 'active' ? 'closed' : 'active';
        await job.save();

        res.status(200).json({ success: true, data: job });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
// @desc    Get Recruiter Dashboard Stats
// @route   GET /api/jobs/stats
// @access  Private (Recruiter)
exports.getRecruiterStats = async (req, res) => {
    // Lazy load Application model to avoid circular dependency if needed, 
    // although Job/Application models don't circularly depend on *this* controller,
    // requiring them at top level is usually fine. But let's stick to the pattern.
    const Application = require('../models/Application');
    const Job = require('../models/Job');

    try {
        // Get all jobs by recruiter
        const jobs = await Job.find({ postedBy: req.user.id });
        const jobIds = jobs.map(job => job._id);

        // Aggregations
        const totalJobs = jobs.length;

        const totalApplications = await Application.countDocuments({
            job: { $in: jobIds }
        });

        const pendingReviews = await Application.countDocuments({
            job: { $in: jobIds },
            status: 'Applied'
        });

        const shortlisted = await Application.countDocuments({
            job: { $in: jobIds },
            status: 'Shortlisted'
        });

        res.status(200).json({
            success: true,
            data: {
                totalJobs,
                totalApplications,
                pendingReviews,
                shortlisted,
                interview: await Application.countDocuments({
                    job: { $in: jobIds },
                    'interview.date': { $exists: true, $ne: null }
                })
            }
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get Recommended Jobs (Based on User Skills)
// @route   GET /api/jobs/recommendations
// @access  Private (Seeker)
exports.getRecommendedJobs = async (req, res) => {
    try {
        const user = await req.user;
        const userSkills = user.profile?.skills || [];

        if (userSkills.length === 0) {
            return res.status(200).json({ success: true, count: 0, data: [], message: 'Add skills to get recommendations' });
        }

        // Find jobs where requirements match at least one user skill (regex partial match)
        // Convert skills to regex array for case-insensitive matching
        const skillRegex = userSkills.map(skill => new RegExp(skill, 'i'));

        const jobs = await Job.find({
            status: 'active',
            requirements: { $in: skillRegex }
        }).limit(5).sort('-createdAt');

        res.status(200).json({ success: true, count: jobs.length, data: jobs });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
