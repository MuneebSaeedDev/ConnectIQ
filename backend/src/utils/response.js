"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccess = sendSuccess;
exports.sendError = sendError;
function sendSuccess(res, data, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
        status: 'success',
        message,
        data,
    });
}
function sendError(res, message, statusCode = 500, details) {
    return res.status(statusCode).json({
        status: 'error',
        message,
        ...(details ? { details } : {}),
    });
}
