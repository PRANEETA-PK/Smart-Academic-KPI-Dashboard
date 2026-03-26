const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Student = require('./models/studentModel');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const check = async () => {
    const students = await Student.find({});
    students.forEach(s => {
        console.log(`${s.name}: ${s.semesters.length} semesters, ${s.placementData.length} companies`);
    });
    process.exit();
};
check();
