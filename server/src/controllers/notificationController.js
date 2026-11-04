import mongoose from 'mongoose';
import Notification from '../models/Notification.js';

const getNotificationScope = (user) => {
  const query = {
    recipientId: user._id
  };

  // Non-owner users can only access notifications for their own branch.
  if (user.role !== 'OWNER') {
    query.branchId = user.branchId;
  }

  return query;
};

// GET /api/notifications
export const getNotifications = async (req, res) => {
  try {
    const query = getNotificationScope(req.user);

    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 20, 1),
      100
    );

    if (req.query.unreadOnly === 'true') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const unreadCount = await Notification.countDocuments({
      ...getNotificationScope(req.user),
      isRead: false
    });

    return res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      notifications
    });
  } catch (error) {
    console.error('Get notifications error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications.'
    });
  }
};

// GET /api/notifications/unread-count
export const getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({
      ...getNotificationScope(req.user),
      isRead: false
    });

    return res.status(200).json({
      success: true,
      unreadCount
    });
  } catch (error) {
    console.error('Unread notification count error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch unread notification count.'
    });
  }
};

// PATCH /api/notifications/:id/read
export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification ID.'
      });
    }

    const notification = await Notification.findOneAndUpdate(
      {
        _id: id,
        ...getNotificationScope(req.user)
      },
      {
        $set: {
          isRead: true,
          readAt: new Date()
        }
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read.',
      notification
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to update notification.'
    });
  }
};

// PATCH /api/notifications/read-all
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      {
        ...getNotificationScope(req.user),
        isRead: false
      },
      {
        $set: {
          isRead: true,
          readAt: new Date()
        }
      }
    );

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read.',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to update notifications.'
    });
  }
};