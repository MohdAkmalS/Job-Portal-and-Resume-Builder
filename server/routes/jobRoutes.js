const express = require('express');
const router = express.Router();
const {
    createJob,
    getJobs,
    getMyJobs,
    updateJob,
    deleteJob,
    toggleJobStatus,
    getRecruiterStats,
    getRecommendedJobs
} = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(getJobs)
    .post(protect, authorize('recruiter'), createJob);

router.get('/recommendations', protect, authorize('seeker'), getRecommendedJobs);

router.get('/stats', protect, authorize('recruiter'), getRecruiterStats);
router.get('/my-jobs', protect, authorize('recruiter'), getMyJobs);

router.route('/:id')
    .put(protect, authorize('recruiter'), updateJob)
    .delete(protect, authorize('recruiter'), deleteJob);

router.patch('/:id/status', protect, authorize('recruiter'), toggleJobStatus);

module.exports = router;
