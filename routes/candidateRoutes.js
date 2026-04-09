const express = require('express');
const router = express.Router();
const CandidateController = require('../controllers/candidateController')

// TODO: implement endpoints
router.get('/', CandidateController.find)
router.get('/:id', CandidateController.findById)
router.put('/:id/accept', CandidateController.accept)
router.put('/:id/reject', CandidateController.reject)

module.exports = router;
