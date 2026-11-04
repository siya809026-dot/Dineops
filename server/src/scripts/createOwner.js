import 'dotenv/config';
import mongoose from 'mongoose';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

import connectDB from '../config/db.js';
import User from '../models/User.js';

const rl = readline.createInterface({ input, output });

const createOwner = async () => {
  try {
    await connectDB();

    const existingOwner = await User.findOne({ role: 'OWNER' });

    if (existingOwner) {
      console.log('An OWNER account already exists.');
      return;
    }

    const name = await rl.question('Enter owner name: ');
    const email = await rl.question('Enter owner email: ');
    const password = await rl.question('Enter owner password: ');

    if (!name.trim() || !email.trim() || password.length < 6) {
      console.log('Invalid details. Password must be at least 6 characters.');
      return;
    }

    const existingUser = await User.findOne({
      email: email.trim().toLowerCase()
    });

    if (existingUser) {
      console.log('This email is already registered. Use another email.');
      return;
    }

    const owner = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: 'OWNER',
      branchId: null,
      franchiseId: null
    });

    console.log('\nOWNER account created successfully!');
    console.log('Owner ID:', owner._id);
    console.log('Email:', owner.email);

  } catch (error) {
    console.error('Owner creation failed:', error.message);
  } finally {
    rl.close();
    await mongoose.disconnect();
  }
};

createOwner();