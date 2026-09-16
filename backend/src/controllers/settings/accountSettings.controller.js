"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountSettingsController = void 0;
const joi_1 = __importDefault(require("joi"));
const accountSettings_service_1 = require("../../services/settings/accountSettings.service");
const response_1 = require("../../utils/response");
const errors_1 = require("../../utils/errors");

class AccountSettingsController {
    // ── Profile ──
    static async getProfile(req, res) {
        try {
            if (!req.user) return (0, response_1.sendError)(res, 'Authentication required', 401);
            const profile = await accountSettings_service_1.AccountSettingsService.getProfile(req.user.userId);
            return (0, response_1.sendSuccess)(res, profile);
        } catch (err) {
            if (err instanceof errors_1.AppError) return (0, response_1.sendError)(res, err.message, err.statusCode);
            return (0, response_1.sendError)(res, 'Internal server error', 500);
        }
    }

    static async updateProfile(req, res) {
        try {
            if (!req.user) return (0, response_1.sendError)(res, 'Authentication required', 401);
            const profile = await accountSettings_service_1.AccountSettingsService.updateProfile(req.user.userId, req.body);
            return (0, response_1.sendSuccess)(res, profile, 'Profile updated');
        } catch (err) {
            if (err instanceof errors_1.AppError) return (0, response_1.sendError)(res, err.message, err.statusCode);
            return (0, response_1.sendError)(res, 'Internal server error', 500);
        }
    }

    // ── Preferences ──
    static async getPreferences(req, res) {
        try {
            if (!req.user) return (0, response_1.sendError)(res, 'Authentication required', 401);
            const prefs = await accountSettings_service_1.AccountSettingsService.getPreferences(req.user.userId);
            return (0, response_1.sendSuccess)(res, prefs);
        } catch (err) {
            if (err instanceof errors_1.AppError) return (0, response_1.sendError)(res, err.message, err.statusCode);
            return (0, response_1.sendError)(res, 'Internal server error', 500);
        }
    }

    static async updatePreferences(req, res) {
        try {
            if (!req.user) return (0, response_1.sendError)(res, 'Authentication required', 401);
            const prefs = await accountSettings_service_1.AccountSettingsService.updatePreferences(req.user.userId, req.body);
            return (0, response_1.sendSuccess)(res, prefs, 'Preferences updated');
        } catch (err) {
            if (err instanceof errors_1.AppError) return (0, response_1.sendError)(res, err.message, err.statusCode);
            return (0, response_1.sendError)(res, 'Internal server error', 500);
        }
    }

    // ── Notifications ──
    static async getNotifications(req, res) {
        try {
            if (!req.user) return (0, response_1.sendError)(res, 'Authentication required', 401);
            const prefs = await accountSettings_service_1.AccountSettingsService.getNotificationPreferences(req.user.userId);
            return (0, response_1.sendSuccess)(res, prefs);
        } catch (err) {
            if (err instanceof errors_1.AppError) return (0, response_1.sendError)(res, err.message, err.statusCode);
            return (0, response_1.sendError)(res, 'Internal server error', 500);
        }
    }

    static async updateNotifications(req, res) {
        try {
            if (!req.user) return (0, response_1.sendError)(res, 'Authentication required', 401);
            const prefs = await accountSettings_service_1.AccountSettingsService.updateNotificationPreferences(req.user.userId, req.body);
            return (0, response_1.sendSuccess)(res, prefs, 'Notification preferences updated');
        } catch (err) {
            if (err instanceof errors_1.AppError) return (0, response_1.sendError)(res, err.message, err.statusCode);
            return (0, response_1.sendError)(res, 'Internal server error', 500);
        }
    }

    // ── Two-Factor Auth ──
    static async getTwoFactorStatus(req, res) {
        try {
            if (!req.user) return (0, response_1.sendError)(res, 'Authentication required', 401);
            const status = await accountSettings_service_1.AccountSettingsService.getTwoFactorStatus(req.user.userId);
            return (0, response_1.sendSuccess)(res, status);
        } catch (err) {
            if (err instanceof errors_1.AppError) return (0, response_1.sendError)(res, err.message, err.statusCode);
            return (0, response_1.sendError)(res, 'Internal server error', 500);
        }
    }

    static async toggleTwoFactor(req, res) {
        try {
            if (!req.user) return (0, response_1.sendError)(res, 'Authentication required', 401);
            const { enable } = req.body;
            const result = enable
                ? await accountSettings_service_1.AccountSettingsService.enableTwoFactor(req.user.userId)
                : await accountSettings_service_1.AccountSettingsService.disableTwoFactor(req.user.userId);
            return (0, response_1.sendSuccess)(res, result);
        } catch (err) {
            if (err instanceof errors_1.AppError) return (0, response_1.sendError)(res, err.message, err.statusCode);
            return (0, response_1.sendError)(res, 'Internal server error', 500);
        }
    }

    // ── Active Sessions ──
    static async getSessions(req, res) {
        try {
            if (!req.user) return (0, response_1.sendError)(res, 'Authentication required', 401);
            const sessions = await accountSettings_service_1.AccountSettingsService.getSessions(req.user.userId);
            return (0, response_1.sendSuccess)(res, sessions);
        } catch (err) {
            if (err instanceof errors_1.AppError) return (0, response_1.sendError)(res, err.message, err.statusCode);
            return (0, response_1.sendError)(res, 'Internal server error', 500);
        }
    }

    static async terminateSession(req, res) {
        try {
            if (!req.user) return (0, response_1.sendError)(res, 'Authentication required', 401);
            const session = await accountSettings_service_1.AccountSettingsService.terminateSession(req.user.userId, req.params.sessionId);
            return (0, response_1.sendSuccess)(res, session, 'Session terminated');
        } catch (err) {
            if (err instanceof errors_1.AppError) return (0, response_1.sendError)(res, err.message, err.statusCode);
            return (0, response_1.sendError)(res, 'Internal server error', 500);
        }
    }

    static async terminateAllSessions(req, res) {
        try {
            if (!req.user) return (0, response_1.sendError)(res, 'Authentication required', 401);
            const result = await accountSettings_service_1.AccountSettingsService.terminateAllOtherSessions(req.user.userId, req.body.currentSessionId);
            return (0, response_1.sendSuccess)(res, result);
        } catch (err) {
            if (err instanceof errors_1.AppError) return (0, response_1.sendError)(res, err.message, err.statusCode);
            return (0, response_1.sendError)(res, 'Internal server error', 500);
        }
    }

    // ── Team Members ──
    static async getTeamMembers(req, res) {
        try {
            if (!req.user) return (0, response_1.sendError)(res, 'Authentication required', 401);
            const members = await accountSettings_service_1.AccountSettingsService.getTeamMembers(req.user.userId);
            return (0, response_1.sendSuccess)(res, members);
        } catch (err) {
            if (err instanceof errors_1.AppError) return (0, response_1.sendError)(res, err.message, err.statusCode);
            return (0, response_1.sendError)(res, 'Internal server error', 500);
        }
    }

    // ── Integrations ──
    static async getIntegrations(req, res) {
        try {
            if (!req.user) return (0, response_1.sendError)(res, 'Authentication required', 401);
            const orgId = req.user.organizationId || req.user.orgId || req.user.userId;
            const integrations = await accountSettings_service_1.AccountSettingsService.getIntegrations(orgId);
            return (0, response_1.sendSuccess)(res, integrations);
        } catch (err) {
            if (err instanceof errors_1.AppError) return (0, response_1.sendError)(res, err.message, err.statusCode);
            return (0, response_1.sendError)(res, 'Internal server error', 500);
        }
    }

    static async toggleIntegration(req, res) {
        try {
            if (!req.user) return (0, response_1.sendError)(res, 'Authentication required', 401);
            const orgId = req.user.organizationId || req.user.orgId || req.user.userId;
            const integration = await accountSettings_service_1.AccountSettingsService.toggleIntegration(req.params.id, orgId, req.body.connect);
            return (0, response_1.sendSuccess)(res, integration);
        } catch (err) {
            if (err instanceof errors_1.AppError) return (0, response_1.sendError)(res, err.message, err.statusCode);
            return (0, response_1.sendError)(res, 'Internal server error', 500);
        }
    }

    // ── API Keys ──
    static async getApiKeys(req, res) {
        try {
            if (!req.user) return (0, response_1.sendError)(res, 'Authentication required', 401);
            const keys = await accountSettings_service_1.AccountSettingsService.getApiKeys(req.user.userId);
            return (0, response_1.sendSuccess)(res, keys);
        } catch (err) {
            if (err instanceof errors_1.AppError) return (0, response_1.sendError)(res, err.message, err.statusCode);
            return (0, response_1.sendError)(res, 'Internal server error', 500);
        }
    }

    static async createApiKey(req, res) {
        try {
            if (!req.user) return (0, response_1.sendError)(res, 'Authentication required', 401);
            const schema = joi_1.default.object({
                name: joi_1.default.string().required(),
                scope: joi_1.default.string().valid('read', 'read-write', 'admin').optional(),
                expiresAt: joi_1.default.date().optional(),
            });
            const { error, value } = schema.validate(req.body);
            if (error) return (0, response_1.sendError)(res, error.details[0].message, 400);
            const key = await accountSettings_service_1.AccountSettingsService.createApiKey(req.user.userId, value);
            return (0, response_1.sendSuccess)(res, key, 'API key created', 201);
        } catch (err) {
            if (err instanceof errors_1.AppError) return (0, response_1.sendError)(res, err.message, err.statusCode);
            return (0, response_1.sendError)(res, 'Internal server error', 500);
        }
    }

    static async revokeApiKey(req, res) {
        try {
            if (!req.user) return (0, response_1.sendError)(res, 'Authentication required', 401);
            const key = await accountSettings_service_1.AccountSettingsService.revokeApiKey(req.user.userId, req.params.id);
            return (0, response_1.sendSuccess)(res, key, 'API key revoked');
        } catch (err) {
            if (err instanceof errors_1.AppError) return (0, response_1.sendError)(res, err.message, err.statusCode);
            return (0, response_1.sendError)(res, 'Internal server error', 500);
        }
    }

    // ── Audit Logs ──
    static async getAuditLogs(req, res) {
        try {
            if (!req.user) return (0, response_1.sendError)(res, 'Authentication required', 401);
            const orgId = req.user.organizationId || req.user.orgId || req.user.userId;
            const result = await accountSettings_service_1.AccountSettingsService.getAuditLogs(orgId, req.query);
            return (0, response_1.sendSuccess)(res, result);
        } catch (err) {
            if (err instanceof errors_1.AppError) return (0, response_1.sendError)(res, err.message, err.statusCode);
            return (0, response_1.sendError)(res, 'Internal server error', 500);
        }
    }
}

exports.AccountSettingsController = AccountSettingsController;
