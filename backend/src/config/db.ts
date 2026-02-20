import mongoose from 'mongoose';
import { env } from './env.js';

let isConnected = false;

export const connectDB = async (): Promise<void> => {
  const maxRetries = 5;
  const retryDelay = 5000; // 5 seconds

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await mongoose.connect(env.MONGO_URI);
      isConnected = true;
      console.log(`MongoDB connected: ${env.MONGO_URI}`);
      return;
    } catch (error) {
      console.error(`MongoDB connection attempt ${attempt}/${maxRetries} failed:`, error);
      
      if (attempt === maxRetries) {
        console.error('Max retries reached. Could not connect to MongoDB.');
        throw error;
      }
      
      console.log(`Retrying in ${retryDelay / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
};

export const getConnectionStatus = (): string => {
  if (!isConnected) {
    return 'disconnected';
  }
  
  const state = mongoose.connection.readyState;
  switch (state) {
    case 0:
      return 'disconnected';
    case 1:
      return 'connected';
    case 2:
      return 'connecting';
    case 3:
      return 'disconnecting';
    default:
      return 'unknown';
  }
};

// Monitor connection events
mongoose.connection.on('connected', () => {
  isConnected = true;
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err: Error) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn('Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('Mongoose connection closed through app termination');
  process.exit(0);
});
