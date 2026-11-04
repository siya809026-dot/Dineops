import express from 'express';

import {
  getRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe
} from '../controllers/recipeController.js';

import {
  protect,
  authorize
} from '../middleware/authMiddleware.js';

const router = express.Router();

// GET ALL RECIPES
router.get(
  '/',
  protect,
  getRecipes
);

// GET SINGLE RECIPE
router.get(
  '/:id',
  protect,
  getRecipeById
);

// CREATE RECIPE
router.post(
  '/',
  protect,
  authorize('OWNER'),
  createRecipe
);

// UPDATE RECIPE
router.put(
  '/:id',
  protect,
  authorize('OWNER'),
  updateRecipe
);

// DELETE RECIPE
router.delete(
  '/:id',
  protect,
  authorize('OWNER'),
  deleteRecipe
);

export default router;