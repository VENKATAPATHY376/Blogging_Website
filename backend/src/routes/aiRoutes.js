import express from 'express';
import { 
  enhanceContent, 
  generateHeading, 
  checkSpelling, 
  getContentSuggestions, 
  getOptimalPostingTime, 
  getSEOAnalysis,
  scheduleSmartPost,
  getSmartPostingTimes
} from '../controllers/aiController.js';
import { authMiddleware as authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All AI routes require authentication
router.use(authenticate);

// Comprehensive content enhancement
router.post('/enhance', enhanceContent);

// Individual AI features
router.post('/generate-heading', generateHeading);
router.post('/check-spelling', checkSpelling);
router.post('/suggestions', getContentSuggestions);
router.post('/seo-analysis', getSEOAnalysis);

// Posting time suggestions (no content needed)
router.get('/posting-time', getOptimalPostingTime);
router.get('/smart-posting-times', getSmartPostingTimes);

// Smart scheduling
router.post('/schedule-smart-post', scheduleSmartPost);

export default router;