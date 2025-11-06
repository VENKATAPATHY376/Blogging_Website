import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Debug logging for environment variables
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('MONGO_URI exists:', !!process.env.MONGO_URI);
    console.log('MONGO_URI (masked):', process.env.MONGO_URI ? 
      process.env.MONGO_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@') : 'undefined');
    
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI environment variable is not set');
    }
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

export default connectDB;
