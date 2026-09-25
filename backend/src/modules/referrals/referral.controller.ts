import { Router, Response } from 'express';
import { authenticate, AuthenticatedRequest } from '../../common/middleware/auth.middleware';
import { store } from '../../database/data-store';

const router = Router();

// GET /api/v1/referrals
router.get('/', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const profile = store.profiles.get(userId);

  // Find invited users who signed up with this user's referral code
  const invitedUsers = [];
  if (profile) {
    for (const p of store.profiles.values()) {
      if (p.referred_by_code === profile.referral_code) {
        invitedUsers.push({
          username: p.username,
          joinedAt: p.created_at,
          rewardEarned: 25.0,
          status: 'COMPLETED',
        });
      }
    }
  }

  res.json({
    success: true,
    data: {
      referralCode: profile?.referral_code || '',
      shareMessage: `Join me on Tournament X, India's leading Free Fire skill-based esports platform! Use my referral code ${profile?.referral_code} to get ₹25 bonus cash!`,
      rewardPerReferral: 25.0,
      totalReferrals: invitedUsers.length,
      totalEarned: invitedUsers.length * 25.0,
      invitedUsers,
    },
  });
});

export const referralRouter = router;
