"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const auth_middleware_1 = require("../../common/middleware/auth.middleware");
const data_store_1 = require("../../database/data-store");
const api_error_1 = require("../../common/errors/api-error");
const audit_1 = require("../../common/utils/audit");
const router = (0, express_1.Router)();
// GET /api/v1/users/profile
router.get('/profile', auth_middleware_1.authenticate, (req, res) => {
    const userId = req.user.id;
    const user = data_store_1.store.users.get(userId);
    const profile = data_store_1.store.profiles.get(userId);
    const wallet = data_store_1.store.wallets.get(userId);
    const kyc = data_store_1.store.kycProfiles.get(userId);
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
router.put('/profile', auth_middleware_1.authenticate, (req, res, next) => {
    try {
        const userId = req.user.id;
        const profile = data_store_1.store.profiles.get(userId);
        if (!profile)
            throw api_error_1.ApiError.notFound('Profile not found');
        const { fullName, ffUid, ffIgn, preferredLanguage, avatarUrl } = req.body;
        if (fullName)
            profile.full_name = fullName;
        if (ffUid !== undefined)
            profile.ff_uid = ffUid;
        if (ffIgn !== undefined)
            profile.ff_ign = ffIgn;
        if (preferredLanguage)
            profile.preferred_language = preferredLanguage;
        if (avatarUrl)
            profile.avatar_url = avatarUrl;
        profile.updated_at = new Date().toISOString();
        audit_1.AuditService.log({
            actorId: userId,
            actorRole: 'PLAYER',
            action: 'UPDATE_PROFILE',
            entity: 'user_profiles',
            entityId: userId,
        });
        res.json({ success: true, data: profile });
    }
    catch (err) {
        next(err);
    }
});
// PUT /api/v1/users/security/password
router.put('/security/password', auth_middleware_1.authenticate, (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = data_store_1.store.users.get(userId);
        if (!user)
            throw api_error_1.ApiError.notFound('User not found');
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            throw api_error_1.ApiError.badRequest('Current and new password are required');
        }
        if (user.password_hash && !bcryptjs_1.default.compareSync(currentPassword, user.password_hash)) {
            throw api_error_1.ApiError.badRequest('Incorrect current password');
        }
        user.password_hash = bcryptjs_1.default.hashSync(newPassword, 10);
        user.updated_at = new Date().toISOString();
        audit_1.AuditService.log({
            actorId: userId,
            actorRole: 'PLAYER',
            action: 'CHANGE_PASSWORD',
            entity: 'users',
            entityId: userId,
        });
        res.json({ success: true, message: 'Password updated successfully' });
    }
    catch (err) {
        next(err);
    }
});
// POST /api/v1/users/close-account
router.post('/close-account', auth_middleware_1.authenticate, (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = data_store_1.store.users.get(userId);
        if (!user)
            throw api_error_1.ApiError.notFound('User not found');
        const wallet = data_store_1.store.wallets.get(userId);
        if (wallet && (wallet.deposit_balance > 0 || wallet.winnings_balance > 0)) {
            throw api_error_1.ApiError.badRequest('Cannot close account with positive wallet balance. Please withdraw all funds first.');
        }
        user.status = 'CLOSED';
        user.updated_at = new Date().toISOString();
        audit_1.AuditService.log({
            actorId: userId,
            actorRole: 'PLAYER',
            action: 'CLOSE_ACCOUNT',
            entity: 'users',
            entityId: userId,
            reason: req.body.reason || 'User requested account closure',
        });
        res.json({ success: true, message: 'Account closed successfully' });
    }
    catch (err) {
        next(err);
    }
});
exports.userRouter = router;
