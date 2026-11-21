import Post from '../models/postModel.js';
import cron from 'node-cron';

class SchedulerService {
  constructor() {
    this.scheduledJobs = new Map(); // Store individual job references
    this.isRunning = false;
    // Don't auto-initialize, wait for explicit init() call
  }

  // Initialize the scheduler
  init() {
    if (this.isRunning) {
      console.log('Scheduler service already running');
      return;
    }
    
    try {
      // Check every minute for posts that need to be published
      this.cronJob = cron.schedule('* * * * *', async () => {
        await this.processScheduledPosts();
      }, {
        scheduled: true,
        timezone: "UTC"
      });

      this.isRunning = true;
      console.log('Scheduler service initialized - checking every minute for scheduled posts');
    } catch (error) {
      console.error('Failed to initialize scheduler service:', error);
      this.isRunning = false;
    }
  }

  // Process all scheduled posts that are ready to be published
  async processScheduledPosts() {
    try {
      const now = new Date();
      
      // Find all posts that are scheduled and ready to be published
      const readyPosts = await Post.find({
        status: 'scheduled',
        scheduledAt: { $lte: now }
      }).populate('author', 'username');

      if (readyPosts.length === 0) {
        return; // No posts to publish
      }

      console.log(`Found ${readyPosts.length} post(s) ready for publication`);

      // Process each ready post
      for (const post of readyPosts) {
        await this.publishScheduledPost(post);
      }

    } catch (error) {
      console.error('Error processing scheduled posts:', error);
    }
  }

  // Publish a specific scheduled post
  async publishScheduledPost(post) {
    try {
      // Update post status to published
      post.status = 'published';
      post.createdAt = new Date(); // Update to actual publication time
      
      await post.save();

      console.log(`✅ Published scheduled post: "${post.title}" by ${post.author.username}`);
      
      // Remove from individual job tracking if it exists
      if (this.scheduledJobs.has(post._id.toString())) {
        const job = this.scheduledJobs.get(post._id.toString());
        if (job && job.destroy) {
          job.destroy();
        }
        this.scheduledJobs.delete(post._id.toString());
      }

      return {
        success: true,
        postId: post._id,
        title: post.title,
        publishedAt: post.createdAt
      };

    } catch (error) {
      console.error(`Failed to publish scheduled post ${post._id}:`, error);
      return {
        success: false,
        postId: post._id,
        error: error.message
      };
    }
  }

  // Schedule a specific post with individual timing
  scheduleIndividualPost(postId, scheduledTime) {
    try {
      const scheduleDate = new Date(scheduledTime);
      const now = new Date();

      if (scheduleDate <= now) {
        throw new Error('Scheduled time must be in the future');
      }

      // Calculate delay in milliseconds
      const delay = scheduleDate.getTime() - now.getTime();

      // Create a timeout for this specific post
      const timeoutId = setTimeout(async () => {
        try {
          const post = await Post.findById(postId).populate('author', 'username');
          if (post && post.status === 'scheduled') {
            await this.publishScheduledPost(post);
          }
          this.scheduledJobs.delete(postId.toString());
        } catch (error) {
          console.error(`Error in individual post scheduler for ${postId}:`, error);
        }
      }, delay);

      // Store the timeout reference
      this.scheduledJobs.set(postId.toString(), {
        timeoutId,
        scheduledTime: scheduleDate,
        destroy: () => clearTimeout(timeoutId)
      });

      console.log(`📅 Scheduled individual post ${postId} for ${scheduleDate.toLocaleString()}`);
      
      return {
        success: true,
        message: `Post scheduled for ${scheduleDate.toLocaleString()}`,
        postId,
        scheduledAt: scheduleDate.toISOString()
      };

    } catch (error) {
      console.error('Error scheduling individual post:', error);
      throw error;
    }
  }

  // Cancel a scheduled post
  cancelScheduledPost(postId) {
    try {
      const postIdStr = postId.toString();
      
      if (this.scheduledJobs.has(postIdStr)) {
        const job = this.scheduledJobs.get(postIdStr);
        if (job && job.destroy) {
          job.destroy();
        }
        this.scheduledJobs.delete(postIdStr);
        console.log(`❌ Cancelled scheduled post: ${postId}`);
        return { success: true, message: 'Scheduled post cancelled' };
      }
      
      return { success: true, message: 'Post was not individually scheduled' };
    } catch (error) {
      console.error('Error cancelling scheduled post:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all currently scheduled posts
  async getScheduledPosts() {
    try {
      const scheduledPosts = await Post.find({
        status: 'scheduled',
        scheduledAt: { $gt: new Date() }
      })
      .populate('author', 'username')
      .sort({ scheduledAt: 1 });

      return scheduledPosts.map(post => ({
        id: post._id,
        title: post.title,
        author: post.author.username,
        scheduledAt: post.scheduledAt,
        timeRemaining: this.calculateTimeRemaining(post.scheduledAt),
        hasIndividualJob: this.scheduledJobs.has(post._id.toString())
      }));
    } catch (error) {
      console.error('Error getting scheduled posts:', error);
      return [];
    }
  }

  // Calculate time remaining until scheduled time
  calculateTimeRemaining(scheduledTime) {
    const now = new Date();
    const scheduled = new Date(scheduledTime);
    const diff = scheduled.getTime() - now.getTime();

    if (diff <= 0) return 'Ready to publish';

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h ${minutes % 60}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else {
      return `${minutes}m`;
    }
  }

  // Stop the scheduler
  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
    }
    
    // Clear all individual jobs
    for (const [postId, job] of this.scheduledJobs) {
      if (job && job.destroy) {
        job.destroy();
      }
    }
    this.scheduledJobs.clear();
    
    this.isRunning = false;
    console.log('Scheduler service stopped');
  }

  // Get scheduler status
  getStatus() {
    return {
      isRunning: this.isRunning,
      activeJobs: this.scheduledJobs.size,
      nextCheck: this.cronJob ? 'Every minute' : 'Not scheduled'
    };
  }
}

// Create singleton instance
const schedulerService = new SchedulerService();

export default schedulerService;