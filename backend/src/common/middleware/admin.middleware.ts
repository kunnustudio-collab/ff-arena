import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { ApiError } from '../errors/api-error';
import { JwtUtil } from '../utils/jwt';
import { store } from '../../database/data-store';

export const requireAdmin = (allowedRoles: string[] = ['SUPER_ADMIN', 'ADMIN']) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(ApiError.unauthorized('Admin authorization token is required'));
    }

    const token = authHeader.split(' ')[1];
    try {
      let decoded;
      try {
        decoded = JwtUtil.verifyAdminToken(token);
      } catch {
        decoded = JwtUtil.verifyAccessToken(token);
      }

      const user = store.users.get(decoded.userId);
      if (!user) {
        return next(ApiError.unauthorized('Admin user not found'));
      }

      const adminRoles = ['SUPER_ADMIN', 'ADMIN', 'FINANCE_ADMIN', 'TOURNAMENT_ADMIN', 'KYC_ADMIN', 'SUPPORT_AGENT'];
      if (!adminRoles.includes(user.role)) {
        return next(ApiError.forbidden('Requires administrative privileges'));
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role) && user.role !== 'SUPER_ADMIN') {
        return next(ApiError.forbidden(`Insufficient permissions for this operation. Required: ${allowedRoles.join(', ')}`));
      }

      req.user = {
        id: user.id,
        role: user.role,
        email: user.email,
        phone: user.phone,
        status: user.status,
      };

      next();
    } catch (err) {
      return next(ApiError.unauthorized('Invalid admin authorization credentials'));
    }
  };
};
