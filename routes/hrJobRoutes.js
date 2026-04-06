const express = require("express");
const router = express.Router();

const {
  getAllJobs,
  createJob,
  updateJob,
  deleteJob,
  toggleJobStatus,
} = require("../controllers/hrJobController");

const { protect } = require("../middleware/authMiddleware");

// All routes below require JWT authentication
router.use(protect);

// GET    /api/hr/jobs           Get all job postings
// POST   /api/hr/jobs           Create a new job posting
router.route("/").get(getAllJobs).post(createJob);

// PUT    /api/hr/jobs/:id       Update a job posting
// DELETE /api/hr/jobs/:id       Delete a job posting
router.route("/:id").put(updateJob).delete(deleteJob);

// PATCH  /api/hr/jobs/:id/status  Toggle open <-> closed
router.patch("/:id/status", toggleJobStatus);

module.exports = router;