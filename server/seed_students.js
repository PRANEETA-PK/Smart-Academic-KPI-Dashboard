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

        // Clear existing students and relevant users to avoid conflicts
        await Student.deleteMany({});
        // We only delete users who were students to keep admin/faculty
        await User.deleteMany({ role: 'student' });
        console.log('Cleared existing student data.');

        const departments = ['Computer Science', 'Electronic & Communication', 'Mechanical Engineering', 'Information Technology'];
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('Student@123', salt);

        const companyPool = [
            { name: "Google", role: "Software Engineer", rounds: 4 },
            { name: "Microsoft", role: "Program Manager", rounds: 5 },
            { name: "Amazon", role: "SDE-1", rounds: 3 },
            { name: "Meta", role: "Data Scientist", rounds: 4 },
            { name: "Apple", role: "Hardware Engineer", rounds: 5 },
            { name: "TCS", role: "System Engineer", rounds: 2 },
            { name: "Infosys", role: "Associate Developer", rounds: 2 }
        ];

        const studentsToCreate = [];
        const usersToCreate = [];

        console.log('Generating 100 students...');

        for (let i = 1; i <= 100; i++) {
            // Determine year and semester
            // 25 students per year
            const year = Math.ceil(i / 25);
            // i=1-25 -> Year 1 (Sem 1-2)
            // i=26-50 -> Year 2 (Sem 3-4)
            // i=51-75 -> Year 3 (Sem 5-6)
            // i=76-100 -> Year 4 (Sem 7-8)

            const semesterCount = (year * 2) - (i % 2 === 0 ? 0 : 1);
            const dept = departments[i % departments.length];
            const email = `year${year}.student${i}@university.edu`;
            const name = `Student ${i}`;

            const user = new User({
                name,
                email,
                password: hashedPassword,
                role: 'student',
                department: dept
            });

            const semesters = [];
            for (let s = 1; s <= semesterCount; s++) {
                const subjects = [];
                const subCount = 4 + (s % 2);
                for (let sub = 1; sub <= subCount; sub++) {
                    subjects.push({
                        subjectName: `Subject ${s}.${sub}`,
                        marks: 60 + Math.floor(Math.random() * 35)
                    });
                }

                semesters.push({
                    semesterName: `Sem ${s}`,
                    sgpa: 6 + (Math.random() * 3.5),
                    subjects
                });
            }

            const cgpa = semesters.reduce((acc, sem) => acc + sem.sgpa, 0) / semesters.length;

            const placementData = [];
            if (semesterCount >= 6) {
                const appCount = 1 + Math.floor(Math.random() * 3);
                for (let a = 0; a < appCount; a++) {
                    const comp = companyPool[Math.floor(Math.random() * companyPool.length)];
                    const status = ["Selected", "Rejected", "In Progress"][Math.floor(Math.random() * 3)];
                    placementData.push({
                        companyName: comp.name,
                        role: comp.role,
                        status: status,
                        roundsCleared: status === "Selected" ? comp.rounds : Math.floor(Math.random() * comp.rounds),
                        totalRounds: comp.rounds,
                        date: new Date(2026, 1, Math.floor(Math.random() * 28) + 1)
                    });
                }
            }

            const student = new Student({
                user: user._id,
                name,
                email,
                rollNumber: `ROLL${2021000 + i}`,
                department: dept,
                attendance: 65 + Math.floor(Math.random() * 30),
                cgpa: parseFloat(cgpa.toFixed(2)),
                yearOfStudy: year,
                semesters: semesters,
                placementData: placementData
            });

            usersToCreate.push(user);
            studentsToCreate.push(student);
        }

        await User.insertMany(usersToCreate);
        await Student.insertMany(studentsToCreate);

        console.log('Successfully seeded 100 students with emails reflecting their year.');
        console.log('Example: year3.student55@university.edu | Password: Student@123');

        process.exit();
    } catch (err) {
        console.error('Error seeding data:', err);
        process.exit(1);
    }
};

seedData();
