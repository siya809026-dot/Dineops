import mongoose from 'mongoose';

const supplyRequestSchema = new mongoose.Schema({
  requestId: { type: String, required: true, unique: true },
  requester: { type: String, required: true },
  supplyingBranch: { type: String, required: true },
  items: [
    {
      name: { type: String, required: true },
      qty: { type: Number, required: true },
      unit: { type: String, required: true },
    }
  ],
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Dispatched', 'Received', 'Rejected'], 
    default: 'Pending' 
  },
}, { timestamps: true });

export default mongoose.model('SupplyRequest', supplyRequestSchema);