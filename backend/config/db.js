import mongoose from 'mongoose';

// Fail fast instead of buffering queries for 10s when MongoDB is unavailable.
mongoose.set('bufferCommands', false);

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error(
      'MONGO_URI is not set. Add it in the Render dashboard: Environment > MONGO_URI.'
    );
  }

  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
    // Use an explicit DB name so a URI without "/blogdb" does not default to "test".
    dbName: process.env.MONGO_DB_NAME || 'blogdb',
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('MongoDB reconnected');
  });
};

export default connectDB;
