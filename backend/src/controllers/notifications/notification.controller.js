"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const notification_service_1 = require("../../services/notifications/notification.service");
const response_1 = require("../../utils/response");

class NotificationController {
    static async listNotifications(req, res, next) {
        try {
            const orgId = req.params.orgId || req.user?.organizationId || 'current';
            const data = await notification_service_1.NotificationService.listNotifications(orgId, req.query);
            return (0, response_1.sendSuccess)(res, data);
        } catch (error) {
            next(error);
        }
    }

    static async markAsRead(req, res, next) {
        try {
            const orgId = req.params.orgId || req.user?.organizationId || 'current';
            const notificationId = req.params.id;
            const data = await notification_service_1.NotificationService.markAsRead(orgId, notificationId);
            return (0, response_1.sendSuccess)(res, data);
        } catch (error) {
            next(error);
        }
    }

    static async markAllAsRead(req, res, next) {
        try {
            const orgId = req.params.orgId || req.user?.organizationId || 'current';
            const data = await notification_service_1.NotificationService.markAllAsRead(orgId);
            return (0, response_1.sendSuccess)(res, data);
        } catch (error) {
            next(error);
        }
    }

    static async getPreferences(req, res, next) {
        try {
            const orgId = req.params.orgId || req.user?.organizationId || 'current';
            const userId = req.user?.id || 'current-user';
            const data = await notification_service_1.NotificationService.getPreferences(orgId, userId);
            return (0, response_1.sendSuccess)(res, data);
        } catch (error) {
            next(error);
        }
    }

    static async updatePreferences(req, res, next) {
        try {
            const orgId = req.params.orgId || req.user?.organizationId || 'current';
            const userId = req.user?.id || 'current-user';
            const data = await notification_service_1.NotificationService.updatePreferences(orgId, userId, req.body);
            return (0, response_1.sendSuccess)(res, data);
        } catch (error) {
            next(error);
        }
    }
}

exports.NotificationController = NotificationController;
