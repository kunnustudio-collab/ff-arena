"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
const api_error_1 = require("../errors/api-error");
const data_store_1 = require("../../database/data-store");
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(api_error_1.ApiError.unauthorized('Authentication token is required'));
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt_1.JwtUtil.verifyAccessToken(token);
        const user = data_store_1.store.users.get(decoded.userId);
        if (!user) {
            return next(api_error_1.ApiError.unauthorized('User not found'));
        }
        if (user.status === 'SUSPENDED') {
            return next(api_error_1.ApiError.forbidden('Account is suspended. Please contact customer support.', 'ACCOUNT_SUSPENDED'));
        }
        req.user = {
            id: user.id,
            role: user.role,
            email: user.email,
            phone: user.phone,
            status: user.status,
        };
        next();
    }
    catch (err) {
        return next(api_error_1.ApiError.unauthorized('Invalid or expired authentication token'));
    }
};
exports.authenticate = authenticate;
