import express from 'express';
import {
  getMonetizationDashboard,
  recordView,
  recordEngagement,
  updatePaymentSettings,
  getPostAnalytics
} from '../controllers/monetizationController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Routes that work with or without authentication (but earnings only for authenticated users)
router.post('/record-view', (req, res, next) => {
  // Try to authenticate, but don't fail if no token
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    authMiddleware(req, res, (err) => {
      if (err) {
        // Continue without authentication if token is invalid
        req.user = null;
      }
      recordView(req, res);
    });
  } else {
    // No token provided, continue as anonymous
    req.user = null;
    recordView(req, res);
  }
});

// Protected routes (require authentication)
router.use(authMiddleware);

// Main dashboard (shows both author and reader earnings)
router.get('/dashboard', getMonetizationDashboard);

// Reader engagement tracking
router.post('/record-engagement', recordEngagement);

// Payment settings
router.put('/payment-settings', updatePaymentSettings);

// Post analytics for authors
router.get('/analytics/posts', getPostAnalytics);



export default router;