
import mongoose from 'mongoose';

const rawMaterialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    sku: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },

    category: {
      type: String,
      required: true,
      enum: [
        'Dairy',
        'Vegetables',
        'Grains',
        'Protein',
        'Spices',
        'Oils',
        'Other'
      ]
    },

    unit: {
      type: String,
      required: true,
      enum: ['KG', 'GRAM', 'LITRE', 'ML', 'PIECE', 'PACKET']
    },

    currentStock: {
      type: Number,
      default: 0,
      min: 0
    },

    minimumStock: {
      type: Number,
      default: 5,
      min: 0
    },

    purchasePrice: {
      type: Number,
      required: true,
      min: 0
    },

    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
      index: true
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

rawMaterialSchema.index(
  { branchId: 1, sku: 1 },
  { unique: true }
);

const RawMaterial = mongoose.model('RawMaterial', rawMaterialSchema);

export default RawMaterial;
