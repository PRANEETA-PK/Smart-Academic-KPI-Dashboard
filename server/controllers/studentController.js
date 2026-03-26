const Student = require('../models/studentModel');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

// @desc    Get student dashboard data
// @route   GET /api/students/dashboard
// @access  Private (Student only)
const getStudentDashboard = async (req, res) => {
    const student = await Student.findOne({ user: req.user._id }).lean();

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
    let query = {};

    // If faculty, filter by department
    if (req.user.role === 'faculty') {
        if (req.user.department) {
            query.department = req.user.department;
        } else {
            // If faculty has no department assigned, they might not see any students
            // or we could allow them to see all if that's the requirement. 
            // The prompt says "faculty should have access to their own specific department".
            return res.status(400).json({ message: 'Faculty department not assigned' });
        }
    }

    const students = await Student.find(query).lean();
    res.json(students);
};

// @desc    Bulk upload students
// @route   POST /api/students/bulk
// @access  Private (Admin)
const bulkUploadStudents = async (req, res) => {
    const studentsData = req.body;

    if (!Array.isArray(studentsData)) {
        return res.status(400).json({ message: 'Invalid data format, expected an array' });
    }

    const results = {
        success: 0,
        failed: 0,
        errors: []
    };

    for (const data of studentsData) {
        try {
            const { name, email, rollNumber, department, attendance, cgpa, semesters } = data;

            // Check if user already exists
            const userExists = await User.findOne({ email: email.toLowerCase() });
            if (userExists) {
                results.failed++;
                results.errors.push(`User with email ${email} already exists`);
                continue;
            }

            // 1. Create User
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('Student@123', salt);

            const user = await User.create({
                name,
                email: email.toLowerCase(),
                password: hashedPassword,
                role: 'student',
                department
            });

            // 2. Create Student
            const studentYear = data.yearOfStudy || Math.ceil((semesters?.length || 0) / 2) || 1;

            await Student.create({
                user: user._id,
                name,
                email: email.toLowerCase(),
                rollNumber,
                department,
                attendance: attendance || 0,
                cgpa: cgpa || 0,
                yearOfStudy: studentYear,
                backlogs: data.backlogs || 0,
                placementData: data.placementData || [],
                semesters: semesters || []
            });

            results.success++;
        } catch (error) {
            results.failed++;
            results.errors.push(`Error creating student ${data.email}: ${error.message}`);
        }
    }

    res.status(results.failed > 0 ? 207 : 201).json({
        message: `Bulk upload completed. Success: ${results.success}, Failed: ${results.failed}`,
        results
    });
};

module.exports = {
    getStudentDashboard,
    getAllStudents,
    bulkUploadStudents,
};
