"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtUtil = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../../config");
class JwtUtil {
    static signAccessToken(payload) {
        return jsonwebtoken_1.default.sign(payload, config_1.config.jwt.secret, {
            expiresIn: '1h',
        });
    }
    static signRefreshToken(payload) {
        return jsonwebtoken_1.default.sign(payload, config_1.config.jwt.refreshSecret, {
            expiresIn: '30d',
        });
    }
    static signAdminToken(payload) {
        return jsonwebtoken_1.default.sign(payload, config_1.config.jwt.adminSecret, {
            expiresIn: '12h',
        });
    }
    static verifyAccessToken(token) {
        return jsonwebtoken_1.default.verify(token, config_1.config.jwt.secret);
    }
    static verifyRefreshToken(token) {
        return jsonwebtoken_1.default.verify(token, config_1.config.jwt.refreshSecret);
    }
    static verifyAdminToken(token) {
        return jsonwebtoken_1.default.verify(token, config_1.config.jwt.adminSecret);
    }
}
exports.JwtUtil = JwtUtil;
