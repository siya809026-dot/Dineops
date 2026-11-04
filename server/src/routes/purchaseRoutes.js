
import express from 'express';

import {
  createPurchase,
  getPurchases,
  getPurchaseById,
  createGoodsReceipt,
  getGoodsReceipts,
  getGoodsReceiptById
} from '../controllers/purchaseController.js';

import {
  protect,
  authorize
} from '../middleware/authMiddleware.js';

const router = express.Router();

const purchaseManagers = [
  'OWNER',
  'BRANCH_MANAGER',
  'FRANCHISE_MANAGER'
];

// Purchase orders
router.get('/', protect, getPurchases);

router.post(
  '/',
  protect,
  authorize(...purchaseManagers),
  createPurchase
);

// GRN routes — keep these before /:id
router.get('/grn', protect, getGoodsReceipts);

router.get('/grn/:id', protect, getGoodsReceiptById);

// Receive full or partial goods against a purchase order
router.post(
  '/:id/receive',
  protect,
  authorize(...purchaseManagers),
  createGoodsReceipt
);

// Single purchase order
router.get('/:id', protect, getPurchaseById);

export default router;
