const mongoose = require('mongoose');
const User = require('./models/userModel');
const Student = require('./models/studentModel');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const checkYears = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const studentEmails = [
            "praneeta.cs3@gmail.com",
            "aravind.ec4@gmail.com",
            "bhavya.me1@gmail.com",
            "chaitra.it2@gmail.com",
            "deepak.cs3@gmail.com",
            "meera.it1@gmail.com",
            "farhan.me3@gmail.com",
            "gautam.it4@gmail.com",
            "hema.cs1@gmail.com",
            "ishaan.ec2@gmail.com"
        ];

        console.log('--- Student Year Verification ---');
        for (const email of studentEmails) {
            const student = await Student.findOne({ email });
            if (student) {
                console.log(`Email: ${email} | Name: ${student.name} | Year: ${student.yearOfStudy} | Sems: ${student.semesters.length}`);
            } else {
                console.log(`Email: ${email} | NOT FOUND in Student collection`);
            }
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkYears();
