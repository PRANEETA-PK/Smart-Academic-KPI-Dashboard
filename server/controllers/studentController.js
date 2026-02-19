const Student = require('../models/studentModel');

// @desc    Get student dashboard data
// @route   GET /api/students/dashboard
// @access  Private (Student only)
const getStudentDashboard = async (req, res) => {
    const student = await Student.findOne({ user: req.user._id });

    if (student) {
        res.json(student);
    } else {
        res.status(404).json({ message: 'Student data not found' });
    }
};

// @desc    Get all students (for admin/faculty)
// @route   GET /api/students
// @access  Private (Admin/Faculty)
const getAllStudents = async (req, res) => {
    const students = await Student.find({});
    res.json(students);
};

module.exports = {
    getStudentDashboard,
    getAllStudents,
};
