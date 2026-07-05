import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const email = 'sai0907karthik@gmail.com';
    const existing = await User.findOne({ email });

    if (existing) {
      existing.role = 'admin';
      await existing.save();
      console.log('Existing user promoted to admin:', email);
    } else {
      await User.create({
        name: 'Karthik(Admin)',
        email,
        password: 'Karthik@0907',
        role: 'admin',
      });
      console.log('Admin user created:', email, '/ password: Karthik@0907');
    }

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
};

seedAdmin();
