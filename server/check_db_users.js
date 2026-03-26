const mongoose = require('mongoose');
const User = require('./models/userModel');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const emails = [
            'yamini.cs1@gmail.com',
            'zane.ec2@gmail.com',
            'ananya.cs3@gmail.com',
            'praveen.cs3@gmail.com'
        ];

        for (const email of emails) {
            const user = await User.findOne({ email });
            if (!user) {
                console.log(`[x] User NOT found: ${email}`);
            } else {
                const isMatch = await user.matchPassword('student123');
                console.log(`[o] User found: ${email} | Password Match ('student123'): ${isMatch} | Role: ${user.role}`);
            }
        }

        // Also list first 5 users to see pattern
        console.log('\nFirst 5 users in DB:');
        const allUsers = await User.find().limit(5);
        allUsers.forEach(u => console.log(`- ${u.email} (${u.role})`));

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkUsers();
