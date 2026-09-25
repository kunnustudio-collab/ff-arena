import { Request, Response, NextFunction } from 'express';
import { JwtUtil } from '../utils/jwt';
import { ApiError } from '../errors/api-error';
import { store } from '../../database/data-store';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    email: string;
    phone: string;
    status: string;
  };
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('Authentication token is required'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = JwtUtil.verifyAccessToken(token);
    const user = store.users.get(decoded.userId);

    if (!user) {
      return next(ApiError.unauthorized('User not found'));
    }

    if (user.status === 'SUSPENDED') {
      return next(ApiError.forbidden('Account is suspended. Please contact customer support.', 'ACCOUNT_SUSPENDED'));
    }

    req.user = {
      id: user.id,
      role: user.role,
      email: user.email,
      phone: user.phone,
      status: user.status,
    };

    next();
  } catch (err: any) {
    return next(ApiError.unauthorized('Invalid or expired authentication token'));
  }
};
