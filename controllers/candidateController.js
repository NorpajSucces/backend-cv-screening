const Candidate = require('../models/Candidate')
const axios = require('axios')
const { deleteFileCloudinary } = require('../services/storageService')
const screeningJob = require('../jobs/screeningJob')
const decisionJob = require('../jobs/decisionJob')

const CandidateController = {
    find: (req, res, next) => {
        Candidate.find({})
        .then(candidate => {
            res.json(candidate)
        })
        .catch(error => {
            next(error)
        })
    },
    findById: (req, res, next) => {
        Candidate.findById(req.params.id)
        .populate('jobId')
        .then(candidate => {
            if (!candidate) {
                return res.status(404).json({ message: 'Candidate not found' });
            }
            res.json(candidate)
        })
        .catch(error => {
            next(error)
        })
    },
    accept: async (req, res, next) => {
        try {
            const candidate = await Candidate.findByIdAndUpdate(
                req.params.id,
                { status: 'advanced' },
                { new: true }
            ).populate('jobId');

            if (!candidate) return res.status(404).json({ message: 'Candidate not found' });

            // Trigger background job (Email) without awaiting
            decisionJob(candidate, 'accept').catch(err => console.error("Accept Background Job Error:", err));

            res.json({ message: 'Candidate accepted. Notification will be sent in background.', candidate });
        } catch (error) {
            next(error);
        }
    },
    reject: async (req, res, next) => {
        try {
            const candidate = await Candidate.findByIdAndUpdate(
                req.params.id,
                { status: 'rejected' },
                { new: true }
            ).populate('jobId');

            if (!candidate) return res.status(404).json({ message: 'Candidate not found' });

            // Trigger background job (AI Feedback + Email) without awaiting
            decisionJob(candidate, 'reject').catch(err => console.error("Reject Background Job Error:", err));

            res.json({ message: 'Candidate rejected. AI feedback and email will be processed in background.', candidate });
        } catch (error) {
            next(error);
        }
    },
    findByJob: (req, res, next) => {
        Candidate.find({ jobId: req.params.jobId })
        .then(candidates => {
            res.json(candidates)
        })
        .catch(error => {
            next(error)
        })
    },
    downloadCV: (req, res, next) => {
        Candidate.findById(req.params.id)
        .then(candidate => {
            if(!candidate) {
                return res.status(404).json({ message: 'Candidate not found' })
            }
            
            if (!candidate.cvUrl) {
                return res.status(404).json({ message: 'CV not found' });
            }

            // Proxy the download to set correct headers and filename
            axios({
                method: 'get',
                url: candidate.cvUrl,
                responseType: 'stream'
            })
            .then(response => {
                const safeName = candidate.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename="${safeName}_cv.pdf"`);
                response.data.pipe(res);
            })
            .catch(err => {
                console.error('Download error:', err);
                res.status(500).json({ message: 'Error downloading file from storage' });
            });
        })
        .catch(error => {
            next(error)
        })
    },
    bulkDelete: async (req, res, next) => {
        try {
            const { ids } = req.body;
            if (!ids || !Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({ message: 'No candidate IDs provided' });
            }

            // Temukan kandidat untuk mendapatkan cvUrl
            const candidates = await Candidate.find({ _id: { $in: ids } });
            
            // Hapus file dari Cloudinary
            const deletePromises = candidates.map(c => {
                if (c.cvUrl) {
                    // Try catch internal supaya jika file tak ada, delete db tetap lanjut
                    return deleteFileCloudinary(c.cvUrl).catch(err => console.error("Cloudinary delete err:", err));
                }
                return Promise.resolve();
            });

            await Promise.all(deletePromises);

            // Hapus dari MongoDB
            await Candidate.deleteMany({ _id: { $in: ids } });

            res.json({ message: 'Candidates and their CV files have been deleted successfully.' });
        } catch (error) {
            next(error);
        }
    },
    retryScreening: async (req, res, next) => {
        try {
            const candidateId = req.params.id;
            
            // Set status to pending and reset score
            const candidate = await Candidate.findByIdAndUpdate(candidateId, { status: 'pending', aiScore: null, aiSummary: null, aiStrengths: null, aiWeaknesses: null }, { new: true });
            
            if (!candidate) {
                return res.status(404).json({ message: 'Candidate not found' });
            }

            // Panggil ulang background job tanpa await (agar respons HTTP cepat)
            screeningJob(candidate).catch(err => console.error("Screening Job Error:", err));

            res.json({ message: 'Screening process has been restarted.', candidate });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = CandidateController