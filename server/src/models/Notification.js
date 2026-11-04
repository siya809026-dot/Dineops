import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      default: null,
      index: true
    },

    type: {
      type: String,
      enum: [
        'INVENTORY',
        'FORECAST',
        'WASTAGE',
        'PURCHASE',
        'STOCK_TRANSFER',
        'SUPPLY_REQUEST',
        'SYSTEM'
      ],
      required: true
    },

    severity: {
      type: String,
      enum: ['INFO', 'WARNING', 'CRITICAL', 'SUCCESS'],
      default: 'INFO'
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },

    entityType: {
      type: String,
      default: null,
      trim: true
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true
    },

    readAt: {
      type: Date,
      default: null
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

// Efficiently fetch a user's latest notifications.
notificationSchema.index({
  recipientId: 1,
  createdAt: -1
});

// Prevent duplicate active alerts for the same event.
notificationSchema.index({
  recipientId: 1,
  type: 1,
  entityType: 1,
  entityId: 1,
  isRead: 1
});

const Notification = mongoose.model(
  'Notification',
  notificationSchema
);

export default Notification;