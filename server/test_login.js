const mongoose = require('mongoose');
const User = require('./models/userModel');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const testLogin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const email = 'praneeta.cs3@gmail.com';
        const pass = 'student123';

        const user = await User.findOne({ email });
        if (!user) {
            console.log('User NOT found');
        } else {
            console.log('User found:', user.email);
            console.log('Stored hash:', user.password);
            const isMatch = await user.matchPassword(pass);
            console.log('Match result:', isMatch);
        }
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

testLogin();
