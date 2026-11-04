
import mongoose from 'mongoose';

const purchaseItemSchema = new mongoose.Schema({
  itemType: {
    type: String,
    enum: ['PRODUCT', 'RAW_MATERIAL'],
    default: 'PRODUCT',
    required: true
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

  itemName: {
    type: String,
    required: true,
    trim: true
  },

  quantity: {
    type: Number,
    required: true,
    min: 0.01
  },

  receivedQuantity: {
    type: Number,
    default: 0,
    min: 0
  },

  unitCost: {
    type: Number,
    required: true,
    min: 0
  },

  lineTotal: {
    type: Number,
    required: true,
    min: 0
  }
});

const purchaseSchema = new mongoose.Schema({
  purchaseNumber: {
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

  supplierName: {
    type: String,
    required: true,
    trim: true
  },

  items: {
    type: [purchaseItemSchema],
    required: true,
    validate: {
      validator: items => items.length > 0,
      message: 'A purchase must contain at least one item.'
    }
  },

  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },

  purchaseDate: {
    type: Date,
    default: Date.now
  },

  purchaseStatus: {
    type: String,
    enum: ['ORDERED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED'],
    default: 'ORDERED',
    index: true
  },

  paymentStatus: {
    type: String,
    enum: ['Paid', 'Pending', 'Partial'],
    default: 'Pending'
  },

  workflowVersion: {
    type: Number,
    default: 2
  },

  createdBy: {
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

purchaseSchema.pre('validate', function () {
  for (const item of this.items) {
    if (item.itemType === 'PRODUCT') {
      if (!item.productId || item.rawMaterialId) {
        this.invalidate(
          'items',
          'Product items must reference only a product.'
        );
      }
    }

    if (item.itemType === 'RAW_MATERIAL') {
      if (!item.rawMaterialId || item.productId) {
        this.invalidate(
          'items',
          'Raw material items must reference only a raw material.'
        );
      }
    }

    if (item.receivedQuantity > item.quantity) {
      this.invalidate(
        'items',
        'Received quantity cannot exceed ordered quantity.'
      );
    }
  }
});

export default mongoose.model('Purchase', purchaseSchema);
