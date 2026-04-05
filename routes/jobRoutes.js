// src/routes/jobRoutes.js
const express = require("express");
const router = express.Router();

const {get openJobs} = require ("../controllers/jobController");

router.get("/jobs", getOpenJobs);
module.exports = router;

router.get("/jobs", getOpenJobs);

// Give attention this middleware multer here
router.post("/jobs/:id/apply", upload.single("cv"), applyToJob);

module.exports = router;