const { setServers } = require('node:dns');

setServers(['1.1.1.1', '8.8.8.8']);
require('dotenv').config();

const mongoose = require('mongoose');
const User = require('./models/User');

const seedAdmin = async () => {
    try {
        // Connect to MongoDB
        if (!process.env.MONGO_URI) {
            console.error('MONGO_URI not found in .env file');
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for Seeding...');

        // Check if user already exists
        const existingUser = await User.findOne({ email: 'hrdemo@gmail.com' });
        if (existingUser) {
            console.log('User demohr (hrdemo@gmail.com) already exists in database.');
            process.exit(0);
        }

        // Create new user, password will be auto-hashed by pre('save') hook in User model
        const adminUser = new User({
            name: 'demohr',
            email: 'hrdemo@gmail.com',
            password: 'demo123',
            role: 'admin'
        });

        await adminUser.save();
        console.log('Successfully added HR Administrator account (demohr)!');
        process.exit(0);
    } catch (error) {
        console.error('Error during seeding:', error);
        process.exit(1);
    }
};

seedAdmin();
