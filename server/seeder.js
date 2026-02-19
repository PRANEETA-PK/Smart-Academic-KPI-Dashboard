const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const User = require('./models/userModel');
const Student = require('./models/studentModel');
const connectDB = require('./config/db');

dotenv.config({ path: path.join(__dirname, '.env') });
connectDB();

const importData = async () => {
    try {
        // Clear existing data
        await Student.deleteMany();
        await User.deleteMany(); // Clear all users to avoid conflicts

        // Create Faculty
        await User.create({
            name: 'Rajesh Kumar',
            email: 'rajesh@university.edu',
            password: 'faculty123',
            role: 'faculty'
        });

        // Create Admin
        await User.create({
            name: 'System Admin',
            email: 'admin@university.edu',
            password: 'admin123',
            role: 'admin'
        });

        // Load JSON data - adjust path as needed
        const studentsDataPath = path.join(__dirname, '..', 'client', 'src', 'data', 'studentsData.json');
        const students = JSON.parse(fs.readFileSync(studentsDataPath, 'utf-8'));

        for (const s of students) {
            // 1. Create User
            const user = await User.create({
                name: s.name,
                email: s.email,
                password: 'student123', // Default password for seeded users
                role: 'student'
            });

            // 2. Create Student linked to User
            await Student.create({
                user: user._id,
                name: s.name,
                email: s.email,
                rollNumber: s.rollNumber,
                department: s.department,
                attendance: s.attendance,
                cgpa: s.cgpa,
                semesters: s.semesters
            });

            console.log(`Imported: ${s.name}`);
        }

        console.log('Data Imported Successfully!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

importData();
