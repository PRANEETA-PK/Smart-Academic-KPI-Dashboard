const mongoose = require('mongoose');
const User = require('./models/userModel');
const Student = require('./models/studentModel');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const inspectData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log('--- Fetching 10 students for Quick Login ---');
        const studentUsers = await User.find({ role: 'student' }).limit(10);
        const creds = studentUsers.map(u => ({ name: u.name, email: u.email }));
        console.log(JSON.stringify(creds, null, 2));

        console.log('\n--- Inspecting Subject Data for first 3 students ---');
        const students = await Student.find().limit(3);
        students.forEach(s => {
            console.log(`Student: ${s.name} (${s.email})`);
            s.semesters.forEach(sem => {
                console.log(`  ${sem.semesterName}: ${sem.subjects.length} subjects`);
                sem.subjects.forEach(subj => console.log(`    - ${subj.subjectName}: ${subj.marks}`));
            });
        });

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

inspectData();
