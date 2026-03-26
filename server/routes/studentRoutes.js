const express = require('express');
const router = express.Router();
const {
    getStudentDashboard,
    getAllStudents,
    bulkUploadStudents,
} = require('../controllers/studentController');
const { protect, faculty, admin } = require('../middleware/authMiddleware');

router.route('/dashboard').get(protect, getStudentDashboard);
router.route('/').get(protect, faculty, getAllStudents);
router.route('/bulk').post(protect, admin, bulkUploadStudents);

module.exports = router;
