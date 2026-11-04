
import express from 'express';

import {
  getDashboardAnalytics
} from '../controllers/dashboardController.js';

import {
  getDemandForecast
} from '../controllers/forecastController.js';

import {
  protect
} from '../middleware/authMiddleware.js';

const router = express.Router();

// Existing dashboard overview
router.get(
  '/overview',
  protect,
  getDashboardAnalytics
);

// New demand forecasting API
router.get(
  '/forecast',
  protect,
  getDemandForecast
);

export default router;
