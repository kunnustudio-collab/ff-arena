"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const api_error_1 = require("../errors/api-error");
const config_1 = require("../../config");
const errorHandler = (err, req, res, next) => {
    const isApiError = err instanceof api_error_1.ApiError;
    const statusCode = isApiError ? err.statusCode : 500;
    const errorCode = isApiError ? err.errorCode : 'INTERNAL_SERVER_ERROR';
    const message = isApiError ? err.message : 'An unexpected error occurred. Please try again.';
    // Structured logging for debugging
    console.error(`[${new Date().toISOString()}] ❌ ${req.method} ${req.url} - ${statusCode} [${errorCode}]: ${err.message}`);
    if (!isApiError && config_1.config.env !== 'production') {
        console.error(err.stack);
    }
    res.status(statusCode).json({
        success: false,
        error: {
            message,
            code: errorCode,
            details: isApiError ? err.details : undefined,
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || undefined,
        },
    });
};
exports.errorHandler = errorHandler;
