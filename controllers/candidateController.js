const Candidate = require('../models/Candidate')
const { sendEmail } = require('../services/emailService')
const axios = require('axios')
const { deleteFileCloudinary } = require('../services/storageService')
const screeningJob = require('../jobs/screeningJob')
const pdfParse = require('pdf-parse');
const aiService = require('../services/aiService');

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
    accept: (req, res, next) => {
        Candidate.findByIdAndUpdate(
            req.params.id,
            { status: 'advanced' },
            { new: true }
        )
        .then(candidate => {
            if(!candidate) throw new Error('Candidate not found')
            
            return sendEmail({
                to: candidate.email,
                subject: 'Application Update',
                html: `
                    <h2>Congratulations ${candidate.name}</h2>
                    <p>We are pleased to inform you that your application has successfully passed our initial screening process.</p>
                    <p>
                        After careful consideration, we are excited to announce that you will be proceeding to the next phase of our recruitment process.
                        This next stage will allow us to further evaluate your skills and qualifications. We believe you have strong potential, and we are looking forward to learning more about you.    
                    </p>
                    <p>Please note that the schedule and details for the upcoming recruitment stage will be communicated to you at a later time. Kindly keep an eye on your email for further updates.</p>
                    <p>Thank you for your interest and for taking the time to apply. We truly appreciate your effort and enthusiasm.</p>
                    <br/><br/>
                    <p>Best regards,</p>
                    <p><strong>SmartRecruiter</strong></p>
                `
            }).then(() => candidate)
        })
        .then(candidate => {
            res.json({ message: 'Candidate accepted & email sent', candidate })
        })
        .catch(error => {
            next(error)
        })
    },
    reject: async (req, res, next) => {
        try {
            const candidate = await Candidate.findById(req.params.id).populate('jobId');
            if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
            
            // Generate AI Feedback only if it hasn't been generated yet
            if (!candidate.aiFeedback) {
                console.log(`- Generating AI Rejection Feedback for ${candidate.email}...`);
                const response = await axios.get(candidate.cvUrl, { responseType: 'arraybuffer' });
                const pdfBuffer = Buffer.from(response.data, 'binary');
                const pdfData = await pdfParse(pdfBuffer);
                const cvText = pdfData.text;
                
                const jobRequirements = candidate.jobId && candidate.jobId.requirements ? candidate.jobId.requirements : "General Software Engineering requirements";
                
                candidate.aiFeedback = await aiService.generateRejectionFeedback(cvText, jobRequirements);
            }

            candidate.status = 'rejected';
            await candidate.save();

            await sendEmail({
                to: candidate.email,
                subject: 'Application Update: SmartRecruiter',
                html: `
                    <h2>Thank You for Your Application</h2>
                    <h2>Dear ${candidate.name},</h2>
                    <p>We sincerely appreciate the time and effort you put into your application. It was a pleasure reviewing your profile.</p>
                    <p>After careful consideration, we regret to inform you that you will not be moving forward to the next stage of our recruitment process at this time.</p>
                    <p>As part of our commitment to providing a helpful and transparent experience, we have included feedback generated from our evaluation system below. We hope this will support your future applications and professional development.</p>
                    <p><strong>Application Feedback:</strong></p>
                    <p style="white-space: pre-line;">${candidate.aiFeedback}</p>
                    <p>We encourage you to continue developing your skills and exploring new opportunities. We truly appreciate your interest in joining our team and wish you all the best in your future endeavors.</p>
                    <br/><br/>
                    <p>Best regards,</p>
                    <p><strong>SmartRecruiter</strong></p>
                `
            });

            res.json({ message: 'Candidate rejected & feedback email sent', candidate });
        } catch (error) {
            console.error("AI Rejection Error:", error);
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