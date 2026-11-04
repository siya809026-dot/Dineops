
import mongoose from 'mongoose';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

export const createUserNotification = async ({
  recipientId,
  branchId = null,
  type,
  severity = 'INFO',
  title,
  message,
  entityType = null,
  entityId = null,
  metadata = {}
}) => {
  if (!recipientId || !type || !title || !message) {
    throw new Error('Recipient, type, title and message are required.');
  }

  return Notification.create({
    recipientId,
    branchId,
    type,
    severity,
    title,
    message,
    entityType,
    entityId,
    metadata
  });
};

export const notifyBranchUsers = async ({
  branchId,
  type,
  severity = 'INFO',
  title,
  message,
  entityType = null,
  entityId = null,
  metadata = {},
  includeOwners = true
}) => {
  if (!branchId || !mongoose.Types.ObjectId.isValid(branchId)) {
    throw new Error('A valid branch ID is required.');
  }

  const recipients = await User.find({
    isActive: true,
    $or: [
      {
        branchId,
        role: { $in: ['BRANCH_MANAGER', 'FRANCHISE_MANAGER'] }
      },
      ...(includeOwners ? [{ role: 'OWNER' }] : [])
    ]
  }).select('_id role');

  if (recipients.length === 0) {
    return [];
  }

  const notifications = recipients.map((user) => ({
    recipientId: user._id,
    branchId,
    type,
    severity,
    title,
    message,
    entityType,
    entityId,
    metadata
  }));

  return Notification.insertMany(notifications);
};

// Creates at most one matching alert per recipient, branch and day.
// This is best-effort duplicate prevention, not a database-level guarantee.
export const notifyBranchUsersOnceDaily = async ({
  branchId,
  type = 'FORECAST',
  severity = 'WARNING',
  title,
  message,
  entityType,
  entityId,
  metadata = {},
  includeOwners = true
}) => {
  if (!branchId || !mongoose.Types.ObjectId.isValid(branchId)) {
    throw new Error('A valid branch ID is required.');
  }

  if (!title || !message || !entityType || !entityId) {
    throw new Error('Title, message, entity type and entity ID are required.');
  }

  const recipients = await User.find({
    isActive: true,
    $or: [
      {
        branchId,
        role: { $in: ['BRANCH_MANAGER', 'FRANCHISE_MANAGER'] }
      },
      ...(includeOwners ? [{ role: 'OWNER' }] : [])
    ]
  }).select('_id');

  if (recipients.length === 0) {
    return [];
  }

  const now = new Date();
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);

  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const recipientIds = recipients.map((user) => user._id);

  const existing = await Notification.find({
    recipientId: { $in: recipientIds },
    branchId,
    type,
    entityType,
    entityId,
    createdAt: {
      $gte: dayStart,
      $lt: dayEnd
    }
  }).select('recipientId');

  const alreadyNotified = new Set(
    existing.map((item) => String(item.recipientId))
  );

  const newNotifications = recipients
    .filter((user) => !alreadyNotified.has(String(user._id)))
    .map((user) => ({
      recipientId: user._id,
      branchId,
      type,
      severity,
      title,
      message,
      entityType,
      entityId,
      metadata
    }));

  if (newNotifications.length === 0) {
    return [];
  }

  return Notification.insertMany(newNotifications);
};
