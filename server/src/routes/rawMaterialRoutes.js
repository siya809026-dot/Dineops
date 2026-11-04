
import express from 'express';

import {
  getRawMaterials,
  getRawMaterialById,
  createRawMaterial,
  updateRawMaterial,
  deleteRawMaterial
} from '../controllers/rawMaterialController.js';

import {
  protect,
  authorize
} from '../middleware/authMiddleware.js';

const router = express.Router();

// GET ALL RAW MATERIALS
router.get(
  '/',
  protect,
  getRawMaterials
);

// GET SINGLE RAW MATERIAL
router.get(
  '/:id',
  protect,
  getRawMaterialById
);

// CREATE RAW MATERIAL - OWNER ONLY
router.post(
  '/',
  protect,
  authorize('OWNER'),
  createRawMaterial
);

// UPDATE RAW MATERIAL - OWNER ONLY
router.put(
  '/:id',
  protect,
  authorize('OWNER'),
  updateRawMaterial
);

// DELETE RAW MATERIAL - OWNER ONLY
router.delete(
  '/:id',
  protect,
  authorize('OWNER'),
  deleteRawMaterial
);

export default router;
