const User = require('../models/userModel');
const Student = require('../models/studentModel');
const generateToken = require('../utils/generateToken');

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
    let { email, password } = req.body;
    email = email.toLowerCase();

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
    let { name, email, password, role } = req.body;
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
};
