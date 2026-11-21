// Sample data initialization script to test monetization
import mongoose from 'mongoose';
import User from './src/models/userModel.js';
import Post from './src/models/postModel.js';

async function initSampleData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/blog');
    console.log('Connected successfully');

    // Find existing users and posts
    const users = await User.find().limit(5);
    const posts = await Post.find().limit(5);

    console.log(`Found ${users.length} users and ${posts.length} posts`);

    if (users.length === 0 || posts.length === 0) {
      console.log('No users or posts found. Please create some content first.');
      await mongoose.connection.close();
      return;
    }

    // Add sample analytics data to posts
    for (let i = 0; i < Math.min(posts.length, 3); i++) {
      const post = posts[i];
      const sampleViews = 50 + (i * 30); // 50, 80, 110 views
      const sampleReadingTime = sampleViews * 180; // 3 minutes average per view
      
      await Post.findByIdAndUpdate(post._id, {
        $set: {
          'analytics.views': sampleViews,
          'analytics.totalReadingTime': sampleReadingTime,
          'analytics.revenue.totalEarned': 0 // Will be calculated by service
        }
      });
      
      console.log(`Updated post "${post.title}" - ${sampleViews} views, ${Math.floor(sampleReadingTime/3600)}h reading time`);
    }

    // Add sample monetization data to users
    for (let i = 0; i < Math.min(users.length, 3); i++) {
      const user = users[i];
      const isAuthor = i < 2; // First 2 users are authors
      const isReader = i >= 1; // Last 2 users are readers (one is both)
      
      const updateData = {};
      
      if (isAuthor) {
        // Author data
        updateData['monetization.authorEarnings'] = 5.50 + (i * 2.25); // $5.50, $7.75
        updateData['monetization.authorEligible'] = true;
        updateData['monetization.authorJoinedDate'] = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000)); // 30 days ago
      }
      
      if (isReader) {
        // Reader data
        const readingHours = 25 + (i * 15); // 25h, 40h of reading
        updateData['monetization.readerEarnings'] = 1.25 + (i * 0.75); // $1.25, $2.00
        updateData['monetization.readerEligible'] = true;
        updateData['monetization.readerJoinedDate'] = new Date(Date.now() - (20 * 24 * 60 * 60 * 1000)); // 20 days ago
        updateData['monetization.readerAnalytics.totalReadingTime'] = readingHours * 3600; // Convert to seconds
        updateData['monetization.readerAnalytics.totalEngagements'] = 12 + (i * 5); // 12, 17 engagements
        updateData['monetization.readerAnalytics.activeDays'] = 15 + i; // 15, 16 days
        updateData['monetization.readerAnalytics.lastActiveDate'] = new Date();
      }
      
      // Combined totals
      const authorEarnings = updateData['monetization.authorEarnings'] || 0;
      const readerEarnings = updateData['monetization.readerEarnings'] || 0;
      updateData['monetization.totalEarnings'] = authorEarnings + readerEarnings;
      updateData['monetization.currentBalance'] = authorEarnings + readerEarnings;

      await User.findByIdAndUpdate(user._id, { $set: updateData });
      
      const type = isAuthor && isReader ? 'Author + Reader' : isAuthor ? 'Author' : 'Reader';
      console.log(`Updated user "${user.username}" as ${type} - $${(authorEarnings + readerEarnings).toFixed(2)} total earnings`);
    }

    console.log('\n✅ Sample data initialized successfully!');
    console.log('You can now test the monetization dashboard with real data.');
    
    await mongoose.connection.close();

  } catch (error) {
    console.error('Error initializing sample data:', error);
    await mongoose.connection.close();
  }
}

console.log('🚀 Initializing sample monetization data...\n');
initSampleData();