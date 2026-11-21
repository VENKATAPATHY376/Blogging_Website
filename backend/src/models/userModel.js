import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  
  // Dual Monetization System
  monetization: {
    // AUTHOR EARNINGS (from own posts)
    authorEarnings: { type: Number, default: 0 },
    authorEligible: { type: Boolean, default: false },
    authorJoinedDate: { type: Date, default: null },
    
    // READER EARNINGS (from reading others' posts)
    readerEarnings: { type: Number, default: 0 },
    readerEligible: { type: Boolean, default: false },
    readerJoinedDate: { type: Date, default: null },
    
    // Reader Analytics
    readerAnalytics: {
      totalReadingTime: { type: Number, default: 0 }, // seconds
      totalEngagements: { type: Number, default: 0 }, // likes + comments
      activeDays: { type: Number, default: 0 },
      lastActiveDate: { type: Date, default: null },
      dailyReadingStreak: { type: Number, default: 0 }
    },
    
    // Combined totals
    totalEarnings: { type: Number, default: 0 }, // author + reader
    currentBalance: { type: Number, default: 0 },
    lastPaymentDate: { type: Date, default: null },
    
    // Payment settings
    paymentInfo: {
      method: { type: String, enum: ['paypal', 'bank', 'stripe', ''], default: '' },
      account: { type: String, default: '' },
      isVerified: { type: Boolean, default: false }
    }
  }
});

export default mongoose.model('User', userSchema);
