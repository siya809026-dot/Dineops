import mongoose from 'mongoose';

const wastageItemSchema = new mongoose.Schema({
  itemType: {
    type: String,
    enum: ['PRODUCT', 'RAW_MATERIAL'],
    required: true,
    default: 'PRODUCT'
  },

  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    default: null
  },

  rawMaterialId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RawMaterial',
    default: null
  },

  productName: {
    type: String,
    required: true,
    trim: true
  },

  quantity: {
    type: Number,
    required: true,
    min: 0.01
  },

  unitCost: {
    type: Number,
    required: true,
    min: 0
  },

  totalLoss: {
    type: Number,
    required: true,
    min: 0
  },

  reason: {
    type: String,
    enum: [
      'Expired',
      'Spoiled',
      'Overproduction',
      'Preparation Error',
      'Damaged',
      'Other'
    ],
    required: true
  }
});

const wastageSchema = new mongoose.Schema({
  wastageNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },

  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: true,
    index: true
  },

  items: {
    type: [wastageItemSchema],
    required: true,
    validate: {
      validator: items => items.length > 0,
      message: 'At least one wastage item is required.'
    }
  },

  totalLoss: {
    type: Number,
    required: true,
    min: 0
  },

  wastageDate: {
    type: Date,
    default: Date.now
  },

  reportedBy: {
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

// Each item must reference exactly one inventory type.
wastageItemSchema.pre('validate', function () {
  if (this.itemType === 'PRODUCT') {
    if (!this.productId || this.rawMaterialId) {
      this.invalidate(
        'productId',
        'A product item must have only productId.'
      );
    }
  }

  if (this.itemType === 'RAW_MATERIAL') {
    if (!this.rawMaterialId || this.productId) {
      this.invalidate(
        'rawMaterialId',
        'A raw material item must have only rawMaterialId.'
      );
    }
  }
});

export default mongoose.model('Wastage', wastageSchema);