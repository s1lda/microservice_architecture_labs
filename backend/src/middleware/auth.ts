import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export interface UserInfo {
  id: number;
}

export interface AuthRequest extends Request {
  user?: UserInfo;
}


export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);

    try {
      const decoded = verifyToken(token);

      req.user = { id: decoded.id };
      
      return next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
};

export const optionalAuth = async (req: AuthRequest, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = verifyToken(token);
        req.user = { id: decoded.id };
      } catch (error) {
      }
    }
    next();
  } catch (error) {
    next();
  }
};
