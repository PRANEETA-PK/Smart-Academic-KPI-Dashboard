const mongoose = require('mongoose');
const User = require('./models/userModel');
const Student = require('./models/studentModel');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB...');

        // Clear existing data
        await Student.deleteMany({});
        await User.deleteMany({});
        console.log('Cleared existing data.');

        const departments = [
            { name: 'Computer Science', code: 'cs' },
            { name: 'Electronic & Communication', code: 'ec' },
            { name: 'Mechanical Engineering', code: 'me' },
            { name: 'Information Technology', code: 'it' }
        ];

        const salt = await bcrypt.genSalt(10);
        const adminPass = await bcrypt.hash('admin123', salt);
        const facultyPass = await bcrypt.hash('faculty123', salt);
        const studentPass = await bcrypt.hash('student123', salt);

        // 1. Create Admin
        await User.create({
            name: 'System Admin',
            email: 'admin@university.edu',
            password: adminPass,
            role: 'admin'
        });

        // 2. Create Faculty (1 per department)
        const facultyMembers = [];
        for (const dept of departments) {
            const facultyEmail = `prof.${dept.code}@university.edu`;
            const faculty = await User.create({
                name: `Dr. ${dept.name} Professor`,
                email: facultyEmail,
                password: facultyPass,
                role: 'faculty',
                department: dept.name
            });
            facultyMembers.push(faculty);
        }

        const companyPool = [
            { name: "Google", role: "Software Engineer", rounds: 4 },
            { name: "Microsoft", role: "Program Manager", rounds: 5 },
            { name: "Amazon", role: "SDE-1", rounds: 3 }
        ];

        console.log('Generating 100 students (25 per department)...');

        for (let i = 0; i < 100; i++) {
            const deptObj = departments[i % departments.length];
            // 25 students per dept. 
            // Distribution across years
            // i=0-3 (one per dept) -> Year 1
            // ...
            const year = Math.ceil((Math.floor(i / 4) + 1) / 6.25) || 1;
            // Roughly 25 students per year across all depts

            const name = `Student ${i + 1}`;
            const email = `${name.toLowerCase().replace(' ', '.')}.${deptObj.code}${year}@gmail.com`;

            const user = await User.create({
                name,
                email,
                password: studentPass,
                role: 'student',
                department: deptObj.name
            });

            const semesterCount = year * 2;
            const semesters = [];
            for (let s = 1; s <= semesterCount; s++) {
                semesters.push({
                    semesterName: `Sem ${s}`,
                    sgpa: 7 + (Math.random() * 2.5),
                    subjects: [
                        { subjectName: `Subject ${s}.1`, marks: 70 + Math.floor(Math.random() * 25) },
                        { subjectName: `Subject ${s}.2`, marks: 70 + Math.floor(Math.random() * 25) }
                    ]
                });
            }

            const cgpa = semesters.reduce((acc, sem) => acc + sem.sgpa, 0) / semesters.length;

            const placementData = [];
            if (year >= 3) {
                placementData.push({
                    companyName: companyPool[i % companyPool.length].name,
                    role: companyPool[i % companyPool.length].role,
                    status: "In Progress",
                    roundsCleared: 1,
                    totalRounds: companyPool[i % companyPool.length].rounds,
                    date: new Date()
                });
            }

            await Student.create({
                user: user._id,
                name,
                email,
                rollNumber: `${deptObj.code.toUpperCase()}${2021000 + i}`,
                department: deptObj.name,
                attendance: 75 + Math.floor(Math.random() * 20),
                cgpa: parseFloat(cgpa.toFixed(2)),
                yearOfStudy: year,
                semesters,
                placementData
            });
        }

        console.log('Successfully seeded 100 students, 4 faculty, and 1 admin.');
        process.exit();
    } catch (err) {
        console.error('Error seeding data:', err);
        process.exit(1);
    }
};

seedData();
