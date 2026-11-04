
import express from 'express';

import {
  createWastage,
  getWastages,
  getWastageById
} from '../controllers/wastageController.js';

import {
  getWastageAnalytics
} from '../controllers/wastageAnalyticsController.js';

import {
  protect,
  authorize
} from '../middleware/authMiddleware.js';

const router = express.Router();

// Wastage analytics — keep before /:id
router.get(
  '/analytics',
  protect,
  authorize('OWNER', 'BRANCH_MANAGER', 'FRANCHISE_MANAGER'),
  getWastageAnalytics
);

// View all wastage records
router.get('/', protect, getWastages);

// View a single wastage record
router.get('/:id', protect, getWastageById);

// Record wastage
router.post(
  '/',
  protect,
  authorize('OWNER', 'BRANCH_MANAGER', 'FRANCHISE_MANAGER'),
  createWastage
);

export default router;
