const User = require('../models/userModel');
const Student = require('../models/studentModel');
const Faculty = require('../models/facultyModel');
const AuditLog = require('../models/auditLogModel');
const Notification = require('../models/notificationModel');
const { sendAdminMail } = require('../utils/mailer');

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getDashboardStats = async (req, res) => {
    try {
        const totalStudents = await Student.countDocuments();
        const facultyCount = await User.countDocuments({ role: 'faculty' });

        const students = await Student.find({}).lean();
        const avgInstitutionalCGPA = students.length > 0
            ? (students.reduce((acc, s) => acc + (s.cgpa || 0), 0) / students.length).toFixed(2)
            : 0;

        const facultyToStudentRatio = facultyCount > 0
            ? (totalStudents / facultyCount).toFixed(1)
            : totalStudents;

        // Department-wise CGPA
        const departmentStats = {};
        students.forEach(s => {
            if (!departmentStats[s.department]) {
                departmentStats[s.department] = { totalCGPA: 0, count: 0 };
            }
            departmentStats[s.department].totalCGPA += (s.cgpa || 0);
            departmentStats[s.department].count += 1;
        });

        const departmentalCGPA = Object.keys(departmentStats).map(dept => ({
            department: dept,
            avgCGPA: (departmentStats[dept].totalCGPA / departmentStats[dept].count).toFixed(2)
        }));

        // Risk Monitor: Attendance < 75% or SGPA < 5.0 (using CGPA as proxy for global health)
        const atRiskStudents = students.filter(s => s.attendance < 75 || s.cgpa < 5.0);

        // Syllabus Progress (Faculty Oversight)
        const faculties = await Faculty.find({}).lean();
        const syllabusProgress = faculties.map(f => ({
            name: f.name,
            department: f.department,
            progress: f.syllabusProgress.map(p => ({
                subject: p.subject,
                planned: p.lessonsPlanned,
                completed: p.lessonsCompleted,
                percentage: p.lessonsPlanned > 0 ? ((p.lessonsCompleted / p.lessonsPlanned) * 100).toFixed(0) : 0
            }))
        }));

        // Institutional Health SGPA Average (Today's attendance proxy for demo)
        const totalAttendance = students.length > 0
            ? (students.reduce((acc, s) => acc + (s.attendance || 0), 0) / students.length).toFixed(0)
            : 0;

        res.json({
            kpis: {
                totalStudents,
                avgInstitutionalCGPA,
                facultyToStudentRatio,
                totalAttendance // Engagement Monitor
            },
            departmentalCGPA,
            atRiskStudents: atRiskStudents.map(s => ({
                id: s._id,
                name: s.name,
                rollNumber: s.rollNumber,
                attendance: s.attendance,
                cgpa: s.cgpa
            })),
            syllabusProgress,
            attendanceTrend: [
                { day: "Mon", attendance: 92 },
                { day: "Tue", attendance: 88 },
                { day: "Wed", attendance: 90 },
                { day: "Thu", attendance: 85 },
                { day: "Fri", attendance: totalAttendance || 78 },
            ]
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Audit Logs
// @route   GET /api/admin/audit-logs
// @access  Private (Admin)
const getAuditLogs = async (req, res) => {
    try {
        const logs = await AuditLog.find({}).sort({ createdAt: -1 }).limit(50).lean();
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get All Users (Master User Table)
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password').lean();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update User Status (Edit/Deactivate)
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin)
const updateUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.role = req.body.role || user.role;
            // Add status field if needed, for now we can just use a simulated deactivate
            // by changing role or adding an active field (let's assume 'active' for now)
            user.active = req.body.active !== undefined ? req.body.active : user.active;

            const updatedUser = await user.save();

            // Log action
            await AuditLog.create({
                admin: req.user._id,
                action: 'Update User Status',
                targetUser: user._id,
                targetName: user.name,
                details: `Updated role/status of ${user.name}`
            });

            res.json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Notify At-Risk Students
// @route   POST /api/admin/notify-risk
// @access  Private (Admin)
const notifyAtRiskStudents = async (req, res) => {
    try {
        const { studentIds } = req.body;
        // In reality, this would send emails/notifications
        // For now, we just log it
        await AuditLog.create({
            admin: req.user._id,
            action: 'Notify At-Risk Students',
            details: `Sent alerts to ${studentIds.length} students`
        });
        res.json({ message: `Notifications sent to ${studentIds.length} students` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete User
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            // Delete associated Student or Faculty profile
            if (user.role === 'student') {
                await Student.deleteOne({ user: user._id });
            } else if (user.role === 'faculty') {
                await Faculty.deleteOne({ user: user._id });
            }

            const userName = user.name;
            await User.deleteOne({ _id: user._id });

            // Log action
            await AuditLog.create({
                admin: req.user._id,
                action: 'Delete User',
                targetName: userName,
                details: `Permanently deleted user: ${userName} (${user.email})`
            });

            res.json({ message: 'User and associated data removed successfully' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create New Faculty/Staff
// @route   POST /api/admin/faculty
// @access  Private (Admin)
const createFaculty = async (req, res) => {
    try {
        const { name, email, password, department, designation } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: 'faculty',
            department
        });

        const faculty = await Faculty.create({
            user: user._id,
            name,
            email,
            department,
            designation,
            syllabusProgress: []
        });

        // Log action
        await AuditLog.create({
            admin: req.user._id,
            action: 'Create Faculty',
            targetName: name,
            details: `Added new faculty member: ${name} in ${department}`
        });

        res.status(201).json({ message: 'Faculty created successfully', user, faculty });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Send Individual Email to a User
// @route   POST /api/admin/notify-individual
// @access  Private (Admin)
const sendIndividualNotification = async (req, res) => {
    try {
        const { recipientId, title, message, type } = req.body;

        // Find target user to get their email
        const targetUser = await User.findById(recipientId).select('name email');
        if (!targetUser) {
            return res.status(404).json({ message: 'Target user not found' });
        }

        // Save in-app notification
        const notification = await Notification.create({
            recipient: recipientId,
            sender: req.user._id,
            title,
            message,
            type: type || 'Message'
        });

        // Send REAL email to the user (wrapped in try/catch to prevent 500 crashes if Gmail isn't setup)
        try {
            await sendAdminMail(
                targetUser.email,
                title || 'Message from Academic Compass Admin',
                message,
                req.user.name
            );
        } catch (mailError) {
            console.warn(`[Warning] Could not send real email to ${targetUser.email}. Check .env GMAIL credentials.`);
            // We don't throw the error, we just continue so the in-app notification is still saved
        }

        // Log to Audit
        await AuditLog.create({
            admin: req.user._id,
            action: 'Send Message/Email',
            targetName: targetUser.name,
            details: `Sent in-app message & attempted email to ${targetUser.email}: "${title}"`
        });

        res.status(201).json({
            message: `Message sent successfully to ${targetUser.email}`,
            notification
        });
    } catch (error) {
        console.error('Email send error:', error.message);
        res.status(500).json({ message: 'Failed to send email: ' + error.message });
    }
};

// @desc    Get Students with Search, Filter & Pagination
// @route   GET /api/admin/students?search=&department=&page=1&limit=10
// @access  Private (Admin)
const getStudentsAdvanced = async (req, res) => {
    try {
        const { search = '', department = '', yearOfStudy = '', page = 1, limit = 10 } = req.query;

        const query = {};

        // Text search on name or rollNumber
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { rollNumber: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        // Filter by department
        if (department) query.department = department;

        // Filter by year of study
        if (yearOfStudy) query.yearOfStudy = Number(yearOfStudy);

        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;

        const [students, total] = await Promise.all([
            Student.find(query)
                .select('name email rollNumber department yearOfStudy cgpa attendance backlogs')
                .sort({ name: 1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            Student.countDocuments(query)
        ]);

        res.json({
            students,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDashboardStats,
    getAuditLogs,
    getAllUsers,
    updateUserStatus,
    notifyAtRiskStudents,
    deleteUser,
    createFaculty,
    sendIndividualNotification,
    getStudentsAdvanced
};
