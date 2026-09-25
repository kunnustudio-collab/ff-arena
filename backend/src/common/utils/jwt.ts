import jwt from 'jsonwebtoken';
import { config } from '../../config';

export interface TokenPayload {
  userId: string;
  role: string;
  email?: string;
  phone?: string;
}

export class JwtUtil {
  static signAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: '1h',
    });
  }

  static signRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: '30d',
    });
  }

  static signAdminToken(payload: TokenPayload): string {
    return jwt.sign(payload, config.jwt.adminSecret, {
      expiresIn: '12h',
    });
  }

  static verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, config.jwt.secret) as TokenPayload;
  }

  static verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(token, config.jwt.refreshSecret) as TokenPayload;
  }

  static verifyAdminToken(token: string): TokenPayload {
    return jwt.verify(token, config.jwt.adminSecret) as TokenPayload;
  }
}
