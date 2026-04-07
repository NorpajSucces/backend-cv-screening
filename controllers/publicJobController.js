const JobPosting = require("../models/JobPosting");
const Candidate = require("../models/Candidate");
const { uploadPdfBuffer } = require("../services/storageService");
const screeningJob = require("../jobs/screeningJob"); 

/**
 * GET /api/jobs
 * Endpoint publik untuk melihat lowongan yang tersedia (bisa di-search)
 */
const getOpenJobs = async (req, res) => {
  try {
    const { search } = req.query;
    let filter = { status: "open" };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } }
      ];
    }

    const jobs = await JobPosting.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/jobs/:id
 * Endpoint publik untuk melihat detail satu lowongan
 */
const getJobById = async (req, res) => {
  try {
    const job = await JobPosting.findById(req.params.id);
    if (!job || job.status !== "open") {
      return res.status(404).json({ success: false, message: "Job not found or already closed" });
    }
    res.json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/jobs/:id/apply
 * Melamar pekerjaan dengan mengunggah CV PDF
 */
const applyToJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const { name, email, phone } = req.body;

    // 1. Pastikan Job masih ada & open
    const job = await JobPosting.findById(jobId);
    if (!job || job.status !== "open") {
      return res.status(404).json({ success: false, message: "Job not available" });
    }

    // 2. Cek file CV
    if (!req.file) {
      return res.status(400).json({ success: false, message: "CV file is required (PDF only)" });
    }

    // 3. Upload file dari buffer (memory) ke Cloudinary
    const cvUrl = await uploadPdfBuffer(req.file.buffer);

    // 4. Buat kandidat di database (status pending)
    const candidate = await Candidate.create({
      name,
      email,
      phone, // Added phone since it's common in Apply
      cvUrl,
      jobId,
      status: "pending",
    });

    // 5. Jalankan Screening AI di Background
    // Kita tidak pakai await di sini agar proses HTTP Response cepat (sesuai PRD)
    screeningJob(candidate).catch(err => console.error("Screening Job Error:", err));

    // 6. Respon cepat ke pengguna
    res.status(201).json({
      success: true,
      message: "Application submitted successfully! CV screening is in progress.",
      candidateId: candidate._id,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getOpenJobs,
  getJobById,
  applyToJob,
};
