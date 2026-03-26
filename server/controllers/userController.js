const User = require('../models/userModel');
const Student = require('../models/studentModel');
const Notification = require('../models/notificationModel');
const generateToken = require('../utils/generateToken');

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
    try {
        let { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        console.log(`Login attempt for: ${email}`);

        email = email.toLowerCase().trim();
        const user = await User.findOne({ email });

        if (!user) {
            console.warn(`Auth failure: User not found [${email}]`);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await user.matchPassword(password);
        if (isMatch) {
            // ✅ Check if account is locked by admin
            if (user.active === false) {
                console.warn(`Auth blocked: Account locked for [${email}]`);
                return res.status(403).json({
                    message: 'Your account has been deactivated. Please contact the administrator.'
                });
            }

            console.log(`Auth success: ${email}`);
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            console.warn(`Auth failure: Incorrect password for [${email}]`);
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(`Login Error: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user notifications
// @route   GET /api/users/notifications
// @access  Private
const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .sort({ createdAt: -1 })
            .populate('sender', 'name role');
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/users/notifications/:id/read
// @access  Private
const markNotificationAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (notification && notification.recipient.toString() === req.user._id.toString()) {
            notification.isRead = true;
            await notification.save();
            res.json({ message: 'Notification marked as read' });
        } else {
            res.status(404).json({ message: 'Notification not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
    let { name, email, password, role, department } = req.body;
    email = email.toLowerCase();

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400).json({ message: 'User already exists' });
        return;
    }

    const user = await User.create({
        name,
        email,
        password,
        role,
        department,
    });

    if (user) {
        // Create associated Student record if user is a student
        if (role === 'student') {
            await Student.create({
                user: user._id,
                name: user.name,
                email: user.email,
                rollNumber: `S-${Date.now().toString().slice(-6)}`,
                department: 'Not Assigned',
                attendance: 0,
                cgpa: 0,
                semesters: []
            });
        }

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};



// @desc    Auth user with Google
// @route   POST /api/users/google
// @access  Public
const googleAuth = async (req, res) => {
    const { email, name, picture, googleId } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
        // 1. Create User
        user = await User.create({
            name,
            email,
            password: googleId, // Use googleId as a temporary password
            role: 'student',
        });

        // 2. Create associated Student record
        if (user) {
            await Student.create({
                user: user._id,
                name: user.name,
                email: user.email,
                rollNumber: `G-${Date.now().toString().slice(-6)}`, // Generated roll number
                department: 'Not Assigned',
                attendance: 0,
                cgpa: 0,
                semesters: []
            });
        }
    }

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

module.exports = {
    authUser,
    registerUser,
    getUserProfile,
    googleAuth,
    getNotifications,
    markNotificationAsRead
};
