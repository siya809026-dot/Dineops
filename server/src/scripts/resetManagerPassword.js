import dotenv from 'dotenv';
import mongoose from 'mongoose';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import bcrypt from 'bcryptjs';

import connectDB from '../config/db.js';
import User from '../models/User.js';

dotenv.config();

const rl = readline.createInterface({ input, output });

const resetPassword = async () => {
  try {
    await connectDB();

    const manager = await User.findOne({
      email: 'manager@pindijunction.com'
    }).select('+password');

    if (!manager || manager.role !== 'BRANCH_MANAGER') {
      console.log('Branch Manager account not found.');
      return;
    }

    const password = await rl.question(
      'Enter new password (minimum 8 characters): ',
      { hideEchoBack: true }
    );

    const confirmPassword = await rl.question(
      'Confirm new password: ',
      { hideEchoBack: true }
    );

    if (password.length < 8 || password !== confirmPassword) {
      console.log('Password invalid or confirmation does not match.');
      return;
    }

    manager.password = password;
    await manager.save();

    // Verify immediately using the saved hash
    const updatedManager = await User.findById(manager._id)
      .select('+password');

    const isMatch = await bcrypt.compare(
      password,
      updatedManager.password
    );

    console.log('\nPassword reset result:', isMatch);
    console.log('Manager email:', updatedManager.email);
    console.log('Manager role:', updatedManager.role);
    console.log('Branch assignment preserved:', Boolean(updatedManager.branchId));

  } catch (error) {
    console.error('Password reset failed:', error.message);
  } finally {
    rl.close();
    await mongoose.disconnect();
  }
};

resetPassword();