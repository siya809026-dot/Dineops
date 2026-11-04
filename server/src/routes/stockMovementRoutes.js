import express from 'express';
import { getStockMovements } from '../controllers/stockMovementController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET: Fetch stock movement history
router.get('/', protect, getStockMovements);

export default router;