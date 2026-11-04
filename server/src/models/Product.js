
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  sku: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },

  name: {
    type: String,
    required: true,
    trim: true
  },

  category: {
    type: String,
    required: true,
    trim: true
  },

  unit: {
    type: String,
    required: true,
    trim: true
  },

  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },

  minStock: {
    type: Number,
    required: true,
    default: 10,
    min: 0
  },

  cost: {
    type: Number,
    required: true,
    min: 0
  },

  sellingPrice: {
    type: Number,
    required: true,
    min: 0
  },

  location: {
    type: String,
    required: true,
    trim: true
  },

  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: true,
    index: true
  }

}, {
  timestamps: true
});

// SKU must be unique only within the same branch.
productSchema.index(
  { branchId: 1, sku: 1 },
  { unique: true }
);

const Product = mongoose.model('Product', productSchema);

export default Product;
