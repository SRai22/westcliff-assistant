/**
 * Type definitions for extending Express and Express Session
 */

import { Types } from 'mongoose';

declare module 'express-session' {
  interface SessionData {
    userId: string;
  }
}

declare global {
  namespace Express {
    interface Request {
      session: import('express-session').Session & {
        userId?: string;
      };
    }
  }
}

export {};
