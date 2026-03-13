import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (adminExists) {
      console.log('⚠️ Admin already exists:');
      console.log('   Email:', adminExists.email);
      process.exit(0);
    }

    // Manually hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Create admin user with hashed password
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@hrsystem.com',
      password: hashedPassword, // Manually hashed
      role: 'admin',
      dateOfJoining: new Date(),
      leaveBalance: 0
    });

    console.log('✅ Admin created successfully:');
    console.log('   Name:', admin.name);
    console.log('   Email:', admin.email);
    console.log('   Password: admin123');
    console.log('   Role:', admin.role);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    if (error.code === 11000) {
      console.error('   Duplicate email error. Admin might already exist.');
    }
    process.exit(1);
  }
};

createAdmin();
