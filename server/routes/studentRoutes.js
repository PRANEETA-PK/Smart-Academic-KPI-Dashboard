const express = require('express');
const router = express.Router();
const {
    getStudentDashboard,
    getAllStudents,
} = require('../controllers/studentController');
const { protect, faculty } = require('../middleware/authMiddleware');

router.route('/dashboard').get(protect, getStudentDashboard);
router.route('/').get(protect, faculty, getAllStudents);

module.exports = router;
