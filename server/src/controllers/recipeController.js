
import mongoose from 'mongoose';

import Recipe from '../models/Recipe.js';
import Product from '../models/Product.js';
import RawMaterial from '../models/RawMaterial.js';
import Branch from '../models/Branch.js';

// GET ALL RECIPES
export const getRecipes = async (req, res) => {
  try {
    const filter = { isActive: true };

    if (req.user.role === 'BRANCH_MANAGER') {
      if (!req.user.branchId) {
        return res.status(403).json({
          success: false,
          message: 'No branch assigned to this user.'
        });
      }

      filter.branchId = req.user.branchId;
    } else if (req.user.role === 'OWNER') {
      if (req.query.branchId) {
        if (!mongoose.Types.ObjectId.isValid(req.query.branchId)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid branch ID.'
          });
        }

        filter.branchId = req.query.branchId;
      }
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied.'
      });
    }

    const recipes = await Recipe.find(filter)
      .populate('productId', 'name sku category')
      .populate('branchId', 'name city')
      .populate({
        path: 'ingredients.rawMaterialId',
        select: 'name sku category unit'
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: recipes.length,
      recipes
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// GET RECIPE BY ID
export const getRecipeById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid recipe ID.'
      });
    }

    const recipe = await Recipe.findOne({
      _id: id,
      isActive: true
    })
      .populate('productId', 'name sku category')
      .populate('branchId', 'name city')
      .populate({
        path: 'ingredients.rawMaterialId',
        select: 'name sku category unit'
      });

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found.'
      });
    }

    if (req.user.role === 'BRANCH_MANAGER') {
      if (
        !req.user.branchId ||
        !recipe.branchId ||
        recipe.branchId._id.toString() !== req.user.branchId.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: 'Access denied for this branch.'
        });
      }
    } else if (req.user.role !== 'OWNER') {
      return res.status(403).json({
        success: false,
        message: 'Access denied.'
      });
    }

    return res.status(200).json({
      success: true,
      recipe
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// CREATE RECIPE
export const createRecipe = async (req, res) => {
  try {
    const {
      productId,
      branchId,
      ingredients,
      preparationNotes
    } = req.body;

    // Check required fields
    if (
      !productId ||
      !branchId ||
      !Array.isArray(ingredients) ||
      ingredients.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Product, branch and ingredients are required.'
      });
    }

    // Validate IDs
    if (
      !mongoose.Types.ObjectId.isValid(productId) ||
      !mongoose.Types.ObjectId.isValid(branchId)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product or branch ID.'
      });
    }

    // Check branch
    const branch = await Branch.findById(branchId);

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: 'Branch not found.'
      });
    }

    // Find product by ID first
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product ID does not exist.'
      });
    }

    // Check whether product has branchId
    if (!product.branchId) {
      return res.status(400).json({
        success: false,
        message: 'Product has no branchId assigned.'
      });
    }

    // Compare product branch with requested branch
    if (product.branchId.toString() !== branchId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Branch ID mismatch. Product belongs to a different branch.'
      });
    }

    // Validate ingredients
    for (const ingredient of ingredients) {
      if (
        !ingredient.rawMaterialId ||
        !mongoose.Types.ObjectId.isValid(ingredient.rawMaterialId) ||
        !Number.isFinite(Number(ingredient.quantity)) ||
        Number(ingredient.quantity) <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: 'Each ingredient needs a valid raw material and positive quantity.'
        });
      }

      const rawMaterial = await RawMaterial.findOne({
        _id: ingredient.rawMaterialId,
        branchId,
        isActive: true
      });

      if (!rawMaterial) {
        return res.status(404).json({
          success: false,
          message: 'Raw material not found in this branch.'
        });
      }
    }

    // Create recipe
    const recipe = await Recipe.create({
      productId,
      branchId,
      ingredients,
      preparationNotes
    });

    const populatedRecipe = await Recipe.findById(recipe._id)
      .populate('productId', 'name sku category')
      .populate('branchId', 'name city')
      .populate({
        path: 'ingredients.rawMaterialId',
        select: 'name sku category unit'
      });

    return res.status(201).json({
      success: true,
      message: 'Recipe created successfully.',
      recipe: populatedRecipe
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A recipe already exists for this product and branch.'
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// UPDATE RECIPE
export const updateRecipe = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid recipe ID.'
      });
    }

    const recipe = await Recipe.findOne({
      _id: id,
      isActive: true
    });

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found.'
      });
    }

    const allowedFields = [
      'ingredients',
      'preparationNotes'
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        recipe[field] = req.body[field];
      }
    }

    // Validate updated ingredients
    if (req.body.ingredients !== undefined) {
      if (
        !Array.isArray(req.body.ingredients) ||
        req.body.ingredients.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: 'At least one ingredient is required.'
        });
      }

      for (const ingredient of req.body.ingredients) {
        if (
          !ingredient.rawMaterialId ||
          !mongoose.Types.ObjectId.isValid(ingredient.rawMaterialId) ||
          !Number.isFinite(Number(ingredient.quantity)) ||
          Number(ingredient.quantity) <= 0
        ) {
          return res.status(400).json({
            success: false,
            message: 'Invalid ingredient or quantity.'
          });
        }

        const rawMaterial = await RawMaterial.findOne({
          _id: ingredient.rawMaterialId,
          branchId: recipe.branchId,
          isActive: true
        });

        if (!rawMaterial) {
          return res.status(404).json({
            success: false,
            message: 'Raw material not found in this branch.'
          });
        }
      }
    }

    await recipe.save();

    const updatedRecipe = await Recipe.findById(recipe._id)
      .populate('productId', 'name sku category')
      .populate('branchId', 'name city')
      .populate({
        path: 'ingredients.rawMaterialId',
        select: 'name sku category unit'
      });

    return res.status(200).json({
      success: true,
      message: 'Recipe updated successfully.',
      recipe: updatedRecipe
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// DELETE RECIPE (SOFT DELETE)
export const deleteRecipe = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid recipe ID.'
      });
    }

    const recipe = await Recipe.findOneAndUpdate(
      {
        _id: id,
        isActive: true
      },
      {
        $set: { isActive: false }
      },
      { new: true }
    );

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Recipe deactivated successfully.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
