import express from 'express';

import {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '../controllers/notificationController.js';

import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/unread-count', getUnreadCount);
router.get('/', getNotifications);
router.patch('/read-all', markAllNotificationsAsRead);
router.patch('/:id/read', markNotificationAsRead);

export default router;