"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const accountSettings_controller_1 = require("../controllers/settings/accountSettings.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();

// All routes require authentication
router.use(auth_middleware_1.requireAuth);

// Profile
router.get('/me/profile', accountSettings_controller_1.AccountSettingsController.getProfile);
router.put('/me/profile', accountSettings_controller_1.AccountSettingsController.updateProfile);

// Preferences
router.get('/me/preferences', accountSettings_controller_1.AccountSettingsController.getPreferences);
router.put('/me/preferences', accountSettings_controller_1.AccountSettingsController.updatePreferences);

// Notifications
router.get('/me/notifications', accountSettings_controller_1.AccountSettingsController.getNotifications);
router.put('/me/notifications', accountSettings_controller_1.AccountSettingsController.updateNotifications);

// Two-Factor
router.get('/me/2fa', accountSettings_controller_1.AccountSettingsController.getTwoFactorStatus);
router.post('/me/2fa', accountSettings_controller_1.AccountSettingsController.toggleTwoFactor);

// Sessions
router.get('/me/sessions', accountSettings_controller_1.AccountSettingsController.getSessions);
router.delete('/me/sessions/:sessionId', accountSettings_controller_1.AccountSettingsController.terminateSession);
router.post('/me/sessions/terminate-all', accountSettings_controller_1.AccountSettingsController.terminateAllSessions);

// Team Members
router.get('/me/team-members', accountSettings_controller_1.AccountSettingsController.getTeamMembers);

// Integrations
router.get('/me/integrations', accountSettings_controller_1.AccountSettingsController.getIntegrations);
router.patch('/me/integrations/:id', accountSettings_controller_1.AccountSettingsController.toggleIntegration);

// API Keys
router.get('/me/api-keys', accountSettings_controller_1.AccountSettingsController.getApiKeys);
router.post('/me/api-keys', accountSettings_controller_1.AccountSettingsController.createApiKey);
router.delete('/me/api-keys/:id', accountSettings_controller_1.AccountSettingsController.revokeApiKey);

// Audit Logs
router.get('/me/audit-logs', accountSettings_controller_1.AccountSettingsController.getAuditLogs);

exports.default = router;
