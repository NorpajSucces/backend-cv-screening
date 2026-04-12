const express = require('express');
const router = express.Router();
const CandidateController = require('../controllers/candidateController')

// TODO: implement endpoints
router.get('/', CandidateController.find)
router.post('/bulk-delete', CandidateController.bulkDelete) // Must be before /:id 
router.get('/:id', CandidateController.findById)
router.put('/:id/accept', CandidateController.accept)
router.put('/:id/reject', CandidateController.reject)
router.post('/:id/retry', CandidateController.retryScreening)
router.get('/jobs/:jobId', CandidateController.findByJob)
router.get('/:id/download-cv', CandidateController.downloadCV)

module.exports = router;
