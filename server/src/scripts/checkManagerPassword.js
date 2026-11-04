import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import connectDB from '../config/db.js';
import User from '../models/User.js';

dotenv.config();

const checkPassword = async () => {
  try {
    await connectDB();

    const manager = await User.findOne({
      email: 'manager@pindijunction.com'
    }).select('+password');

    if (!manager) {
      console.log('Manager account not found');
      return;
    }

    const password = 'ENTER_YOUR_MANAGER_PASSWORD';

    const result = await bcrypt.compare(
      password,
      manager.password
    );

    console.log('Manager email:', manager.email);
    console.log('Manager role:', manager.role);
    console.log('Password matches:', result);

  } catch (error) {
    console.error(error.message);
  } finally {
    await mongoose.disconnect();
  }
};

checkPassword();