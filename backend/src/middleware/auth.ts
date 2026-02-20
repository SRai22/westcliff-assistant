/**
 * RBAC Middleware: requireAuth and requireStaff
 * 
 * Enforces authentication and authorization at the router level.
 * Never call these inside controller logic 
 */

import { Request, Response, NextFunction } from 'express';
import { User } from '../models';

/**
 * requireAuth - Ensures user is authenticated
 * 
 * Checks for req.session.userId, fetches the User from MongoDB,
 * attaches it to req.user, and returns 401 if no valid session.
 * 
 * Usage: router.get('/protected', requireAuth, controller);
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Check if session exists and has userId
    if (!req.session || !req.session.userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Fetch user from database
    const user = await User.findById(req.session.userId);

    if (!user) {
      // User was deleted or session is stale
      req.session.destroy((err) => {
        if (err) console.error('Error destroying stale session:', err);
      });
      res.status(401).json({ error: 'User not found' });
      return;
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Error in requireAuth middleware:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * requireStaff - Ensures user is authenticated AND has STAFF role
 * 
 * Calls requireAuth first, then checks req.user.role === 'STAFF'
 * and returns 403 if not.
 * 
 * Usage: router.post('/admin-action', requireStaff, controller);
 */
export async function requireStaff(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  // First check authentication
  await requireAuth(req, res, () => {
    // If requireAuth succeeded, req.user is set
    if (!req.user) {
      // requireAuth already sent a response, don't send another
      return;
    }

    // Check if user has STAFF role
    if (req.user.role !== 'STAFF') {
      res.status(403).json({ 
        error: 'Access denied',
        message: 'This resource requires staff privileges' 
      });
      return;
    }

    // User is authenticated and has STAFF role
    next();
  });
}
