
import express from 'express';

import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js';

import {
  protect,
  authorize
} from '../middleware/authMiddleware.js';

const router = express.Router();

// GET ALL PRODUCTS
router.get(
  '/',
  protect,
  getProducts
);

// GET SINGLE PRODUCT
router.get(
  '/:id',
  protect,
  getProductById
);

// CREATE PRODUCT - OWNER ONLY
router.post(
  '/',
  protect,
  authorize('OWNER'),
  createProduct
);

// UPDATE PRODUCT - OWNER ONLY
router.put(
  '/:id',
  protect,
  authorize('OWNER'),
  updateProduct
);

// DELETE PRODUCT - OWNER ONLY
router.delete(
  '/:id',
  protect,
  authorize('OWNER'),
  deleteProduct
);

export default router;
