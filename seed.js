const { setServers } = require('node:dns');

setServers(['1.1.1.1', '8.8.8.8']);
require('dotenv').config();

const mongoose = require('mongoose');
const User = require('./models/User');

const seedAdmin = async () => {
    try {
        // Koneksi ke MongoDB
        if (!process.env.MONGO_URI) {
            console.error('MONGO_URI tidak ditemukan di file .env');
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for Seeding...');

        // Cek apakah user sudah ada
        const existingUser = await User.findOne({ email: 'hrdemo@gmail.com' });
        if (existingUser) {
            console.log('User demohr (hrdemo@gmail.com) sudah ada di database.');
            process.exit(0);
        }

        // Buat user baru, password akan di-hash otomatis oleh pre('save') di model User
        const adminUser = new User({
            name: 'demohr',
            email: 'hrdemo@gmail.com',
            password: 'demo123',
            role: 'admin'
        });

        await adminUser.save();
        console.log(' Berhasil menambahkan akun HR Administrator (demohr)!');
        process.exit(0);
    } catch (error) {
        console.error(' Error saat melakukan seeding:', error);
        process.exit(1);
    }
};

seedAdmin();
