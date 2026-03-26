const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    getAuditLogs,
    updateUserStatus,
    notifyAtRiskStudents,
    getAllUsers,
    deleteUser,
    createFaculty,
    sendIndividualNotification,
    getStudentsAdvanced
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect);
router.use(admin);

router.get('/stats', getDashboardStats);
router.get('/audit-logs', getAuditLogs);
router.get('/users', getAllUsers);
router.get('/students', getStudentsAdvanced);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);
router.post('/faculty', createFaculty);
router.post('/notify-individual', sendIndividualNotification);
router.post('/notify-risk', notifyAtRiskStudents);

module.exports = router;
