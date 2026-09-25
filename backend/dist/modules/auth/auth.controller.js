"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const auth_service_1 = require("./auth.service");
const auth_middleware_1 = require("../../common/middleware/auth.middleware");
const data_store_1 = require("../../database/data-store");
const router = (0, express_1.Router)();
// POST /api/v1/auth/otp/send
router.post('/otp/send', async (req, res, next) => {
    try {
        const { identifier } = req.body;
        if (!identifier) {
            return res.status(400).json({ success: false, message: 'Phone number or email is required' });
        }
        const result = await auth_service_1.AuthService.sendOtp(identifier);
        res.json(result);
    }
    catch (err) {
        next(err);
    }
});
// POST /api/v1/auth/register
router.post('/register', async (req, res, next) => {
    try {
        const { phone, email, password, fullName, username, dateOfBirth, state, referralCode, deviceId } = req.body;
        if (!phone || !email || !fullName || !username || !dateOfBirth || !state) {
            return res.status(400).json({ success: false, message: 'Missing required registration parameters' });
        }
        const result = await auth_service_1.AuthService.register({
            phone,
            email,
            password,
            fullName,
            username,
            dateOfBirth,
            state,
            referralCode,
            deviceId,
            ipAddress: req.ip,
        });
        res.status(201).json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
});
// POST /api/v1/auth/login
router.post('/login', async (req, res, next) => {
    try {
        const { identifier, password, otp, deviceId } = req.body;
        if (!identifier) {
            return res.status(400).json({ success: false, message: 'Mobile or email identifier is required' });
        }
        if (otp) {
            const result = await auth_service_1.AuthService.loginWithOtp(identifier, otp, deviceId, req.ip);
            return res.json({ success: true, data: result });
        }
        if (!password) {
            return res.status(400).json({ success: false, message: 'Password is required' });
        }
        const result = await auth_service_1.AuthService.loginWithPassword(identifier, password, deviceId, req.ip);
        res.json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
});
// POST /api/v1/auth/admin/login
router.post('/admin/login', async (req, res, next) => {
    try {
        const { email, password, otp2Fa } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password required' });
        }
        const result = await auth_service_1.AuthService.adminLogin(email, password, otp2Fa);
        res.json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/v1/auth/me
router.get('/me', auth_middleware_1.authenticate, (req, res) => {
    const userId = req.user.id;
    const user = data_store_1.store.users.get(userId);
    const profile = data_store_1.store.profiles.get(userId);
    const wallet = data_store_1.store.wallets.get(userId);
    const kyc = data_store_1.store.kycProfiles.get(userId);
    res.json({
        success: true,
        data: {
            user,
            profile,
            wallet,
            kycStatus: kyc ? kyc.status : 'UNVERIFIED',
        },
    });
});
exports.authRouter = router;
