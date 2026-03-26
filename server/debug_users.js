const mongoose = require('mongoose');
const User = require('./models/userModel');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({ role: 'student' }).limit(10);
        console.log('--- STUDENT USERS (First 10) ---');
        users.forEach(u => console.log(`Email: ${u.email} | Name: ${u.name}`));

        const admin = await User.findOne({ role: 'admin' });
        console.log(`\nAdmin: ${admin ? admin.email : 'NOT FOUND'}`);

        const faculty = await User.findOne({ role: 'faculty' });
        console.log(`Faculty: ${faculty ? faculty.email : 'NOT FOUND'}`);

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkUsers();
