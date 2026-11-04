
import express from 'express';
import mongoose from 'mongoose';

import User from '../models/User.js';
import Branch from '../models/Branch.js';

import {
  loginUser,
  getMe
} from '../controllers/authController.js';

import {
  protect,
  authorize
} from '../middleware/authMiddleware.js';

const router = express.Router();

// LOGIN
router.post('/login', loginUser);

// GET LOGGED-IN USER
router.get('/me', protect, getMe);

// CREATE BRANCH MANAGER (OWNER ONLY)
router.post(
  '/create-manager',
  protect,
  authorize('OWNER'),
  async (req, res) => {
    try {
      const { name, email, password, branchId } = req.body;

      if (!name || !email || !password || !branchId) {
        return res.status(400).json({
          success: false,
          message: 'Please provide all required fields.'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must contain at least 6 characters.'
        });
      }

      if (!mongoose.Types.ObjectId.isValid(branchId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid branch ID.'
        });
      }

      const branch = await Branch.findById(branchId);

      if (!branch) {
        return res.status(404).json({
          success: false,
          message: 'Branch not found.'
        });
      }

      if (branch.type !== 'Branch Kitchen') {
        return res.status(400).json({
          success: false,
          message: 'A Branch Manager must be assigned to a Branch Kitchen.'
        });
      }

      const normalizedEmail = email.trim().toLowerCase();

      const existingUser = await User.findOne({
        email: normalizedEmail
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'A user with this email already exists.'
        });
      }

      const manager = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password,
        role: 'BRANCH_MANAGER',
        branchId: branch._id
      });

      return res.status(201).json({
        success: true,
        message: 'Branch Manager created successfully.',
        user: {
          id: manager._id,
          name: manager.name,
          email: manager.email,
          role: manager.role,
          branchId: manager.branchId
        }
      });

    } catch (error) {
      console.error('Create Manager Error:', error.message);

      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'This email is already registered.'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Unable to create Branch Manager.'
      });
    }
  }
);

export default router;
