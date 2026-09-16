"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const jwt_1 = require("../utils/jwt");
const errors_1 = require("../utils/errors");
const response_1 = require("../utils/response");
const user_model_1 = require("../models/user.model");
const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new errors_1.AuthenticationError('Authentication required');
        }
        const token = authHeader.split(' ')[1];
        try {
            const payload = (0, jwt_1.verifyAccessToken)(token);
            req.user = payload;
            // Verify user still exists and is active if DB is connected
            try {
                const user = await user_model_1.User.findById(payload.userId);
                if (user && user.status && user.status.toLowerCase() !== 'active') {
                    throw new errors_1.AuthenticationError('Account is not active');
                }
            } catch (dbErr) {
                if (dbErr instanceof errors_1.AuthenticationError) throw dbErr;
                // If DB check is bypassed/disconnected, proceed with valid JWT payload
            }
            next();
        }
        catch (err) {
            if (err instanceof errors_1.AuthenticationError) throw err;
            throw new errors_1.AuthenticationError('Invalid or expired token');
        }
    }
    catch (error) {
        if (error instanceof errors_1.AuthenticationError) {
            return (0, response_1.sendError)(res, error.message, 401);
        }
        return (0, response_1.sendError)(res, 'Authentication failed', 401);
    }
};
exports.requireAuth = requireAuth;
