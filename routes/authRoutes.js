const express = require('express');
const router  = express.Router();
const { login, logout, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public
router.post('/login', login);

// Protected (butuh JWT)
router.post('/logout',          protect, logout);
router.put('/change-password',  protect, changePassword);

module.exports = router;
