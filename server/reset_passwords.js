const mongoose = require('mongoose');
const User = require('./models/userModel');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const resetPasswords = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const count = await User.countDocuments({ role: 'student' });
        console.log(`Total students found in User collection: ${count}`);

        if (count > 0) {
            console.log('Resetting all student passwords to "student123"...');
            // We need to trigger the 'save' hook for hashing, or hash manually.
            // Using find and then loop is safer to ensure hooks run, but updates are also possible if we hash here.

            const students = await User.find({ role: 'student' });
            for (const student of students) {
                student.password = 'student123';
                await student.save();
            }
            console.log('Passwords reset successfully.');
        } else {
            console.log('No students found to reset.');
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

resetPasswords();
