const express = require('express');
const router = express.Router();
const publicJobController = require('../controllers/publicJobController');
const upload = require('../middleware/uploadMiddleware');

// Endpoint untuk mengambil daftar lowongan pekerjaan (Public)
router.get('/', publicJobController.getOpenJobs);

// Endpoint untuk mengambil detail satu pekerjaan
router.get('/:id', publicJobController.getJobById);

// Endpoint untuk melamar pekerjaan dengan Upload CV (PDF) lewat Middleware Multer
router.post('/:id/apply', upload.single('cv'), publicJobController.applyToJob);

module.exports = router;
