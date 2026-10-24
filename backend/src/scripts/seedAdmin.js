import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/car_dealership';
const ADMIN_NAME = process.env.INITIAL_ADMIN_NAME || 'Admin User';
const ADMIN_EMAIL = process.env.INITIAL_ADMIN_EMAIL || 'admin@dealership.com';
const ADMIN_PASSWORD = process.env.INITIAL_ADMIN_PASSWORD || 'AdminSecurePassword123!';

async function seedAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB database');

    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL.toLowerCase().trim() });
    if (existingAdmin) {
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log(`Updated user ${ADMIN_EMAIL} role to admin.`);
      } else {
        console.log(`Admin user ${ADMIN_EMAIL} already exists.`);
      }
      process.exit(0);
    }

    const admin = new User({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL.toLowerCase().trim(),
      password: ADMIN_PASSWORD,
      role: 'admin'
    });

    await admin.save();
    console.log(`Successfully created initial admin user: ${ADMIN_EMAIL}`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin user:', error.message);
    process.exit(1);
  }
}

seedAdmin();
