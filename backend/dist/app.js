"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const error_middleware_1 = require("./common/middleware/error.middleware");
const auth_controller_1 = require("./modules/auth/auth.controller");
const user_controller_1 = require("./modules/users/user.controller");
const kyc_controller_1 = require("./modules/kyc/kyc.controller");
const wallet_controller_1 = require("./modules/wallet/wallet.controller");
const tournament_controller_1 = require("./modules/tournaments/tournament.controller");
const leaderboard_controller_1 = require("./modules/leaderboard/leaderboard.controller");
const referral_controller_1 = require("./modules/referrals/referral.controller");
const support_controller_1 = require("./modules/support/support.controller");
const notification_controller_1 = require("./modules/notifications/notification.controller");
const settings_controller_1 = require("./modules/settings/settings.controller");
const admin_controller_1 = require("./modules/admin/admin.controller");
const createApp = () => {
    const app = (0, express_1.default)();
    // Security Headers
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: false, // For local dev & API usage
        crossOriginEmbedderPolicy: false,
    }));
    // CORS Configuration
    app.use((0, cors_1.default)({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id', 'idempotency-key'],
    }));
    // Body Parsing
    app.use(express_1.default.json({ limit: '10mb' }));
    app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
    // Request ID & Logger
    app.use((req, res, next) => {
        req.headers['x-request-id'] = req.headers['x-request-id'] || `req-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        next();
    });
    // Observability & Health Endpoints
    app.get('/health', (req, res) => {
        res.json({
            status: 'UP',
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            service: 'tournament-x-api',
            version: '1.0.0',
        });
    });
    app.get('/ready', (req, res) => {
        res.json({
            ready: true,
            timestamp: new Date().toISOString(),
        });
    });
    app.get('/live', (req, res) => {
        res.json({
            live: true,
            timestamp: new Date().toISOString(),
        });
    });
    // Mount API v1 Routes
    const apiV1 = express_1.default.Router();
    apiV1.use('/auth', auth_controller_1.authRouter);
    apiV1.use('/users', user_controller_1.userRouter);
    apiV1.use('/kyc', kyc_controller_1.kycRouter);
    apiV1.use('/wallet', wallet_controller_1.walletRouter);
    apiV1.use('/tournaments', tournament_controller_1.tournamentRouter);
    apiV1.use('/leaderboard', leaderboard_controller_1.leaderboardRouter);
    apiV1.use('/referrals', referral_controller_1.referralRouter);
    apiV1.use('/support', support_controller_1.supportRouter);
    apiV1.use('/notifications', notification_controller_1.notificationRouter);
    apiV1.use('/settings', settings_controller_1.settingsRouter);
    apiV1.use('/admin', admin_controller_1.adminRouter);
    app.use('/api/v1', apiV1);
    // Fallback 404 Handler
    app.use((req, res) => {
        res.status(404).json({
            success: false,
            error: {
                message: `Endpoint ${req.method} ${req.originalUrl} not found`,
                code: 'NOT_FOUND',
            },
        });
    });
    // Global Error Handler
    app.use(error_middleware_1.errorHandler);
    return app;
};
exports.createApp = createApp;
