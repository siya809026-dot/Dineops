
import mongoose from 'mongoose';

const branchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  type: {
    type: String,
    enum: ['Branch Kitchen', 'Franchise Outlet'],
    required: true
  },

  city: {
    type: String,
    required: true
  },

  manager: {
    type: String,
    required: true
  },

  phone: {
    type: String,
    required: true
  },

  // Parent Branch Kitchen for a Franchise Outlet
  parentBranchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    default: null,
    index: true
  },

  status: {
    type: String,
    default: 'Operational'
  },

  inventoryStatus: {
    type: String,
    default: 'Optimal'
  }

}, { timestamps: true });

export default mongoose.model('Branch', branchSchema);
