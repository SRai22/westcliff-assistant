/**
 * Authentication routes
 * Provides dev-login, user profile, and logout endpoints
 */

import { Router, Request, Response } from 'express';
import { User, UserRole } from '../models/User.js';

const router = Router();

/**
 * POST /auth/dev-login
 * Development-only login endpoint
 * Accepts email, upserts user, and creates session
 */
router.post('/dev-login', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }

    // Generate a dev googleId from email
    const devGoogleId = `dev_${email.replace(/[@.]/g, '_')}`;
    
    // Extract name from email (part before @)
    const emailName = email.split('@')[0];
    const name = emailName
      .split(/[._-]/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

    // Determine role based on email domain or pattern
    const role = email.includes('@westcliff.edu') && !email.includes('student')
      ? UserRole.STAFF
      : UserRole.STUDENT;

    // Upsert user (update if exists, create if doesn't)
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      {
        $set: {
          email: email.toLowerCase(),
          name,
          role,
        },
        $setOnInsert: {
          googleId: devGoogleId,
        },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    );

    // Set session
    req.session.userId = user._id.toString();

    // Return user (exclude sensitive fields if any)
    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('Dev login error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

/**
 * GET /me
 * Get current authenticated user profile
 */
router.get('/me', async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.session.userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Fetch user from database
    const user = await User.findById(req.session.userId);

    if (!user) {
      // Session exists but user doesn't - clear session
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destruction error:', err);
        }
      });
      res.status(401).json({ error: 'User not found' });
      return;
    }

    // Return user profile
    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /logout
 * Destroy session and log out user
 */
router.post('/logout', (req: Request, res: Response) => {
  if (!req.session.userId) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      res.status(500).json({ error: 'Failed to logout' });
      return;
    }

    res.clearCookie('westcliff.sid');
    res.json({ message: 'Logged out successfully' });
  });
});

export default router;
