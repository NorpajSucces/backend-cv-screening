const express = require('express');
const router = express.Router();
const { getDashboardStats, getJobDistribution, getJobStatusBreakdown, getRecentCandidates } = require('../controllers/dashboardController');

// TODO: implement endpoints
router.get('/stats', getDashboardStats)
router.get('/job-distribution', getJobDistribution)
router.get('/job-status', getJobStatusBreakdown)
router.get('/recent-candidate', getRecentCandidates)

module.exports = router;
