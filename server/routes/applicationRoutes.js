const express = require('express');
const router = express.Router();
const {
    applyForJob,
    getJobApplications,
    getRecruiterApplications,
    updateApplicationStatus,
    scheduleInterview,
    getSeekerStats,
    getApplicationById,
    addApplicationNote
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/:jobId/apply', protect, authorize('seeker'), applyForJob);
router.get('/my-stats', protect, authorize('seeker'), getSeekerStats);
router.get('/job/:jobId', protect, authorize('recruiter'), getJobApplications);
router.get('/recruiter', protect, authorize('recruiter'), getRecruiterApplications);
router.patch('/:id/status', protect, authorize('recruiter'), updateApplicationStatus);
router.post('/:id/schedule', protect, authorize('recruiter'), scheduleInterview);
router.get('/:id', protect, authorize('recruiter'), getApplicationById);
router.put('/:id/note', protect, authorize('recruiter'), addApplicationNote);

module.exports = router;
