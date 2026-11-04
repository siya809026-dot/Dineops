import mongoose from 'mongoose';

const transferItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
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
  }
});

const stockTransferSchema = new mongoose.Schema({
  transferNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },

  sourceBranchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: true,
    index: true
  },

  destinationBranchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: true,
    index: true
  },

  items: {
    type: [transferItemSchema],
    required: true,
    validate: {
      validator: items => items.length > 0,
      message: 'A transfer must contain at least one product.'
    }
  },

  status: {
    type: String,
    enum: ['Pending', 'Dispatched', 'Received', 'Rejected'],
    default: 'Pending'
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  receivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  dispatchedAt: {
    type: Date,
    default: null
  },

  receivedAt: {
    type: Date,
    default: null
  },

  notes: {
    type: String,
    trim: true,
    default: ''
  }

}, { timestamps: true });

export default mongoose.model('StockTransfer', stockTransferSchema);