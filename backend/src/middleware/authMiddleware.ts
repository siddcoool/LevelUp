import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request interface to include user info
declare global {
  namespace Express {
    interface Request {
      clerkUserId?: string;
      user?: any;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // In a real app, you'd verify this with Clerk's public key
    // For now, we'll use a simple JWT verification
    // You should replace this with proper Clerk verification
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    if (!decoded.sub) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Add user ID to request for use in routes
    req.clerkUserId = decoded.sub;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Admin role middleware
export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.clerkUserId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // In a real app, you'd check the user's role from the database
  // For now, we'll allow all authenticated users
  // You should implement proper role checking here
  next();
};
