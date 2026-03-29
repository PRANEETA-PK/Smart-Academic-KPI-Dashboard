const express = require('express');
const router = express.Router();
const {
    getStudentDashboard,
    getAllStudents,
    bulkUploadStudents,
    addProject,
    deleteProject,
    getPendingProjectsByDept,
    updateProjectStatusByFaculty,
} = require('../controllers/studentController');
const { protect, faculty, admin } = require('../middleware/authMiddleware');

router.route('/dashboard').get(protect, getStudentDashboard);
router.route('/projects').post(protect, addProject);
router.route('/projects/pending').get(protect, faculty, getPendingProjectsByDept);
router.route('/projects/:studentId/:projectId/status').put(protect, faculty, updateProjectStatusByFaculty);
router.route('/projects/:projectId').delete(protect, deleteProject);
router.route('/').get(protect, faculty, getAllStudents);
router.route('/bulk').post(protect, admin, bulkUploadStudents);

module.exports = router;
