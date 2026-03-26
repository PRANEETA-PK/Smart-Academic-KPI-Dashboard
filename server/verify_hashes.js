const mongoose = require('mongoose');
const User = require('./models/userModel');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const verifyOne = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ email: 'praneeta.cs3@gmail.com' });
        if (!user) {
            console.log('User NOT found');
        } else {
            console.log('User found:', user.email);
            console.log('Stored Pass Hash:', user.password);
            const isMatch = await bcrypt.compare('student123', user.password);
            console.log('Manual Match with student123:', isMatch);

            const admin = await User.findOne({ email: 'admin@university.edu' });
            if (admin) {
                const isAdminMatch = await bcrypt.compare('admin123', admin.password);
                console.log('Admin match with admin123:', isAdminMatch);
            }
        }
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

verifyOne();
