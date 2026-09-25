"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    env: process.env.NODE_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production',
    port: parseInt(process.env.PORT || '5000', 10),
    host: process.env.HOST || '0.0.0.0',
    corsOrigin: process.env.CORS_ORIGIN || '*',
    // Safety Gates
    demoMode: process.env.DEMO_MODE === 'true',
    productionFinancialMode: process.env.PRODUCTION_FINANCIAL_MODE === 'true',
    // Platform Branding
    brand: {
        name: process.env.BRAND_NAME || 'Tournament X',
        tagline: process.env.BRAND_TAGLINE || 'Compete. Climb. Win.',
        accentColor: process.env.BRAND_ACCENT_COLOR || '#00F0FF',
    },
    // Database
    database: {
        url: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/tournament_x_db',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        name: process.env.DB_NAME || 'tournament_x_db',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        ssl: process.env.DB_SSL === 'true',
    },
    // Auth & Security
    jwt: {
        secret: process.env.JWT_SECRET || 'dev_jwt_secret_tournament_x_at_least_32_chars!',
        refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_jwt_refresh_secret_tournament_x_at_least_32_chars!',
        adminSecret: process.env.ADMIN_JWT_SECRET || 'dev_jwt_admin_secret_tournament_x_at_least_32_chars!',
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
        refreshExpiresIn: process.env.REFRESH_EXPIRES_IN || '30d',
        saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
    },
    // Financial Rules & Limits
    financial: {
        minDeposit: parseFloat(process.env.MIN_DEPOSIT_INR || '50'),
        maxDeposit: parseFloat(process.env.MAX_DEPOSIT_INR || '10000'),
        minWithdrawal: parseFloat(process.env.MIN_WITHDRAWAL_INR || '100'),
        maxWithdrawal: parseFloat(process.env.MAX_WITHDRAWAL_INR || '25000'),
        dailyWithdrawalLimit: parseFloat(process.env.DAILY_WITHDRAWAL_LIMIT_INR || '50000'),
        withdrawalFeePercent: parseFloat(process.env.WITHDRAWAL_FEE_PERCENT || '2'),
        platformFeePercent: parseFloat(process.env.PLATFORM_FEE_PERCENT || '10'),
        currency: 'INR',
    },
    // Player Protection & Compliance
    compliance: {
        minAge: parseInt(process.env.MIN_AGE_YEARS || '18', 10),
        restrictedStates: (process.env.GEO_RESTRICTED_STATES || 'Andhra Pradesh,Assam,Nagaland,Odisha,Sikkim,Telangana')
            .split(',')
            .map((s) => s.trim().toLowerCase()),
    },
    // Integrations
    payment: {
        provider: process.env.PAYMENT_PROVIDER || 'MOCK',
        keyId: process.env.PAYMENT_KEY_ID || 'test_key',
        keySecret: process.env.PAYMENT_KEY_SECRET || 'test_secret',
        webhookSecret: process.env.PAYMENT_WEBHOOK_SECRET || 'test_webhook_secret',
    },
    kyc: {
        provider: process.env.KYC_PROVIDER || 'MOCK',
        apiKey: process.env.KYC_API_KEY || 'test_kyc_key',
    },
    storage: {
        driver: process.env.STORAGE_DRIVER || 'local',
        localPath: process.env.STORAGE_LOCAL_PATH || './uploads',
    },
};
