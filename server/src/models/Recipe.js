import mongoose from 'mongoose';

const recipeIngredientSchema = new mongoose.Schema(
  {
    rawMaterialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RawMaterial',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 0.001
    }
  },
  { _id: false }
);

const recipeSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
      index: true
    },
    ingredients: {
      type: [recipeIngredientSchema],
      required: true,
      validate: {
        validator: ingredients => ingredients.length > 0,
        message: 'A recipe must contain at least one ingredient.'
      }
    },
    preparationNotes: {
      type: String,
      trim: true,
      default: ''
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

recipeSchema.index(
  { productId: 1, branchId: 1 },
  { unique: true }
);

const Recipe = mongoose.model('Recipe', recipeSchema);

export default Recipe;