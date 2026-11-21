import User from '../models/userModel.js';
import Post from '../models/postModel.js';

class MonetizationService {
  constructor() {
    // COMPANY REVENUE CONFIGURATION
    this.companyRevenue = {
      // Revenue sharing percentages
      authorRevenueSplit: 0.70,    // Authors get 70%
      readerRevenueSplit: 0.80,    // Readers get 80% 
      platformCommission: 0.30,    // Company keeps 30% from authors
      readerCommission: 0.20,      // Company keeps 20% from readers
      
      // Premium subscription tiers
      subscriptionTiers: {
        basic: { price: 4.99, features: ['Ad-free reading', 'Basic analytics'] },
        premium: { price: 9.99, features: ['All basic', 'Advanced analytics', 'Priority support', 'Early access'] },
        creator: { price: 19.99, features: ['All premium', 'Enhanced monetization', 'Content promotion', 'Direct messaging'] }
      },
      
      // Advertisement revenue
      adRevenue: {
        cpmRate: 2.50,              // $2.50 per 1000 ad impressions
        platformAdShare: 0.60,      // Company keeps 60% of ad revenue
        creatorAdShare: 0.40        // Creators get 40% of ad revenue
      },
      
      // Transaction fees
      paymentProcessingFee: 0.029, // 2.9% payment processing fee
      withdrawalFee: 0.50,         // $0.50 per withdrawal
      
      // Premium features
      premiumContentCommission: 0.15, // 15% commission on premium content sales
      tippingCommission: 0.05,     // 5% commission on tips
      
      // Sponsored content
      sponsoredContentFee: 0.20    // 20% commission on sponsored posts
    };

    // AUTHOR REVENUE RATES (earning from their own content)
    this.authorRates = {
      baseRatePerHour: 0.004,     // $4 per 1000 hours ($0.004/hour)
      qualityBonus: 0.002,        // +$2 per 1000 hours for quality
      engagementBonus: 0.0015,    // +$1.5 per 1000 hours for engagement
      premiumBonus: 0.0025,       // +$2.5 per 1000 hours for premium content
      minimumPayout: 10.00
    };
    
    // READER REVENUE RATES (earning from reading any content)
    this.readerRates = {
      baseRatePerHour: 0.0015,    // $1.5 per 1000 hours ($0.0015/hour)
      engagementBonus: 0.0003,    // +$0.3 per 1000 hours for active engagement
      consistencyBonus: 0.0002,   // +$0.2 per 1000 hours for daily reading
      minimumPayout: 5.00         // Lower threshold for readers
    };
    
    // ELIGIBILITY REQUIREMENTS
    this.eligibility = {
      // Author requirements (to earn from their posts)
      author: {
        minimumPosts: 5,
        minimumViews: 500,
        minimumReadingHours: 50,    // 50 hours on their content
        accountAge: 14              // 14 days
      },
      // Reader requirements (to earn from reading)
      reader: {
        minimumReadingHours: 20,    // 20 hours of reading
        minimumEngagements: 10,     // 10 likes/comments
        activeDays: 7,              // Active for 7 days
        accountAge: 7               // 7 days
      }
    };
  }

  // Calculate AUTHOR revenue from their own post
  calculateAuthorRevenue(post, readingTimeSeconds) {
    const readingHours = readingTimeSeconds / 3600;
    const views = post.analytics?.views || 0;
    const engagements = (post.likes?.length || 0) + (post.commentsCount || 0);
    
    let hourlyRate = this.authorRates.baseRatePerHour;
    
    // Quality bonus (based on reading completion rate)
    const avgReadingTime = views > 0 ? (post.analytics?.totalReadingTime || 0) / views : 0;
    const estimatedReadTime = this.estimateReadTime(post.content || '');
    const completionRate = estimatedReadTime > 0 ? (avgReadingTime / estimatedReadTime) : 0;
    
    if (completionRate > 0.7) {
      hourlyRate += this.authorRates.qualityBonus;
    }
    
    // Engagement bonus
    const engagementRate = views > 0 ? engagements / views : 0;
    if (engagementRate > 0.1) {
      hourlyRate += this.authorRates.engagementBonus;
    }
    
    // Premium content bonus (longer posts)
    const wordCount = (post.content || '').split(/\\s+/).length;
    if (wordCount > 1000) {
      hourlyRate += this.authorRates.premiumBonus;
    }
    
    const revenue = readingHours * hourlyRate;
    
    return {
      revenue,
      hourlyRate,
      readingHours,
      qualityBonus: completionRate > 0.7,
      engagementBonus: engagementRate > 0.1,
      premiumBonus: wordCount > 1000
    };
  }
  
  // Calculate READER revenue from reading any content
  calculateReaderRevenue(readingTimeSeconds, engagements = 0, isConsistentReader = false) {
    const readingHours = readingTimeSeconds / 3600;
    
    let hourlyRate = this.readerRates.baseRatePerHour;
    
    // Engagement bonus (if user liked/commented)
    if (engagements > 0) {
      hourlyRate += this.readerRates.engagementBonus;
    }
    
    // Consistency bonus (for daily active readers)
    if (isConsistentReader) {
      hourlyRate += this.readerRates.consistencyBonus;
    }
    
    const revenue = readingHours * hourlyRate;
    
    return {
      revenue,
      hourlyRate,
      readingHours,
      engagementBonus: engagements > 0,
      consistencyBonus: isConsistentReader
    };
  }
  
  // Estimate reading time based on content length
  estimateReadTime(content) {
    const words = content.split(/\\s+/).length;
    const wordsPerMinute = 200; // Average reading speed
    return (words / wordsPerMinute) * 60; // Return in seconds
  }

  // Check AUTHOR eligibility (earning from own posts)
  async checkAuthorEligibility(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) return { eligible: false, reason: 'User not found' };

      const accountAge = (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      
      if (accountAge < this.eligibility.author.accountAge) {
        return {
          eligible: false,
          type: 'author',
          reason: `Account must be ${this.eligibility.author.accountAge} days old`,
          requirements: { accountAge: Math.floor(accountAge), required: this.eligibility.author.accountAge }
        };
      }

      const userPosts = await Post.find({ author: userId });
      const totalViews = userPosts.reduce((sum, post) => sum + (post.analytics?.views || 0), 0);
      const totalReadingTime = userPosts.reduce((sum, post) => sum + (post.analytics?.totalReadingTime || 0), 0);
      const totalHours = Math.floor(totalReadingTime / 3600);

      const requirements = {
        posts: { current: userPosts.length, required: this.eligibility.author.minimumPosts, met: userPosts.length >= this.eligibility.author.minimumPosts },
        views: { current: totalViews, required: this.eligibility.author.minimumViews, met: totalViews >= this.eligibility.author.minimumViews },
        readingHours: { current: totalHours, required: this.eligibility.author.minimumReadingHours, met: totalHours >= this.eligibility.author.minimumReadingHours }
      };

      const eligible = requirements.posts.met && requirements.views.met && requirements.readingHours.met;

      return {
        eligible,
        type: 'author',
        requirements,
        totalEarnings: user.monetization?.authorEarnings || 0
      };
      
    } catch (error) {
      console.error('Error checking author eligibility:', error);
      return { eligible: false, reason: 'Error checking eligibility' };
    }
  }

  // Check READER eligibility (earning from reading)
  async checkReaderEligibility(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) return { eligible: false, reason: 'User not found' };

      const accountAge = (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      
      if (accountAge < this.eligibility.reader.accountAge) {
        return {
          eligible: false,
          type: 'reader',
          reason: `Account must be ${this.eligibility.reader.accountAge} days old`,
          requirements: { accountAge: Math.floor(accountAge), required: this.eligibility.reader.accountAge }
        };
      }

      const readerAnalytics = user.monetization?.readerAnalytics || {};
      const totalReadingTime = readerAnalytics.totalReadingTime || 0;
      const totalHours = Math.floor(totalReadingTime / 3600);
      const totalEngagements = readerAnalytics.totalEngagements || 0;
      const activeDays = readerAnalytics.activeDays || 0;

      const requirements = {
        readingHours: { current: totalHours, required: this.eligibility.reader.minimumReadingHours, met: totalHours >= this.eligibility.reader.minimumReadingHours },
        engagements: { current: totalEngagements, required: this.eligibility.reader.minimumEngagements, met: totalEngagements >= this.eligibility.reader.minimumEngagements },
        activeDays: { current: activeDays, required: this.eligibility.reader.activeDays, met: activeDays >= this.eligibility.reader.activeDays }
      };

      const eligible = requirements.readingHours.met && requirements.engagements.met && requirements.activeDays.met;

      return {
        eligible,
        type: 'reader',
        requirements,
        totalEarnings: user.monetization?.readerEarnings || 0
      };
      
    } catch (error) {
      console.error('Error checking reader eligibility:', error);
      return { eligible: false, reason: 'Error checking eligibility' };
    }
  }

  // Enable monetization for eligible user
  async enableMonetization(userId) {
    try {
      const eligibilityCheck = await this.checkEligibility(userId);
      
      if (!eligibilityCheck.eligible) {
        return {
          success: false,
          message: eligibilityCheck.reason,
          details: eligibilityCheck
        };
      }

      // Update user monetization status
      await User.findByIdAndUpdate(userId, {
        'monetization.isEligible': true,
        'monetization.joinedDate': new Date(),
        'monetization.totalViews': eligibilityCheck.metrics.totalViews,
        'monetization.totalReadingHours': eligibilityCheck.metrics.totalReadingMinutes
      });

      return {
        success: true,
        message: 'Monetization enabled successfully!',
        metrics: eligibilityCheck.metrics
      };
      
    } catch (error) {
      console.error('Error enabling monetization:', error);
      return {
        success: false,
        message: 'Failed to enable monetization'
      };
    }
  }

  // Record view and calculate BOTH author and reader earnings
  async recordView(postId, readingTimeSeconds, userId = null) {
    try {
      const post = await Post.findById(postId).populate('author');
      if (!post) return { success: false, message: 'Post not found' };

      // Update post analytics
      await Post.findByIdAndUpdate(postId, {
        $inc: {
          'analytics.views': 1,
          'analytics.totalReadingTime': readingTimeSeconds
        }
      });

      const results = { success: true, earnings: {} };

      // AUTHOR EARNINGS (post owner gets paid for engagement on their content)
      if (post.author && post.author._id.toString() !== userId) {
        const authorEligibility = await this.checkAuthorEligibility(post.author._id);
        
        if (authorEligibility.eligible) {
          const authorRevenue = this.calculateAuthorRevenue(post, readingTimeSeconds);
          
          if (authorRevenue.revenue > 0) {
            await User.findByIdAndUpdate(post.author._id, {
              $inc: {
                'monetization.authorEarnings': authorRevenue.revenue,
                'monetization.totalEarnings': authorRevenue.revenue,
                'monetization.currentBalance': authorRevenue.revenue
              }
            });

            // Update post revenue tracking
            await Post.findByIdAndUpdate(postId, {
              $inc: { 'analytics.revenue.totalEarned': authorRevenue.revenue }
            });

            results.earnings.author = {
              userId: post.author._id,
              amount: authorRevenue.revenue,
              type: 'author'
            };
          }
        }
      }

      // READER EARNINGS (anyone who reads gets paid)
      if (userId) {
        const reader = await User.findById(userId);
        if (reader) {
          const readerEligibility = await this.checkReaderEligibility(userId);
          
          // Check if user engaged today (for consistency bonus)
          const today = new Date().toDateString();
          const lastActiveDate = reader.monetization?.readerAnalytics?.lastActiveDate;
          const isConsistentReader = lastActiveDate && new Date(lastActiveDate).toDateString() === today;
          
          const readerRevenue = this.calculateReaderRevenue(readingTimeSeconds, 0, isConsistentReader);
          
          // Always update reader analytics, even if not eligible for earnings yet
          const updateData = {
            $inc: {
              'monetization.readerAnalytics.totalReadingTime': readingTimeSeconds
            },
            $set: {
              'monetization.readerAnalytics.lastActiveDate': new Date()
            }
          };

          // Update active days if it's a new day
          if (!isConsistentReader) {
            updateData.$inc['monetization.readerAnalytics.activeDays'] = 1;
          }

          // Add earnings if eligible
          if (readerEligibility.eligible && readerRevenue.revenue > 0) {
            updateData.$inc['monetization.readerEarnings'] = readerRevenue.revenue;
            updateData.$inc['monetization.totalEarnings'] = readerRevenue.revenue;
            updateData.$inc['monetization.currentBalance'] = readerRevenue.revenue;

            results.earnings.reader = {
              userId: userId,
              amount: readerRevenue.revenue,
              type: 'reader'
            };
          }

          await User.findByIdAndUpdate(userId, updateData);
        }
      }

      return results;
      
    } catch (error) {
      console.error('Error recording view:', error);
      return { success: false, message: 'Failed to record view' };
    }
  }

  // Record engagement (like/comment) for reader earnings
  async recordEngagement(userId, postId, type = 'like') {
    try {
      if (!userId) return { success: false, message: 'User ID required' };

      await User.findByIdAndUpdate(userId, {
        $inc: { 'monetization.readerAnalytics.totalEngagements': 1 }
      });

      return { success: true, message: 'Engagement recorded' };
    } catch (error) {
      console.error('Error recording engagement:', error);
      return { success: false, message: 'Failed to record engagement' };
    }
  }

  // Get DUAL monetization dashboard (author + reader earnings)
  async getMonetizationDashboard(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) return { success: false, message: 'User not found' };

      // Check eligibility for both systems
      const authorEligibility = await this.checkAuthorEligibility(userId);
      const readerEligibility = await this.checkReaderEligibility(userId);

      // Get author data (from user's own posts)
      const userPosts = await Post.find({ author: userId })
        .sort({ 'analytics.views': -1 })
        .limit(10);

      const authorMetrics = {
        totalViews: userPosts.reduce((sum, post) => sum + (post.analytics?.views || 0), 0),
        totalReadingTime: userPosts.reduce((sum, post) => sum + (post.analytics?.totalReadingTime || 0), 0),
        eligiblePosts: userPosts.filter(post => (post.analytics?.views || 0) > 10).length,
        topPosts: userPosts.slice(0, 5).map(post => ({
          _id: post._id,
          title: post.title,
          analytics: {
            views: post.analytics?.views || 0,
            totalReadingTime: post.analytics?.totalReadingTime || 0,
            revenue: post.analytics?.revenue?.totalEarned || 0,
            revenueRate: post.analytics?.views > 0 ? 
              ((post.analytics?.revenue?.totalEarned || 0) / (post.analytics?.totalReadingTime || 1) * 3600).toFixed(3) : '0'
          }
        }))
      };

      // Get reader data
      const readerAnalytics = user.monetization?.readerAnalytics || {};

      return {
        success: true,
        data: {
          // Combined totals
          totalEarnings: (user.monetization?.authorEarnings || 0) + (user.monetization?.readerEarnings || 0),
          totalReadingTime: Math.floor((authorMetrics.totalReadingTime + (readerAnalytics.totalReadingTime || 0)) / 3600), // hours
          totalViews: authorMetrics.totalViews,
          eligiblePosts: authorMetrics.eligiblePosts,
          
          // Author section
          author: {
            eligible: authorEligibility.eligible,
            eligibility: authorEligibility,
            earnings: user.monetization?.authorEarnings || 0,
            metrics: authorMetrics
          },
          
          // Reader section  
          reader: {
            eligible: readerEligibility.eligible,
            eligibility: readerEligibility,
            earnings: user.monetization?.readerEarnings || 0,
            analytics: {
              totalReadingTime: Math.floor((readerAnalytics.totalReadingTime || 0) / 3600), // hours
              totalEngagements: readerAnalytics.totalEngagements || 0,
              activeDays: readerAnalytics.activeDays || 0,
              dailyStreak: readerAnalytics.dailyReadingStreak || 0
            }
          },
          
          // Payment info
          paymentSettings: user.monetization?.paymentInfo || { method: '', account: '' }
        }
      };
      
    } catch (error) {
      console.error('Error getting monetization dashboard:', error);
      return { success: false, message: 'Failed to load dashboard data' };
    }
  }

  // Process monthly payments for dual earnings system
  async processMonthlyPayments() {
    try {
      // Find users with sufficient balance for payout
      const minAuthorPayout = this.authorRates.minimumPayout;
      const minReaderPayout = this.readerRates.minimumPayout;
      
      const eligibleUsers = await User.find({
        $or: [
          { 'monetization.authorEarnings': { $gte: minAuthorPayout } },
          { 'monetization.readerEarnings': { $gte: minReaderPayout } }
        ],
        'monetization.paymentInfo.method': { $ne: '' }
      });

      const paymentResults = [];

      for (const user of eligibleUsers) {
        const authorEarnings = user.monetization?.authorEarnings || 0;
        const readerEarnings = user.monetization?.readerEarnings || 0;
        let totalPayout = 0;

        const payoutDetails = {
          userId: user._id,
          username: user.username,
          authorEarnings: 0,
          readerEarnings: 0,
          totalAmount: 0,
          status: 'processed'
        };

        // Process author earnings if eligible
        if (authorEarnings >= minAuthorPayout) {
          payoutDetails.authorEarnings = authorEarnings;
          totalPayout += authorEarnings;
        }

        // Process reader earnings if eligible  
        if (readerEarnings >= minReaderPayout) {
          payoutDetails.readerEarnings = readerEarnings;
          totalPayout += readerEarnings;
        }

        if (totalPayout > 0) {
          payoutDetails.totalAmount = totalPayout;

          // Update user balance (reset paid earnings)
          await User.findByIdAndUpdate(user._id, {
            $inc: { 
              'monetization.authorEarnings': -payoutDetails.authorEarnings,
              'monetization.readerEarnings': -payoutDetails.readerEarnings,
              'monetization.totalEarnings': -totalPayout
            },
            $set: {
              'monetization.lastPaymentDate': new Date()
            }
          });

          paymentResults.push(payoutDetails);
        }
      }

      return {
        success: true,
        paymentsProcessed: paymentResults.length,
        totalPaid: paymentResults.reduce((sum, payment) => sum + payment.totalAmount, 0),
        payments: paymentResults
      };
      
    } catch (error) {
      console.error('Error processing monthly payments:', error);
      return { success: false, message: 'Failed to process payments' };
    }
  }

  // Calculate company revenue from platform operations
  calculateCompanyRevenue(authorEarnings, readerEarnings, additionalRevenue = {}) {
    const companyConfig = {
      // Revenue sharing - company takes a percentage
      authorCommissionRate: 0.30,    // 30% from author earnings
      readerCommissionRate: 0.20,    // 20% from reader earnings
      
      // Subscription tiers (monthly)
      subscriptions: {
        basic: 4.99,     // Ad-free reading
        premium: 9.99,   // Enhanced features  
        creator: 19.99   // Advanced monetization tools
      },
      
      // Ad revenue (company keeps majority)
      adRevenueShare: 0.60,          // 60% of ad revenue
      estimatedCPM: 2.50,            // $2.50 per 1000 impressions
      
      // Transaction fees
      paymentProcessingFee: 0.029,   // 2.9% + $0.30 per transaction
      withdrawalFee: 0.50            // Fixed fee per withdrawal
    };

    // Calculate commission revenue
    const authorCommissions = authorEarnings * companyConfig.authorCommissionRate;
    const readerCommissions = readerEarnings * companyConfig.readerCommissionRate;
    
    // Estimate subscription revenue (based on user base)
    const estimatedSubscribers = {
      basic: (additionalRevenue.totalUsers || 1000) * 0.15,      // 15% on basic
      premium: (additionalRevenue.totalUsers || 1000) * 0.08,    // 8% on premium  
      creator: (additionalRevenue.totalUsers || 1000) * 0.03     // 3% on creator
    };
    
    const subscriptionRevenue = 
      (estimatedSubscribers.basic * companyConfig.subscriptions.basic) +
      (estimatedSubscribers.premium * companyConfig.subscriptions.premium) +
      (estimatedSubscribers.creator * companyConfig.subscriptions.creator);
    
    // Estimate ad revenue (based on page views)
    const estimatedAdImpressions = (additionalRevenue.totalViews || 10000) * 2.5; // 2.5 ads per page view
    const totalAdRevenue = (estimatedAdImpressions / 1000) * companyConfig.estimatedCPM;
    const companyAdRevenue = totalAdRevenue * companyConfig.adRevenueShare;
    
    // Calculate payment processing revenue
    const transactionCount = (additionalRevenue.monthlyPayments || 100);
    const processingRevenue = 
      ((authorEarnings + readerEarnings) * companyConfig.paymentProcessingFee) + 
      (transactionCount * companyConfig.withdrawalFee);

    const totalRevenue = authorCommissions + readerCommissions + subscriptionRevenue + companyAdRevenue + processingRevenue;
    const totalCosts = authorEarnings + readerEarnings; // Amount paid to users
    const netProfit = totalRevenue - totalCosts;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return {
      breakdown: {
        authorCommissions: Math.round(authorCommissions * 100) / 100,
        readerCommissions: Math.round(readerCommissions * 100) / 100,
        subscriptions: Math.round(subscriptionRevenue * 100) / 100,
        advertising: Math.round(companyAdRevenue * 100) / 100,
        paymentProcessing: Math.round(processingRevenue * 100) / 100
      },
      totals: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalCosts: Math.round(totalCosts * 100) / 100,
        netProfit: Math.round(netProfit * 100) / 100,
        profitMargin: Math.round(profitMargin * 100) / 100
      },
      projections: {
        monthlyRevenue: Math.round(totalRevenue * 100) / 100,
        yearlyRevenue: Math.round(totalRevenue * 12 * 100) / 100,
        averageRevenuePerUser: additionalRevenue.totalUsers > 0 ? 
          Math.round((totalRevenue / additionalRevenue.totalUsers) * 100) / 100 : 0
      }
    };
  }

  // Get comprehensive company analytics
  async getCompanyAnalytics() {
    try {
      // Get platform statistics
      const totalUsers = await User.countDocuments();
      const activeCreators = await User.countDocuments({ 
        $or: [
          { 'monetization.authorEligible': true },
          { 'monetization.authorEarnings': { $gt: 0 } }
        ]
      });
      const activeReaders = await User.countDocuments({ 
        $or: [
          { 'monetization.readerEligible': true },
          { 'monetization.readerEarnings': { $gt: 0 } }
        ]
      });
      
      // Calculate total earnings distributed
      const authorEarningsResult = await User.aggregate([
        { $group: { _id: null, total: { $sum: '$monetization.authorEarnings' } } }
      ]);
      
      const readerEarningsResult = await User.aggregate([
        { $group: { _id: null, total: { $sum: '$monetization.readerEarnings' } } }
      ]);
      
      const totalAuthorEarnings = authorEarningsResult[0]?.total || 0;
      const totalReaderEarnings = readerEarningsResult[0]?.total || 0;
      
      // Get content statistics
      const totalPosts = await Post.countDocuments({ status: 'published' });
      const totalViewsResult = await Post.aggregate([
        { $group: { _id: null, total: { $sum: '$analytics.views' } } }
      ]);
      const totalViews = totalViewsResult[0]?.total || 0;
      
      // Get recent activity (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
      const recentPosts = await Post.countDocuments({ 
        createdAt: { $gte: thirtyDaysAgo },
        status: 'published'
      });

      // Calculate company revenue
      const additionalRevenue = {
        totalUsers,
        totalViews,
        monthlyPayments: Math.floor(totalUsers * 0.1) // Estimate 10% make payments monthly
      };
      
      const companyRevenue = this.calculateCompanyRevenue(
        totalAuthorEarnings, 
        totalReaderEarnings, 
        additionalRevenue
      );

      return {
        success: true,
        platformStats: {
          totalUsers,
          activeCreators,
          activeReaders,
          totalPosts,
          totalViews,
          newUsersLast30Days: recentUsers,
          newPostsLast30Days: recentPosts,
          creatorConversionRate: totalUsers > 0 ? Math.round((activeCreators / totalUsers) * 100 * 100) / 100 : 0,
          readerEngagementRate: totalUsers > 0 ? Math.round((activeReaders / totalUsers) * 100 * 100) / 100 : 0
        },
        financials: {
          totalPaidOut: Math.round((totalAuthorEarnings + totalReaderEarnings) * 100) / 100,
          authorPayouts: Math.round(totalAuthorEarnings * 100) / 100,
          readerPayouts: Math.round(totalReaderEarnings * 100) / 100,
          ...companyRevenue
        },
        businessMetrics: {
          userAcquisitionCost: 12.50, // Estimated CAC
          lifetimeValue: 89.30,       // Estimated LTV
          churnRate: 8.5,             // Monthly churn %
          monthlyActiveUsers: Math.floor(totalUsers * 0.65), // 65% MAU rate
          averageSessionDuration: '12m 34s', // Estimated
          contentCreationRate: totalUsers > 0 ? Math.round((totalPosts / totalUsers) * 100) / 100 : 0
        }
      };
      
    } catch (error) {
      console.error('Error getting company analytics:', error);
      return { success: false, message: 'Failed to load company analytics' };
    }
  }
}

export default new MonetizationService();