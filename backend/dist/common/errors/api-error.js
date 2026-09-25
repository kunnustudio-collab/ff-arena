"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
class ApiError extends Error {
    statusCode;
    errorCode;
    details;
    constructor(statusCode, message, errorCode = 'ERROR', details) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.details = details;
        Object.setPrototypeOf(this, new.target.prototype);
    }
    static badRequest(message, errorCode = 'BAD_REQUEST', details) {
        return new ApiError(400, message, errorCode, details);
    }
    static unauthorized(message = 'Unauthorized access', errorCode = 'UNAUTHORIZED') {
        return new ApiError(401, message, errorCode);
    }
    static forbidden(message = 'Access forbidden', errorCode = 'FORBIDDEN') {
        return new ApiError(403, message, errorCode);
    }
    static notFound(message = 'Resource not found', errorCode = 'NOT_FOUND') {
        return new ApiError(404, message, errorCode);
    }
    static conflict(message, errorCode = 'CONFLICT') {
        return new ApiError(409, message, errorCode);
    }
    static unprocessable(message, errorCode = 'UNPROCESSABLE_ENTITY', details) {
        return new ApiError(422, message, errorCode, details);
    }
    static internal(message = 'Internal server error', errorCode = 'INTERNAL_ERROR') {
        return new ApiError(500, message, errorCode);
    }
}
exports.ApiError = ApiError;
