import Post from '../models/postModel.js';
import Comment from '../models/commentModel.js';
import schedulerService from '../services/schedulerService.js';

import { copyImageToPost } from './uploadController.js';

export const createPost = async (req, res) => {
  try {
    console.log('📸 ======= POST CREATION DEBUG =======');
    console.log('📸 Full request body:', JSON.stringify(req.body, null, 2));
    
    const { scheduledAt, status, hasCoverPhoto, tempImageFilename, ...postData } = req.body;
    
    // Debug logging for cover photo
    console.log('📸 Extracted fields:', {
      title: postData.title,
      hasCoverPhoto: hasCoverPhoto,
      tempImageFilename: tempImageFilename,
      hasCoverPhotoType: typeof hasCoverPhoto,
      tempImageFilenameType: typeof tempImageFilename,
      hasCoverPhotoValue: hasCoverPhoto,
      tempImageFilenameValue: tempImageFilename
    });
    
    // Create post without image first
    const post = new Post({ 
      ...postData, 
      author: req.user.id,
      status: status || 'published',
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null
    });
    
    await post.save();
    console.log('📸 Post saved with ID:', post._id);
    
    // If we have a cover photo, copy the temp file to post-specific filename and update post
    console.log('📸 Checking cover photo conditions:', {
      hasCoverPhoto: hasCoverPhoto,
      tempImageFilename: tempImageFilename,
      bothPresent: !!(hasCoverPhoto && tempImageFilename),
      hasCoverPhotoBool: !!hasCoverPhoto,
      tempImageFilenameExists: !!tempImageFilename
    });
    
    if (hasCoverPhoto && tempImageFilename) {
      console.log('📸 ✅ Conditions met - processing cover photo...');
      // Copy temp image to post-specific filename
      const copySuccess = copyImageToPost(tempImageFilename, post._id);
      if (copySuccess) {
        console.log('📸 Cover photo successfully copied for post:', post._id);
        post.image = `/uploads/post-${post._id}.jpg`;
        await post.save();
        console.log('📸 Post updated with image field:', post.image);
      } else {
        console.log('📸 Failed to copy cover photo for post:', post._id);
        post.image = null;
      }
    } else {
      console.log('📸 ❌ Cover photo conditions not met - skipping image processing');
    }
    
    console.log('📸 Post saved with image field:', post.image);
    
    // If this is a scheduled post, set up the scheduler
    if (status === 'scheduled' && scheduledAt) {
      try {
        const scheduleResult = schedulerService.scheduleIndividualPost(post._id, scheduledAt);
        console.log('Post scheduled:', scheduleResult);
      } catch (scheduleError) {
        console.error('Failed to schedule post:', scheduleError);
        // Post is still saved, but scheduling failed
      }
    }
    
    res.json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Failed to create post', error: error.message });
  }
};

// Create a smart scheduled post with AI optimization
export const createSmartScheduledPost = async (req, res) => {
  try {
    const { title, content, tags, scheduledAt } = req.body;
    
    if (!scheduledAt) {
      return res.status(400).json({ message: 'Scheduled time is required for smart scheduling' });
    }
    
    const scheduleDate = new Date(scheduledAt);
    const now = new Date();
    
    if (scheduleDate <= now) {
      return res.status(400).json({ message: 'Scheduled time must be in the future' });
    }
    
    // Create scheduled post
    const post = new Post({
      title,
      content,
      tags: tags || [],
      author: req.user.id,
      status: 'scheduled',
      scheduledAt: scheduleDate
    });
    
    await post.save();
    
    // Set up individual scheduler for this post
    const scheduleResult = schedulerService.scheduleIndividualPost(post._id, scheduledAt);
    
    res.json({
      success: true,
      post,
      scheduling: scheduleResult,
      message: `Post will be automatically published on ${scheduleDate.toLocaleString()}`
    });
    
  } catch (error) {
    console.error('Error creating smart scheduled post:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create scheduled post', 
      error: error.message 
    });
  }
};

export const getPosts = async (req, res) => {
  const { q, page = 1, limit = 8, status = 'published', sortBy = 'createdAt' } = req.query;
  
  // Base filter for search query
  let filter = {};
  if (q) {
    filter.$or = [
      { title: new RegExp(q, 'i') },
      { content: new RegExp(q, 'i') }
    ];
  }
  
  // Status filter - handle both new posts with status field and legacy posts without it
  if (status === 'published') {
    // For published posts, include:
    // 1. Posts with status: 'published'
    // 2. Posts without status field (legacy posts - treat as published)
    // 3. Scheduled posts that are past their scheduled time
    const statusFilter = {
      $or: [
        { status: 'published' },
        { status: { $exists: false } }, // Legacy posts without status field
        { status: null }, // Posts with null status
        {
          status: 'scheduled',
          scheduledAt: { $lte: new Date() }
        }
      ]
    };
    
    // Combine with search filter if exists
    if (q) {
      filter = {
        $and: [
          {
            $or: [
              { title: new RegExp(q, 'i') },
              { content: new RegExp(q, 'i') }
            ]
          },
          statusFilter
        ]
      };
    } else {
      filter = statusFilter;
    }
  } else {
    // For specific statuses (draft, scheduled), only show posts with that exact status
    const statusFilter = { status };
    
    if (q) {
      filter = {
        $and: [
          {
            $or: [
              { title: new RegExp(q, 'i') },
              { content: new RegExp(q, 'i') }
            ]
          },
          statusFilter
        ]
      };
    } else {
      filter = statusFilter;
    }
  }
  
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.max(1, parseInt(limit, 10) || 8);
  const total = await Post.countDocuments(filter);
  const totalPages = Math.max(1, Math.ceil(total / l));
  
  // Determine sort criteria
  let sortCriteria = { createdAt: -1 }; // default
  
  if (sortBy === 'likes') {
    // Sort by number of likes (descending), then by creation date for ties
    sortCriteria = [
      { $addFields: { likesCount: { $size: { $ifNull: ['$likes', []] } } } },
      { $sort: { likesCount: -1, createdAt: -1 } }
    ];
  } else if (sortBy === 'views') {
    sortCriteria = { views: -1, createdAt: -1 };
  } else if (sortBy === 'readingTime') {
    sortCriteria = { totalReadingTimeMinutes: -1, createdAt: -1 };
  }

  let query;
  if (sortBy === 'likes') {
    // Use aggregation pipeline for likes sorting
    query = Post.aggregate([
      { $match: filter },
      { $addFields: { likesCount: { $size: { $ifNull: ['$likes', []] } } } },
      { $sort: { likesCount: -1, createdAt: -1 } },
      { $skip: (p-1)*l },
      { $limit: l },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'author'
        }
      },
      {
        $addFields: {
          author: { $arrayElemAt: ['$author', 0] }
        }
      },
      {
        $project: {
          'author.password': 0,
          'author.email': 0
        }
      }
    ]);
  } else {
    // Use regular find with populate for other sorts
    query = Post.find(filter)
      .populate('author', 'username')
      .sort(sortCriteria)
      .skip((p-1)*l)
      .limit(l);
  }
  
  const items = await query;
  
  res.json({ 
    items, 
    page: p, 
    totalPages, 
    total,
    filter: { status, hasQuery: !!q }
  });
};

export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'username email');
    if(!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const commentsRaw = await Comment.find({ postId: req.params.id }).populate('userId', 'username').sort({ createdAt: -1 });
    const comments = commentsRaw.map(c => ({ 
      _id: c._id, 
      content: c.content, 
      createdAt: c.createdAt, 
      author: { 
        username: c.userId?.username,
        _id: c.userId?._id
      } 
    }));

    res.json({ post, comments });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const likePost = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });

  if (post.likes.includes(req.user.id)) post.likes.pull(req.user.id);
  else {
    post.likes.push(req.user.id);
    post.dislikes.pull(req.user.id);
  }
  await post.save();
  res.json(post);
};

export const dislikePost = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });

  if (post.dislikes.includes(req.user.id)) post.dislikes.pull(req.user.id);
  else {
    post.dislikes.push(req.user.id);
    post.likes.pull(req.user.id);
  }
  await post.save();
  res.json(post);
};

export const updatePost = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const post = await Post.findById(req.params.id).populate('author', 'username email');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const postAuthorId = post.author._id.toString();
    const currentUserId = req.user.id.toString();

    if (postAuthorId !== currentUserId) {
      return res.status(403).json({ 
        message: 'You can only edit your own posts',
        postAuthor: post.author.username,
        currentUser: req.user.username
      });
    }

    const { title, content, tags, hasCoverPhoto, tempImageFilename, removeCoverPhoto } = req.body;
    
    console.log('📸 ======= POST UPDATE DEBUG =======');
    console.log('📸 Update request with cover photo data:', {
      postId: req.params.id,
      hasCoverPhoto: hasCoverPhoto,
      tempImageFilename: tempImageFilename,
      removeCoverPhoto: removeCoverPhoto,
      currentImage: post.image
    });
    
    if (title !== undefined) {
      post.title = title;
    }
    
    if (content !== undefined) {
      post.content = content;
    }
    
    if (tags !== undefined) {
      post.tags = tags;
    }
    
    // Handle cover photo changes
    if (removeCoverPhoto === true) {
      console.log('📸 Removing cover photo from post:', post._id);
      post.image = null;
      post.markModified('image');
    } else if (hasCoverPhoto && tempImageFilename) {
      console.log('📸 Updating cover photo for post:', post._id);
      // Copy temp image to post-specific filename
      const copySuccess = copyImageToPost(tempImageFilename, post._id);
      if (copySuccess) {
        console.log('📸 Cover photo successfully updated for post:', post._id);
        post.image = `/uploads/post-${post._id}.jpg`;
        post.markModified('image');
      } else {
        console.log('📸 Failed to update cover photo for post:', post._id);
      }
    }

    post.markModified('title');
    post.markModified('content');
    post.markModified('tags');
    
    const savedPost = await post.save({ validateBeforeSave: true });
    await savedPost.populate('author', 'username');
    
    res.json(savedPost);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deletePost = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const post = await Post.findById(req.params.id).populate('author', 'username email');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const postAuthorId = post.author._id.toString();
    const currentUserId = req.user.id.toString();

    if (postAuthorId !== currentUserId) {
      return res.status(403).json({ 
        message: 'You can only delete your own posts',
        postAuthor: post.author.username,
        currentUser: req.user.username
      });
    }

    const commentDeleteResult = await Comment.deleteMany({ postId: req.params.id });
    await Post.findByIdAndDelete(req.params.id);
    
    res.json({ 
      message: 'Post deleted successfully',
      deletedPost: {
        id: post._id,
        title: post.title
      },
      deletedComments: commentDeleteResult.deletedCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getTags = async (req, res) => {
  const tags = await Post.distinct('tags');
  res.json(tags);
};

// Get all scheduled posts for the authenticated user
export const getScheduledPosts = async (req, res) => {
  try {
    const scheduledPosts = await Post.find({
      author: req.user.id,
      status: 'scheduled',
      scheduledAt: { $gt: new Date() }
    })
    .populate('author', 'username')
    .sort({ scheduledAt: 1 });
    
    const postsWithTimeRemaining = scheduledPosts.map(post => {
      const now = new Date();
      const scheduled = new Date(post.scheduledAt);
      const timeRemaining = scheduled.getTime() - now.getTime();
      
      return {
        ...post.toObject(),
        timeRemaining: Math.max(0, Math.ceil(timeRemaining / (1000 * 60))), // minutes
        timeRemainingFormatted: formatTimeRemaining(timeRemaining)
      };
    });
    
    res.json({
      success: true,
      scheduledPosts: postsWithTimeRemaining,
      count: postsWithTimeRemaining.length
    });
  } catch (error) {
    console.error('Error getting scheduled posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get scheduled posts',
      error: error.message
    });
  }
};

// Cancel a scheduled post
export const cancelScheduledPost = async (req, res) => {
  try {
    const { id } = req.params;
    
    const post = await Post.findOne({
      _id: id,
      author: req.user.id,
      status: 'scheduled'
    });
    
    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: 'Scheduled post not found or not authorized' 
      });
    }
    
    // Cancel the scheduled job
    schedulerService.cancelScheduledPost(id);
    
    // Update post status to draft
    post.status = 'draft';
    post.scheduledAt = null;
    await post.save();
    
    res.json({
      success: true,
      message: 'Scheduled post cancelled and saved as draft',
      post
    });
  } catch (error) {
    console.error('Error cancelling scheduled post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel scheduled post',
      error: error.message
    });
  }
};

// Reschedule a post
export const reschedulePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { scheduledAt } = req.body;
    
    if (!scheduledAt) {
      return res.status(400).json({ message: 'New scheduled time is required' });
    }
    
    const scheduleDate = new Date(scheduledAt);
    const now = new Date();
    
    if (scheduleDate <= now) {
      return res.status(400).json({ message: 'Scheduled time must be in the future' });
    }
    
    const post = await Post.findOne({
      _id: id,
      author: req.user.id,
      status: 'scheduled'
    });
    
    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: 'Scheduled post not found or not authorized' 
      });
    }
    
    // Cancel existing schedule
    schedulerService.cancelScheduledPost(id);
    
    // Update post with new schedule
    post.scheduledAt = scheduleDate;
    await post.save();
    
    // Create new schedule
    const scheduleResult = schedulerService.scheduleIndividualPost(post._id, scheduledAt);
    
    res.json({
      success: true,
      message: `Post rescheduled for ${scheduleDate.toLocaleString()}`,
      post,
      scheduling: scheduleResult
    });
  } catch (error) {
    console.error('Error rescheduling post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reschedule post',
      error: error.message
    });
  }
};

// Helper function to format time remaining
function formatTimeRemaining(milliseconds) {
  if (milliseconds <= 0) return 'Ready to publish';
  
  const minutes = Math.floor(milliseconds / (1000 * 60));
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
