const express = require('express');
const router = express.Router();
const {
    authUser,
    registerUser,
    getUserProfile,
    googleAuth,
    getNotifications,
    markNotificationAsRead
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', registerUser);
router.post('/login', authUser);
router.post('/google', googleAuth);
router.get('/profile', protect, getUserProfile);
router.get('/notifications', protect, getNotifications);
router.put('/notifications/:id/read', protect, markNotificationAsRead);

module.exports = router;
