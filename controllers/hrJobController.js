const JobPosting = require("../models/JobPosting");

// GET /api/hr/jobs
// Ambil semua job posting milik HR yang login
const getAllJobs = async (req, res, next) => {
  try {
    const jobs = await JobPosting.find()
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email");

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/hr/jobs
// Buat job posting baru
const createJob = async (req, res, next) => {
  try {
    const {
      title,
      aboutPosition,
      description,
      requirements,
      location,
      employmentType,
    } = req.body;

    const job = await JobPosting.create({
      title,
      aboutPosition,
      description,
      requirements,
      location,
      employmentType,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Job posting created successfully",
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/hr/jobs/:id
// Edit job posting
const updateJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      aboutPosition,
      description,
      requirements,
      location,
      employmentType,
    } = req.body;

    const job = await JobPosting.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job posting not found",
      });
    }

    // Update fields
    job.title = title ?? job.title;
    job.aboutPosition = aboutPosition ?? job.aboutPosition;
    job.description = description ?? job.description;
    job.requirements = requirements ?? job.requirements;
    job.location = location ?? job.location;
    job.employmentType = employmentType ?? job.employmentType;

    await job.save();

    res.status(200).json({
      success: true,
      message: "Job posting updated successfully",
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/hr/jobs/:id
// Hapus job posting
const deleteJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    const job = await JobPosting.findByIdAndDelete(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job posting not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Job posting deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/hr/jobs/:id/status
// Toggle status open ↔ closed
const toggleJobStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const job = await JobPosting.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job posting not found",
      });
    }

    job.status = job.status === "open" ? "closed" : "open";
    await job.save();

    res.status(200).json({
      success: true,
      message: `Job posting status changed to "${job.status}"`,
      data: {
        _id: job._id,
        title: job.title,
        status: job.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllJobs,
  createJob,
  updateJob,
  deleteJob,
  toggleJobStatus,
};