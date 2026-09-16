"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const joi_1 = __importDefault(require("joi"));
const auth_service_1 = require("../../services/auth/auth.service");
const response_1 = require("../../utils/response");
const errors_1 = require("../../utils/errors");
class AuthController {
    
    static async register(req, res) {
        try {
            const schema = joi_1.default.object({
                email: joi_1.default.string().email().required(),
                password: joi_1.default.string().min(8).required(),
                firstName: joi_1.default.string().required(),
                lastName: joi_1.default.string().required(),
                gender: joi_1.default.string().optional(),
            });
            const { error, value } = schema.validate(req.body);
            if (error) {
                return (0, response_1.sendError)(res, error.details[0].message, 400);
            }
            const user = await auth_service_1.AuthService.register(value.email, value.password, value.firstName, value.lastName, value.gender);
            return (0, response_1.sendSuccess)(res, {
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                }
            });
        }
        catch (err) {
            if (err instanceof errors_1.AppError) {
                return (0, response_1.sendError)(res, err.message, err.statusCode);
            }
            return (0, response_1.sendError)(res, 'Internal server error', 500);
        }
    }

    static async login(req, res) {
        try {
            const schema = joi_1.default.object({
                email: joi_1.default.string().email().required(),
                password: joi_1.default.string().required(),
                keepSignedIn: joi_1.default.boolean().optional(),
            });
            const { error, value } = schema.validate(req.body);
            if (error) {
                return (0, response_1.sendError)(res, error.details[0].message, 400);
            }
            const { accessToken, refreshToken, user } = await auth_service_1.AuthService.login(value.email, value.password, req.ip, req.get('user-agent'));
            return (0, response_1.sendSuccess)(res, {
                accessToken,
                refreshToken,
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    organizationId: user.organizationId
                }
            });
        }
        catch (err) {
            if (err instanceof errors_1.AppError) {
                return (0, response_1.sendError)(res, err.message, err.statusCode);
            }
            return (0, response_1.sendError)(res, 'Internal server error', 500);
        }
    }
    static async logout(req, res) {
        try {
            const { refreshToken } = req.body;
            if (refreshToken) {
                await auth_service_1.AuthService.logout(refreshToken);
            }
            return (0, response_1.sendSuccess)(res, null, 'Logged out successfully');
        }
        catch (err) {
            return (0, response_1.sendError)(res, 'Internal server error', 500);
        }
    }
    static async forgotPassword(req, res) {
        try {
            const schema = joi_1.default.object({
                email: joi_1.default.string().email().required(),
            });
            const { error, value } = schema.validate(req.body);
            if (error) {
                return (0, response_1.sendError)(res, 'Enter a valid email address.', 400);
            }
            await auth_service_1.AuthService.requestPasswordReset(value.email);
            return (0, response_1.sendSuccess)(res, null, 'Password reset link sent');
        }
        catch (err) {
            return (0, response_1.sendError)(res, 'Internal server error', 500);
        }
    }
    static async resetPassword(req, res) {
        try {
            const schema = joi_1.default.object({
                token: joi_1.default.string().required(),
                password: joi_1.default.string().min(8).required(),
            });
            const { error, value } = schema.validate(req.body);
            if (error) {
                return (0, response_1.sendError)(res, 'Invalid request parameters', 400);
            }
            await auth_service_1.AuthService.resetPassword(value.token, value.password);
            return (0, response_1.sendSuccess)(res, null, 'Password reset successful');
        }
        catch (err) {
            if (err instanceof errors_1.AppError) {
                return (0, response_1.sendError)(res, err.message, err.statusCode);
            }
            return (0, response_1.sendError)(res, 'Internal server error', 500);
        }
    }
    static async changePassword(req, res) {
        try {
            const schema = joi_1.default.object({
                currentPassword: joi_1.default.string().required(),
                newPassword: joi_1.default.string().min(8).required(),
            });
            const { error, value } = schema.validate(req.body);
            if (error) {
                return (0, response_1.sendError)(res, error.details[0].message, 400);
            }
            if (!req.user) {
                return (0, response_1.sendError)(res, 'Authentication required', 401);
            }
            await auth_service_1.AuthService.changePassword(req.user.userId, value.currentPassword, value.newPassword);
            return (0, response_1.sendSuccess)(res, null, 'Password changed successfully');
        }
        catch (err) {
            if (err instanceof errors_1.AppError) {
                return (0, response_1.sendError)(res, err.message, err.statusCode);
            }
            return (0, response_1.sendError)(res, 'Internal server error', 500);
        }
    }
    static async requestEmailVerification(req, res) {
        try {
            if (!req.user) {
                return (0, response_1.sendError)(res, 'Authentication required', 401);
            }
            await auth_service_1.AuthService.requestEmailVerification(req.user.userId);
            return (0, response_1.sendSuccess)(res, null, 'Verification email sent');
        }
        catch (err) {
            if (err instanceof errors_1.AppError) {
                return (0, response_1.sendError)(res, err.message, err.statusCode);
            }
            return (0, response_1.sendError)(res, 'Internal server error', 500);
        }
    }
    static async verifyEmail(req, res) {
        try {
            const { token } = req.body;
            if (!token) {
                return (0, response_1.sendError)(res, 'This verification link is invalid or has expired.', 400);
            }
            await auth_service_1.AuthService.verifyEmail(token);
            return (0, response_1.sendSuccess)(res, null, 'Email verified successfully');
        }
        catch (err) {
            if (err instanceof errors_1.AppError) {
                return (0, response_1.sendError)(res, err.message, err.statusCode);
            }
            return (0, response_1.sendError)(res, 'Internal server error', 500);
        }
    }
    static async verifyTwoFactor(req, res) {
        try {
            const { code } = req.body;
            if (!code) {
                return (0, response_1.sendError)(res, 'Verification code required', 400);
            }
            if (!req.user) {
                return (0, response_1.sendError)(res, 'Authentication required', 401);
            }
            await auth_service_1.AuthService.verifyTwoFactor(req.user.userId, code);
            return (0, response_1.sendSuccess)(res, null, 'Verified successfully');
        }
        catch (err) {
            if (err instanceof errors_1.AppError) {
                return (0, response_1.sendError)(res, err.message, err.statusCode);
            }
            return (0, response_1.sendError)(res, 'Internal server error', 500);
        }
    }
    static async resendTwoFactorCode(req, res) {
        try {
            if (!req.user) {
                return (0, response_1.sendError)(res, 'Authentication required', 401);
            }
            await auth_service_1.AuthService.resendTwoFactor(req.user.userId);
            return (0, response_1.sendSuccess)(res, null, 'Code resent');
        }
        catch (err) {
            if (err instanceof errors_1.AppError) {
                return (0, response_1.sendError)(res, err.message, err.statusCode);
            }
            return (0, response_1.sendError)(res, 'Internal server error', 500);
        }
    }
}
exports.AuthController = AuthController;
