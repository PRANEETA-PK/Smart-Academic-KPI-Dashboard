const mongoose = require('mongoose');
const User = require('./models/userModel');
const Student = require('./models/studentModel');
const Faculty = require('./models/facultyModel');
const AuditLog = require('./models/auditLogModel');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB...');

        // FULL WIPE
        await Student.deleteMany({});
        await User.deleteMany({});
        await Faculty.deleteMany({});
        await AuditLog.deleteMany({});
        console.log('Cleared existing data.');

        const departments = [
            {
                name: 'Computer Science',
                code: 'cs',
                subjects: ["Data Structures", "Algorithms", "Operating Systems", "DBMS", "Computer Networks"]
            },
            {
                name: 'Electronic & Communication',
                code: 'ec',
                subjects: ["Digital Electronics", "Microprocessors", "Signal Processing", "VLSI Design", "Control Systems"]
            },
            {
                name: 'Mechanical Engineering',
                code: 'me',
                subjects: ["Thermodynamics", "Fluid Mechanics", "Strength of Materials", "Manufacturing Tech", "Machine Design"]
            },
            {
                name: 'Information Technology',
                code: 'it',
                subjects: ["Cloud Computing", "Cyber Security", "Information Retrieval", "Mobile Computing", "Data Science"]
            }
        ];

        // 1. Create Admin
        const admin = await User.create({
            name: 'System Admin',
            email: 'admin@university.edu',
            password: 'admin123',
            role: 'admin'
        });
        console.log('Created Admin: admin@university.edu');

        // 2. Create Faculty
        for (const dept of departments) {
            const facultyUser = await User.create({
                name: `Dr. ${dept.name} Professor`,
                email: `prof.${dept.code}@university.edu`,
                password: 'faculty123',
                role: 'faculty',
                department: dept.name
            });

            await Faculty.create({
                user: facultyUser._id,
                name: facultyUser.name,
                email: facultyUser.email,
                department: dept.name,
                designation: 'Department Head',
                syllabusProgress: dept.subjects.map(sub => ({
                    subject: sub,
                    lessonsPlanned: 30,
                    lessonsCompleted: Math.floor(Math.random() * 25) + 5
                }))
            });
            console.log(`Created Faculty: ${facultyUser.email}`);
        }

        const studentNames = [
            "Praneeta", "Aravind", "Bhavya", "Chaitra", "Deepak", "Meera", "Farhan", "Gautam", "Hema", "Ishaan",
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

        // Specific Year mapping for First 6 students to match Login.jsx
        const studentConfig = {
            "Praneeta": { deptCode: 'cs', year: 3 },
            "Aravind": { deptCode: 'ec', year: 4 },
            "Bhavya": { deptCode: 'me', year: 1 },
            "Chaitra": { deptCode: 'it', year: 2 },
            "Deepak": { deptCode: 'cs', year: 3 },
            "Meera": { deptCode: 'it', year: 1 }
        };

        console.log('Generating 100 students...');

        for (let i = 0; i < 100; i++) {
            const name = studentNames[i];
            let deptObj, year;

            if (studentConfig[name] && i < 6) {
                deptObj = departments.find(d => d.code === studentConfig[name].deptCode);
                year = studentConfig[name].year;
            } else {
                deptObj = departments[i % departments.length];
                year = (i % 4) + 1;
            }

            const email = `${name.toLowerCase()}.${deptObj.code}${year}@gmail.com`;

            const user = await User.create({
                name,
                email,
                password: 'student123',
                role: 'student',
                department: deptObj.name
            });

            const semesterCount = year * 2;
            const semesters = [];
            for (let s = 1; s <= semesterCount; s++) {
                const subCount = 5;
                const selectedSubjects = [...deptObj.subjects].sort(() => 0.5 - Math.random()).slice(0, subCount);

                semesters.push({
                    semesterName: `Sem ${s}`,
                    sgpa: 6 + (Math.random() * 3.5),
                    subjects: selectedSubjects.map(subName => ({
                        subjectName: subName,
                        marks: 60 + Math.floor(Math.random() * 35)
                    }))
                });
            }

            const cgpa = semesters.reduce((acc, sem) => acc + sem.sgpa, 0) / semesters.length;

            await Student.create({
                user: user._id,
                name,
                email,
                rollNumber: `${deptObj.code.toUpperCase()}${i + 1000}`,
                department: deptObj.name,
                attendance: 55 + Math.floor(Math.random() * 40),
                cgpa: parseFloat(cgpa.toFixed(2)),
                yearOfStudy: year,
                semesters
            });

            if (i < 6) console.log(`Created Student: ${email}`);
        }

        await AuditLog.create({
            admin: admin._id,
            action: 'Institutional Seed Complete',
            details: 'Corrected credentials for 100 students and staff.'
        });

        console.log('FINISHED: System re-seeded correctly.');
        process.exit();
    } catch (err) {
        console.error('Error during seed:', err);
        process.exit(1);
    }
};

seedData();
