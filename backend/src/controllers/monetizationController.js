import monetizationService from '../services/monetizationService.js';
import User from '../models/userModel.js';

// Get monetization dashboard for authenticated user
export const getMonetizationDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const dashboard = await monetizationService.getMonetizationDashboard(userId);
    
    if (!dashboard.success) {
      return res.status(404).json({
        success: false,
        message: dashboard.message
      });
    }

    res.json({
      success: true,
      ...dashboard.data
    });
  } catch (error) {
    console.error('Error getting monetization dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load monetization dashboard'
    });
  }
};

// Check eligibility for monetization program
export const checkEligibility = async (req, res) => {
  try {
    const userId = req.user.id;
    const eligibility = await monetizationService.checkEligibility(userId);
    
    res.json({
      success: true,
      ...eligibility
    });
  } catch (error) {
    console.error('Error checking monetization eligibility:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check eligibility'
    });
  }
};

// Apply for monetization program
export const applyForMonetization = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await monetizationService.enableMonetization(userId);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      message: 'Congratulations! You have been accepted into the monetization program.',
      ...result
    });
  } catch (error) {
    console.error('Error applying for monetization:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process monetization application'
    });
  }
};

// Update payment settings
export const updatePaymentSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { method, account } = req.body;

    // Validate payment method
    const validMethods = ['paypal', 'bank', 'stripe'];
    if (!method || !validMethods.includes(method)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method. Choose paypal, bank, or stripe.'
      });
    }

    if (!account || account.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Payment account information is required'
      });
    }

    // Update user payment information
    await User.findByIdAndUpdate(userId, {
      'monetization.paymentInfo.method': method,
      'monetization.paymentInfo.account': account.trim(),
      'monetization.paymentInfo.isVerified': false // Reset verification when changed
    });

    res.json({
      success: true,
      message: 'Payment settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating payment settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment settings'
    });
  }
};

// Record a view with reading time (DUAL EARNINGS: author + reader)
export const recordView = async (req, res) => {
  try {
    const { postId, readingTime } = req.body;
    const userId = req.user?.id || null;

    console.log(`📊 Recording view - Post: ${postId}, Time: ${readingTime}s, User: ${userId || 'anonymous'}`);

    if (!postId || !readingTime) {
      return res.status(400).json({
        success: false,
        message: 'Post ID and reading time are required'
      });
    }

    // Validate reading time (5 seconds to 1 hour)
    const readingTimeSeconds = parseInt(readingTime);
    if (readingTimeSeconds < 5 || readingTimeSeconds > 3600) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reading time'
      });
    }

    const result = await monetizationService.recordView(postId, readingTimeSeconds, userId);
    
    // Log earnings if any were generated
    if (result.earnings) {
      if (result.earnings.author) {
        console.log(`💰 Author earnings: $${result.earnings.author.amount.toFixed(4)} for user ${result.earnings.author.userId}`);
      }
      if (result.earnings.reader) {
        console.log(`📚 Reader earnings: $${result.earnings.reader.amount.toFixed(4)} for user ${result.earnings.reader.userId}`);
      }
    }
    
    res.json({
      success: true,
      message: 'Reading time recorded',
      earnings: result.earnings || {},
      debug: {
        postId,
        readingTimeSeconds,
        userId,
        hasEarnings: !!result.earnings
      }
    });
  } catch (error) {
    console.error('Error recording view:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record view'
    });
  }
};

// Record engagement (like/comment) for reader earnings
export const recordEngagement = async (req, res) => {
  try {
    const { postId, type = 'like' } = req.body;
    const userId = req.user?.id;

    console.log(`👍 Recording engagement - Post: ${postId}, Type: ${type}, User: ${userId || 'anonymous'}`);

    if (!userId || !postId) {
      return res.status(400).json({
        success: false,
        message: 'User ID and Post ID are required'
      });
    }

    const result = await monetizationService.recordEngagement(userId, postId, type);
    
    console.log(`✅ Engagement recorded successfully for user ${userId}`);
    
    res.json({
      success: true,
      message: 'Engagement recorded',
      debug: {
        postId,
        type,
        userId
      }
    });
  } catch (error) {
    console.error('Error recording engagement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record engagement'
    });
  }
};

// Get post analytics (for author dashboard - returns all user's posts)
export const getPostAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    const Post = (await import('../models/postModel.js')).default;
    const userPosts = await Post.find({ author: userId })
      .sort({ 'analytics.views': -1 })
      .limit(10)
      .select('title analytics createdAt');

    const posts = userPosts.map(post => ({
      _id: post._id,
      title: post.title,
      analytics: {
        views: post.analytics?.views || 0,
        totalReadingTime: post.analytics?.totalReadingTime || 0,
        revenue: post.analytics?.revenue?.totalEarned || 0,
        revenueRate: post.analytics?.views > 0 ? 
          ((post.analytics?.revenue?.totalEarned || 0) / (post.analytics?.totalReadingTime || 1) * 3600).toFixed(3) : '0'
      },
      createdAt: post.createdAt
    }));

    res.json({
      success: true,
      posts: posts
    });
  } catch (error) {
    console.error('Error getting post analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get post analytics'
    });
  }
};

// Get revenue leaderboard (public)
export const getRevenueLeaderboard = async (req, res) => {
  try {
    const { period = 'all-time', limit = 10 } = req.query;
    
    // Get top earning users
    const users = await User.find({
      'monetization.isEligible': true,
      'monetization.totalEarnings': { $gt: 0 }
    })
    .select('username monetization.totalEarnings monetization.totalViews monetization.totalReadingHours')
    .sort({ 'monetization.totalEarnings': -1 })
    .limit(parseInt(limit));

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      username: user.username,
      totalEarnings: user.monetization.totalEarnings,
      totalViews: user.monetization.totalViews,
      totalReadingHours: Math.round(user.monetization.totalReadingHours / 60 * 100) / 100, // Convert to hours
      rpm: user.monetization.totalViews > 0 ? 
        (user.monetization.totalEarnings / (user.monetization.totalReadingHours / 1000)).toFixed(4) : 0
    }));

    res.json({
      success: true,
      leaderboard,
      period,
      totalCreators: users.length
    });
  } catch (error) {
    console.error('Error getting revenue leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load leaderboard'
    });
  }
};

