/**
 * Type definitions for extending Express Request
 */

import { IUser } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export {};
