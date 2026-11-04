
import express from 'express';

import {
  createStockTransfer,
  dispatchStockTransfer,
  receiveStockTransfer,
  getStockTransfers
} from '../controllers/stockTransferController.js';

import {
  protect,
  authorize
} from '../middleware/authMiddleware.js';

const router = express.Router();

const managementRoles = [
  'OWNER',
  'BRANCH_MANAGER',
  'FRANCHISE_MANAGER'
];

// View stock transfers
router.get('/', protect, getStockTransfers);

// Create transfer request
router.post(
  '/',
  protect,
  authorize(...managementRoles),
  createStockTransfer
);

// Dispatch stock from source branch
router.patch(
  '/:id/dispatch',
  protect,
  authorize(...managementRoles),
  dispatchStockTransfer
);

// Receive stock at destination branch
router.patch(
  '/:id/receive',
  protect,
  authorize(...managementRoles),
  receiveStockTransfer
);

export default router;
