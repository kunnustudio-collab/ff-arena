"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.referralRouter = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../../common/middleware/auth.middleware");
const data_store_1 = require("../../database/data-store");
const router = (0, express_1.Router)();
// GET /api/v1/referrals
router.get('/', auth_middleware_1.authenticate, (req, res) => {
    const userId = req.user.id;
    const profile = data_store_1.store.profiles.get(userId);
    // Find invited users who signed up with this user's referral code
    const invitedUsers = [];
    if (profile) {
        for (const p of data_store_1.store.profiles.values()) {
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
exports.referralRouter = router;
