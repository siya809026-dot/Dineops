
import mongoose from 'mongoose';

const goodsReceiptItemSchema = new mongoose.Schema({
  purchaseItemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  itemType: {
    type: String,
    enum: ['PRODUCT', 'RAW_MATERIAL'],
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

  orderedQuantity: {
    type: Number,
    required: true,
    min: 0.01
  },

  receivedQuantity: {
    type: Number,
    required: true,
    min: 0.01
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

const goodsReceiptSchema = new mongoose.Schema({
  grnNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },

  purchaseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Purchase',
    required: true,
    index: true
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
    type: [goodsReceiptItemSchema],
    required: true,
    validate: {
      validator: items => items.length > 0,
      message: 'A GRN must contain at least one received item.'
    }
  },

  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },

  receivedDate: {
    type: Date,
    default: Date.now
  },

  receivedBy: {
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

goodsReceiptSchema.index(
  { purchaseId: 1, createdAt: -1 }
);

export default mongoose.model('GoodsReceipt', goodsReceiptSchema);
