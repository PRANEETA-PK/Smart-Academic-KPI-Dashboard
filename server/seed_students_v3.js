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

        // Clear existing data COMPLETELY
        await Student.deleteMany({});
        await User.deleteMany({});
        console.log('Cleared existing data.');

        const departments = [
            { name: 'Computer Science', code: 'cs' },
            { name: 'Electronic & Communication', code: 'ec' },
            { name: 'Mechanical Engineering', code: 'me' },
            { name: 'Information Technology', code: 'it' }
        ];

        // NOTE: We bypass pre('save') hash because we specify pre-hashed passwords or we just don't use .save() but .create()
        // Wait, Mongoose .create() calls .save() internally. 
        // To avoid double hashing, we should either:
        // 1. Pass plain text and let the hook hash it.
        // 2. Use insertMany which doesn't trigger hooks.

        const plainAdminPass = 'admin123';
        const plainFacultyPass = 'faculty123';
        const plainStudentPass = 'student123';

        // 1. Create Admin
        await User.create({
            name: 'System Admin',
            email: 'admin@university.edu',
            password: plainAdminPass,
            role: 'admin'
        });

        // 2. Create Faculty (1 per department)
        for (const dept of departments) {
            await User.create({
                name: `Dr. ${dept.name} Professor`,
                email: `prof.${dept.code}@university.edu`,
                password: plainFacultyPass,
                role: 'faculty',
                department: dept.name
            });
        }

        const studentNames = [
            "Praneeta", "Aravind", "Bhavya", "Chaitra", "Deepak", "Esha", "Farhan", "Gautam", "Hema", "Ishaan",
            "Jaya", "Kiran", "Lata", "Manoj", "Neha", "Omkar", "Priya", "Rahul", "Sneha", "Tarun",
            "Uma", "Vijay", "Wasim", "Xavier", "Yash", "Zoya", "Ananya", "Bharat", "Chetan", "Divya",
            "Ekta", "Feroz", "Gauri", "Harish", "Indira", "Jatin", "Kavya", "Lokesh", "Meera", "Nitin",
            "Ojas", "Payal", "Qasim", "Rishi", "Sonia", "Tanmay", "Urmila", "Varun", "Waqar", "Yogesh",
            "Zeenat", "Abhay", "Binita", "Charan", "Dolly", "Ellen", "Faisal", "Geeta", "Hitesh", "Ira",
            "Jaspal", "Kunal", "Leela", "Mohit", "Nandini", "Pankaj", "Rani", "Sahil", "Tripti", "Uday",
            "Vani", "Waman", "Yadu", "Zuber", "Aditi", "Badri", "Chitra", "Darshan", "Eshwar", "Falguni",
            "Gopal", "Hansa", "Irfan", "Jyoti", "Kamal", "Laxmi", "Madhav", "Naveen", "Oma", "Parth",
            "Radha", "Sanjay", "Tulsi", "Utkarsh", "Vidhya", "Waris", "Yamini", "Zane", "Amar", "Bindu"
        ];

        const companyPool = [
            { name: "Google", role: "Software Engineer", rounds: 4 },
            { name: "Microsoft", role: "Program Manager", rounds: 5 },
            { name: "Amazon", role: "SDE-1", rounds: 3 }
        ];

        console.log('Generating 100 students with unique names and dept-year emails...');

        const usersToCreate = [];
        const studentsToCreate = [];

        for (let i = 0; i < 100; i++) {
            const deptObj = departments[i % departments.length];
            // Cycle years 1-4
            const year = (i % 4) + 1;
            const name = studentNames[i];
            const email = `${name.toLowerCase()}.${deptObj.code}${year}@gmail.com`;

            // We use new User then hashing then saving manually to be safe, or just let Mongoose handle it
            // Let's let Mongoose handle it by passing plain text to .create() one by one or using a bulk method that we know works.
            // Actually .create([]) works too.
        }

        // To be absolutely sure, let's do one by one to trigger hooks properly
        for (let i = 0; i < 100; i++) {
            const deptObj = departments[i % departments.length];
            const year = (i % 4) + 1;
            const name = studentNames[i];
            const email = `${name.toLowerCase()}.${deptObj.code}${year}@gmail.com`;

            const user = await User.create({
                name,
                email,
                password: plainStudentPass,
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
