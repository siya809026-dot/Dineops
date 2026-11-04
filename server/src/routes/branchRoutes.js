
import express from 'express';

import {
  getBranches,
  getBranchById,
  createBranch,
  updateBranch,
  deleteBranch
} from '../controllers/branchController.js';

import {
  protect,
  authorize
} from '../middleware/authMiddleware.js';

const router = express.Router();

// GET ALL BRANCHES
router.get(
  '/',
  protect,
  getBranches
);

// GET SINGLE BRANCH
router.get(
  '/:id',
  protect,
  getBranchById
);

// CREATE BRANCH - OWNER ONLY
router.post(
  '/',
  protect,
  authorize('OWNER'),
  createBranch
);

// UPDATE BRANCH - OWNER ONLY
router.put(
  '/:id',
  protect,
  authorize('OWNER'),
  updateBranch
);

// DELETE BRANCH - OWNER ONLY
router.delete(
  '/:id',
  protect,
  authorize('OWNER'),
  deleteBranch
);

export default router;
