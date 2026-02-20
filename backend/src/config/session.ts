/**
 * Session middleware configuration using express-session and connect-mongo
 */

import session from 'express-session';
import MongoStore from 'connect-mongo';
import { env } from './env.js';

/**
 * Create and configure session middleware
 * Sessions are stored in MongoDB using connect-mongo
 */
export const sessionMiddleware = session({
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: env.MONGO_URI,
    touchAfter: 24 * 3600, // Lazy session update (24 hours)
    ttl: 14 * 24 * 60 * 60, // Session TTL (14 days)
    crypto: {
      secret: env.SESSION_SECRET,
    },
  }),
  cookie: {
    maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
    httpOnly: true,
    secure: env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
  },
  name: 'westcliff.sid', // Custom session cookie name
});
