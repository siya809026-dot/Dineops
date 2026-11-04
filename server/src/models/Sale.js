
import mongoose from 'mongoose';

const saleItemSchema = new mongoose.Schema({
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
  unitPrice: {
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

const saleSchema = new mongoose.Schema({
  invoiceNumber: {
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
    type: [saleItemSchema],
    required: true,
    validate: {
      validator: items => items.length > 0,
      message: 'A sale must contain at least one product.'
    }
  },

  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },

  paymentMethod: {
    type: String,
    enum: ['Cash', 'UPI', 'Card', 'Online'],
    required: true
  },

  saleDate: {
    type: Date,
    default: Date.now
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

export default mongoose.model('Sale', saleSchema);
