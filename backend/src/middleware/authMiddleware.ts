import type { NextFunction, Request, Response } from 'express';
import { requireAuth, getAuth } from '@clerk/express';

// Extend Express Request interface to include user info
declare global {
  namespace Express {
    interface Request {
      clerkUserId?: string;
      clerkSession?: any;
      user?: any;
    }
  }
}

// Auth middleware using Clerk SDK to verify tokens
// requireAuth returns middleware that verifies Clerk session/token
export const authMiddleware = requireAuth();

// Admin role middleware (placeholder - implement role lookup as needed)
export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Use getAuth to access clerk auth details
  try {
    const auth = getAuth(req as any);
    if (!auth || !auth.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // TODO: lookup user in DB and verify admin role
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Authentication required' });
  }
};
