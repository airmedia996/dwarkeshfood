import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase.js';
import { AppError } from './errorHandler.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    throw new AppError('No authentication token provided', 401);
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new AppError('Invalid or expired token', 401);
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    req.user = {
      id: user.id,
      email: user.email || '',
      role: profile?.role || 'customer'
    };
    next();
  } catch (error) {
    throw new AppError('Invalid or expired token', 401);
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new AppError('Insufficient permissions', 403);
    }
    next();
  };
};

export const adminOnly = requireRole(['admin']);
export const customerOnly = requireRole(['customer']);
