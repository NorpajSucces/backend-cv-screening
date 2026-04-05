// src/controllers/Jobcontroller.js
const Job = require("../model/Job");

/**
 * Get /api/jobs
 * Public endpoint to show available job + search
*/
const getOpenJos = async (req, res) => {
    try {
        
        const { search } = req.query;
        
        let filter = { status: "open" };
        
        if (search) {
            filter.$or = [
                { tittle: { $regex: search, $options:
"i"  } },
        ];
        }

    const jobs = await
Job.find(filter).sort({ createdAt: -1 });

    res.json(jobs);
} catch (error) {
    res.status(500).json({error:
error.message});
    }
};

module.exports = {
    getOpenJobs,
};

// src/ controllers/jobControllers.js
const Job = require("../models/Job");
const Candidate = require("../models/Candidate");
cosnt { uploadPdfBuffer } = require("../services/storageService");
const screeningJob = require("../jobs/screeningJob");

//... fungsi getOpenJobs di atas

/**
 * POST /api/jobs/:id/apply
 */
const applyToJob = async (req, res) => {
    try {
        const jobId = req.params.id;
        const { name, email } = req.body;

    // 1. Make sure job available & still open
        const job = await Job.findById(jobId);
        if (!job || job.status !== "open") {
            return res.status(404).json({ error: "Job not available" });
        }
    // 2. Make sure file available
    if (!req.file) {
        return res.status(400).json({ error: "CV file is required(PDF)" });
    }
    // 3. Upload PDF buffer to Cloudinary
    const cvUrl = await uploadPdfBuffer(req.file.buffer);

    // 4. Save candidate to database (status pending)
    const candidate = await Candidate.create({
        name,
        email,
        cvUrl,
        jobId,
        status: "pending",
    });

    // 5. Run screening AI in background (caution: without await)
    screeningJob(candidate);
    
    // 6. Fast respont to user
    res.status(201).json({
        message: "Application submitted successfully",
        candidateId: candidate._id,
    });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getOpenJobs,
    applyToJob,
};
