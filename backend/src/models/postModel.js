import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  image: String, // URL path for cover photo
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tags: [String],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
  scheduledAt: { type: Date, default: null },
  status: { 
    type: String, 
    enum: ['draft', 'published', 'scheduled'], 
    default: 'published' 
  },
  aiEnhanced: {
    seoScore: { type: Number, default: 0 },
    wordCount: { type: Number, default: 0 },
    readingTime: { type: String, default: '1 min read' },
    lastEnhanced: { type: Date, default: null }
  },
  
  // Analytics for monetization
  analytics: {
    views: { type: Number, default: 0 },
    uniqueViews: { type: Number, default: 0 },
    totalReadingTime: { type: Number, default: 0 }, // in seconds
    averageReadingTime: { type: Number, default: 0 }, // in seconds
    engagementRate: { type: Number, default: 0 }, // percentage
    revenue: {
      totalEarned: { type: Number, default: 0 },
      thisMonth: { type: Number, default: 0 },
      lastCalculated: { type: Date, default: Date.now }
    },
    dailyStats: [{
      date: { type: Date, required: true },
      views: { type: Number, default: 0 },
      readingTime: { type: Number, default: 0 }, // in seconds
      engagements: { type: Number, default: 0 } // likes + comments
    }]
  }
});

export default mongoose.model('Post', postSchema);
