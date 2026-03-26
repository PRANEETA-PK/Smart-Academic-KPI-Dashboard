const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const User = require('./models/userModel');
const Student = require('./models/studentModel');
const Faculty = require('./models/facultyModel');
const AuditLog = require('./models/auditLogModel');
const connectDB = require('./config/db');

dotenv.config({ path: path.join(__dirname, '.env') });
connectDB();

const importData = async () => {
    try {
        // Clear existing data
        await Student.deleteMany();
        await User.deleteMany();
        await Faculty.deleteMany();
        await AuditLog.deleteMany();

        // Create Admin
        const adminUser = await User.create({
            name: 'System Admin',
            email: 'admin@university.edu',
            password: 'admin123',
            role: 'admin'
        });

        // Create Faculty
        const facultyUser1 = await User.create({
            name: 'Dr. Rajesh Kumar',
            email: 'rajesh@university.edu',
            password: 'faculty123',
            role: 'faculty',
            department: 'Computer Science'
        });

        const facultyUser2 = await User.create({
            name: 'Prof. Anita Sharma',
            email: 'anita@university.edu',
            password: 'faculty123',
            role: 'faculty',
            department: 'Mechanical Engineering'
        });

        await Faculty.create([
            {
                user: facultyUser1._id,
                name: 'Dr. Rajesh Kumar',
                email: 'rajesh@university.edu',
                department: 'Computer Science',
                designation: 'Professor',
                syllabusProgress: [
                    { subject: 'Data Structures', lessonsPlanned: 40, lessonsCompleted: 35 },
                    { subject: 'Algorithms', lessonsPlanned: 45, lessonsCompleted: 20 }
                ]
            },
            {
                user: facultyUser2._id,
                name: 'Prof. Anita Sharma',
                email: 'anita@university.edu',
                department: 'Mechanical Engineering',
                designation: 'Associate Professor',
                syllabusProgress: [
                    { subject: 'Thermodynamics', lessonsPlanned: 50, lessonsCompleted: 15 }
                ]
            }
        ]);

        // Generate N=100 students for realistic data
        const departments = ['Computer Science', 'Mechanical Engineering', 'Electrical Engineering', 'Information Technology', 'Civil Engineering'];
        const batches = ['2022-2026', '2023-2027', '2021-2025', '2024-2028'];
        const companyNames = ['Google', 'Microsoft', 'Amazon', 'TATA', 'Infosys', 'Wipro', 'Accenture', 'ZOHO', 'Intel', 'AMD'];

        const firstNames = ['Arjun', 'Aditi', 'Rohan', 'Priya', 'Vikram', 'Ananya', 'Siddharth', 'Ishani', 'Karan', 'Sanya', 'Varun', 'Riya', 'Akash', 'Meera', 'Rahul', 'Sneha', 'Deepak', 'Kavya', 'Manish', 'Tanvi'];
        const lastNames = ['Sharma', 'Verma', 'Gupta', 'Malhotra', 'Iyer', 'Reddy', 'Patel', 'Singh', 'Khan', 'Nair', 'Chopra', 'Joshi', 'Aggarwal', 'Tiwari', 'Das', 'Bose', 'Menon', 'Rao', 'Pandey', 'Mishra'];

        for (let i = 1; i <= 100; i++) {
            const dept = departments[Math.floor(Math.random() * departments.length)];
            const batch = batches[Math.floor(Math.random() * batches.length)];
            const startYear = parseInt(batch.split('-')[0]);
            const yearOfStudy = Math.min(4, Math.max(1, (2025 - startYear) + 1));

            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            const name = `${firstName} ${lastName}`;
            const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@university.edu`;
            const roll = `${dept.substring(0, 2).toUpperCase()}${2100 + i}`;

            const user = await User.create({
                name,
                email,
                password: 'student123',
                role: 'student',
                department: dept
            });

            // Academic Data (Max 8 semesters)
            const semesters = [];
            const completedSems = Math.min(8, (yearOfStudy * 2) - 1);
            for (let s = 1; s <= completedSems; s++) {
                semesters.push({
                    semesterName: `Semester ${s}`,
                    sgpa: (6.5 + Math.random() * 3.5).toFixed(2),
                    subjects: [
                        { subjectName: 'Theory 1', marks: Math.floor(60 + Math.random() * 40) },
                        { subjectName: 'Theory 2', marks: Math.floor(60 + Math.random() * 40) },
                        { subjectName: 'Theory 3', marks: Math.floor(60 + Math.random() * 40) },
                        { subjectName: 'Elective', marks: Math.floor(60 + Math.random() * 40) },
                        { subjectName: 'Lab Activity', marks: Math.floor(80 + Math.random() * 20) }
                    ]
                });
            }

            // Placement Data based on year
            const placementData = [];
            if (yearOfStudy >= 3) {
                const numCompanies = yearOfStudy === 4 ? Math.floor(10 + Math.random() * 5) : Math.floor(2 + Math.random() * 3);
                for (let c = 0; c < numCompanies; c++) {
                    const statusVal = Math.random();
                    placementData.push({
                        companyName: companyNames[Math.floor(Math.random() * companyNames.length)],
                        role: 'Software Engineer',
                        status: statusVal > 0.8 ? 'Selected' : (statusVal > 0.4 ? 'Rejected' : 'In Progress'),
                        roundsCleared: Math.floor(Math.random() * 4),
                        totalRounds: 4,
                        date: new Date()
                    });
                }
            }

            await Student.create({
                user: user._id,
                name,
                email,
                rollNumber: roll,
                department: dept,
                batch,
                yearOfStudy,
                attendance: Math.floor(75 + Math.random() * 20),
                cgpa: semesters.length > 0 ? (semesters.reduce((acc, s) => acc + parseFloat(s.sgpa), 0) / semesters.length).toFixed(2) : 0,
                semesters,
                placementData
            });
        }

        // Create initial Audit Logs
        await AuditLog.create([
            { admin: adminUser._id, action: 'Bulk Upload', details: `Imported 100 students` },
            { admin: adminUser._id, action: 'System Config', details: 'Initialized Departmental KPIs' }
        ]);

        console.log('Data Imported Successfully!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

importData();
