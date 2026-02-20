import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3001', 10),
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/westcliff',
  SESSION_SECRET: process.env.SESSION_SECRET || 'change-me-in-production',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/auth/google/callback',
  AI_SERVICE_URL: process.env.AI_SERVICE_URL || 'http://localhost:8001',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
} as const;

export type Env = typeof env;
