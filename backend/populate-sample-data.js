// Simple data population script - run this when server is running
console.log('📊 Adding sample monetization data via API calls...\n');

const API_BASE = 'http://localhost:4000/api';

// Sample data to add
const sampleReadingSessions = [
  { postId: null, readingTime: 45 }, // Will be updated with actual post IDs
  { postId: null, readingTime: 120 },
  { postId: null, readingTime: 30 },
  { postId: null, readingTime: 90 },
  { postId: null, readingTime: 60 }
];

async function populateData() {
  try {
    // Get posts and users (no auth needed for reading posts)
    console.log('🔍 Fetching existing posts...');
    const postsResponse = await fetch(`${API_BASE}/posts`);
    const postsData = await postsResponse.json();
    
    if (!postsData.posts || postsData.posts.length === 0) {
      console.log('❌ No posts found. Please create some posts first.');
      return;
    }
    
    console.log(`✅ Found ${postsData.posts.length} posts`);
    
    // Simulate reading sessions for each post
    for (let i = 0; i < Math.min(postsData.posts.length, sampleReadingSessions.length); i++) {
      const post = postsData.posts[i];
      const session = sampleReadingSessions[i];
      
      console.log(`📖 Simulating ${session.readingTime}s reading session on "${post.title}"`);
      
      try {
        const response = await fetch(`${API_BASE}/monetization/record-view`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            postId: post._id,
            readingTime: session.readingTime
          })
        });
        
        const result = await response.json();
        
        if (result.success) {
          console.log(`  ✅ Reading time recorded`);
          if (result.earnings && (result.earnings.author || result.earnings.reader)) {
            if (result.earnings.author) {
              console.log(`    💰 Author earned: $${result.earnings.author.amount.toFixed(4)}`);
            }
            if (result.earnings.reader) {
              console.log(`    📚 Reader earned: $${result.earnings.reader.amount.toFixed(4)}`);
            }
          } else {
            console.log(`    ℹ️  No earnings (user not authenticated or not eligible)`);
          }
        } else {
          console.log(`  ❌ Failed: ${result.message}`);
        }
      } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n🎉 Sample data population completed!');
    console.log('\nTo see earnings in action:');
    console.log('1. Create an account and login');
    console.log('2. Read posts for 15+ seconds each');
    console.log('3. Like and comment on posts');
    console.log('4. Check the Earnings page to see accumulated earnings');
    
  } catch (error) {
    console.error('❌ Error populating data:', error.message);
    console.log('\nMake sure:');
    console.log('1. The server is running on http://localhost:4000');
    console.log('2. MongoDB is connected');
    console.log('3. There are some posts in the database');
  }
}

populateData();