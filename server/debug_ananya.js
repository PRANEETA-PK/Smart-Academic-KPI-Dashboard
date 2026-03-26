const mongoose = require('mongoose');
const Student = require('./models/studentModel');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const debugAnanya = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const student = await Student.findOne({ email: 'ananya.malhotra1@university.edu' });
        if (student) {
            console.log(`Student: ${student.name}`);
            console.log(`Year of Study: ${student.yearOfStudy}`);
            console.log(`Semesters Count: ${student.semesters.length}`);
            student.semesters.forEach(s => console.log(`- ${s.semesterName}: SGPA ${s.sgpa}`));
        } else {
            console.log('Ananya not found');
        }
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

debugAnanya();
