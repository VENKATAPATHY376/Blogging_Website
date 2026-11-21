import mongoose from 'mongoose';
import User from './backend/src/models/userModel.js';
import Post from './backend/src/models/postModel.js';

async function checkDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/blog');
    console.log('Connected to MongoDB');

    // Check users
    const users = await User.find({}).lean();
    console.log('\n=== USERS ===');
    console.log(`Total users: ${users.length}`);
    
    if (users.length > 0) {
      users.forEach((user, index) => {
        console.log(`\nUser ${index + 1}:`);
        console.log(`- Username: ${user.username}`);
        console.log(`- Created: ${user.createdAt}`);
        console.log(`- Monetization:`, user.monetization || 'No monetization data');
      });
    }

    // Check posts
    const posts = await Post.find({}).populate('author').lean();
    console.log('\n=== POSTS ===');
    console.log(`Total posts: ${posts.length}`);
    
    if (posts.length > 0) {
      posts.forEach((post, index) => {
        console.log(`\nPost ${index + 1}:`);
        console.log(`- Title: ${post.title}`);
        console.log(`- Author: ${post.author?.username || 'Unknown'}`);
        console.log(`- Created: ${post.createdAt}`);
        console.log(`- Status: ${post.status}`);
        console.log(`- Analytics:`, post.analytics || 'No analytics data');
        console.log(`- Views: ${post.analytics?.views || 0}`);
        console.log(`- Reading time: ${post.analytics?.totalReadingTime || 0}s`);
      });
    }

    // Check if analytics fields exist
    console.log('\n=== ANALYTICS CHECK ===');
    const postsWithAnalytics = await Post.find({ 
      $or: [
        { 'analytics.views': { $gt: 0 } },
        { 'analytics.totalReadingTime': { $gt: 0 } }
      ]
    }).lean();
    console.log(`Posts with analytics data: ${postsWithAnalytics.length}`);

    // Check user monetization
    const usersWithMonetization = await User.find({
      $or: [
        { 'monetization.authorEarnings': { $gt: 0 } },
        { 'monetization.readerEarnings': { $gt: 0 } },
        { 'monetization.readerAnalytics.totalReadingTime': { $gt: 0 } }
      ]
    }).lean();
    console.log(`Users with monetization data: ${usersWithMonetization.length}`);

    await mongoose.connection.close();
    console.log('\nDatabase connection closed');

  } catch (error) {
    console.error('Database check failed:', error);
    process.exit(1);
  }
}

checkDatabase();