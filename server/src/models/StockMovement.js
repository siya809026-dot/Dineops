import mongoose from 'mongoose';

const stockMovementSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    default: null,
    index: true
  },

  rawMaterialId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RawMaterial',
    default: null,
    index: true
  },

  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: true,
    index: true
  },

  movementType: {
    type: String,
    enum: [
      'SALE',
      'PURCHASE',
      'WASTAGE',
      'ADJUSTMENT',
      'TRANSFER'
    ],
    required: true
  },

  quantity: {
    type: Number,
    required: true,
    min: 0.01
  },

  previousStock: {
    type: Number,
    required: true,
    min: 0
  },

  newStock: {
    type: Number,
    required: true,
    min: 0
  },

  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },

  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  notes: {
    type: String,
    trim: true,
    default: ''
  }

}, { timestamps: true });

// Preserve compatibility with existing product movements.
stockMovementSchema.pre('validate', function () {
  if (this.productId && this.rawMaterialId) {
    this.invalidate(
      'productId',
      'A movement cannot reference both product and raw material.'
    );
  }

  if (!this.productId && !this.rawMaterialId) {
    this.invalidate(
      'productId',
      'A product or raw material reference is required.'
    );
  }
});

export default mongoose.model('StockMovement', stockMovementSchema);