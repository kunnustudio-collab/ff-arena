"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = void 0;
const api_error_1 = require("../errors/api-error");
const jwt_1 = require("../utils/jwt");
const data_store_1 = require("../../database/data-store");
const requireAdmin = (allowedRoles = ['SUPER_ADMIN', 'ADMIN']) => {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(api_error_1.ApiError.unauthorized('Admin authorization token is required'));
        }
        const token = authHeader.split(' ')[1];
        try {
            let decoded;
            try {
                decoded = jwt_1.JwtUtil.verifyAdminToken(token);
            }
            catch {
                decoded = jwt_1.JwtUtil.verifyAccessToken(token);
            }
            const user = data_store_1.store.users.get(decoded.userId);
            if (!user) {
                return next(api_error_1.ApiError.unauthorized('Admin user not found'));
            }
            const adminRoles = ['SUPER_ADMIN', 'ADMIN', 'FINANCE_ADMIN', 'TOURNAMENT_ADMIN', 'KYC_ADMIN', 'SUPPORT_AGENT'];
            if (!adminRoles.includes(user.role)) {
                return next(api_error_1.ApiError.forbidden('Requires administrative privileges'));
            }
            if (allowedRoles.length > 0 && !allowedRoles.includes(user.role) && user.role !== 'SUPER_ADMIN') {
                return next(api_error_1.ApiError.forbidden(`Insufficient permissions for this operation. Required: ${allowedRoles.join(', ')}`));
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
            return next(api_error_1.ApiError.unauthorized('Invalid admin authorization credentials'));
        }
    };
};
exports.requireAdmin = requireAdmin;
