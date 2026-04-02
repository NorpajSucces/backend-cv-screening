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

// Semua route di bawah ini butuh JWT (Auth/Login)
router.use(protect);

// GET    /api/hr/jobs           Ambil semua job posting
// POST   /api/hr/jobs           Buat job posting baru
router.route("/").get(getAllJobs).post(createJob);

// PUT    /api/hr/jobs/:id       Edit job posting
// DELETE /api/hr/jobs/:id       Hapus job posting
router.route("/:id").put(updateJob).delete(deleteJob);

// PATCH  /api/hr/jobs/:id/status  Toggle open ↔ closed
router.patch("/:id/status", toggleJobStatus);

module.exports = router;