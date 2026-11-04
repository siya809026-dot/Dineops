
import express from 'express';

import {
  createSale,
  getSales,
  getSaleById
} from '../controllers/saleController.js';

import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all sales according to user permissions
router.get('/', protect, getSales);

// Get one sale by ID
router.get('/:id', protect, getSaleById);

// Create a new sale
router.post('/', protect, createSale);

export default router;
