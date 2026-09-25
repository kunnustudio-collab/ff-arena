import { Router, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { authenticate, AuthenticatedRequest } from '../../common/middleware/auth.middleware';
import { store } from '../../database/data-store';
import { ApiError } from '../../common/errors/api-error';
import { AuditService } from '../../common/utils/audit';

const router = Router();

// GET /api/v1/users/profile
router.get('/profile', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const user = store.users.get(userId);
  const profile = store.profiles.get(userId);
  const wallet = store.wallets.get(userId);
  const kyc = store.kycProfiles.get(userId);

  if (!profile) {
    return res.status(404).json({ success: false, message: 'Profile not found' });
  }

  res.json({
    success: true,
    data: {
      user: {
        id: user?.id,
        phone: user?.phone,
        email: user?.email,
        role: user?.role,
        status: user?.status,
        riskScore: user?.risk_score,
      },
      profile,
      wallet: wallet
        ? {
            totalBalance: wallet.deposit_balance + wallet.winnings_balance + wallet.bonus_balance,
            depositBalance: wallet.deposit_balance,
            winningsBalance: wallet.winnings_balance,
            bonusBalance: wallet.bonus_balance,
            lockedBalance: wallet.locked_balance,
            currency: wallet.currency,
          }
        : null,
      kycStatus: kyc?.status || 'UNVERIFIED',
    },
  });
});

// PUT /api/v1/users/profile
router.put('/profile', authenticate, (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const profile = store.profiles.get(userId);
    if (!profile) throw ApiError.notFound('Profile not found');

    const { fullName, ffUid, ffIgn, preferredLanguage, avatarUrl } = req.body;

    if (fullName) profile.full_name = fullName;
    if (ffUid !== undefined) profile.ff_uid = ffUid;
    if (ffIgn !== undefined) profile.ff_ign = ffIgn;
    if (preferredLanguage) profile.preferred_language = preferredLanguage;
    if (avatarUrl) profile.avatar_url = avatarUrl;
    profile.updated_at = new Date().toISOString();

    AuditService.log({
      actorId: userId,
      actorRole: 'PLAYER',
      action: 'UPDATE_PROFILE',
      entity: 'user_profiles',
      entityId: userId,
    });

    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/users/security/password
router.put('/security/password', authenticate, (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const user = store.users.get(userId);
    if (!user) throw ApiError.notFound('User not found');

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      throw ApiError.badRequest('Current and new password are required');
    }

    if (user.password_hash && !bcrypt.compareSync(currentPassword, user.password_hash)) {
      throw ApiError.badRequest('Incorrect current password');
    }

    user.password_hash = bcrypt.hashSync(newPassword, 10);
    user.updated_at = new Date().toISOString();

    AuditService.log({
      actorId: userId,
      actorRole: 'PLAYER',
      action: 'CHANGE_PASSWORD',
      entity: 'users',
      entityId: userId,
    });

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/users/close-account
router.post('/close-account', authenticate, (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const user = store.users.get(userId);
    if (!user) throw ApiError.notFound('User not found');

    const wallet = store.wallets.get(userId);
    if (wallet && (wallet.deposit_balance > 0 || wallet.winnings_balance > 0)) {
      throw ApiError.badRequest('Cannot close account with positive wallet balance. Please withdraw all funds first.');
    }

    user.status = 'CLOSED';
    user.updated_at = new Date().toISOString();

    AuditService.log({
      actorId: userId,
      actorRole: 'PLAYER',
      action: 'CLOSE_ACCOUNT',
      entity: 'users',
      entityId: userId,
      reason: req.body.reason || 'User requested account closure',
    });

    res.json({ success: true, message: 'Account closed successfully' });
  } catch (err) {
    next(err);
  }
});

export const userRouter = router;
