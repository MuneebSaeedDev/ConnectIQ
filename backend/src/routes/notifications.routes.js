"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_1 = require("../controllers/notifications/notification.controller");

const router = (0, express_1.Router)({ mergeParams: true });

// Notification list & batch actions
router.get('/:orgId/notifications', notification_controller_1.NotificationController.listNotifications);
router.get('/notifications', notification_controller_1.NotificationController.listNotifications);
router.post('/:orgId/notifications/mark-all-read', notification_controller_1.NotificationController.markAllAsRead);
router.post('/notifications/mark-all-read', notification_controller_1.NotificationController.markAllAsRead);

// Single notification actions
router.patch('/:orgId/notifications/:id/read', notification_controller_1.NotificationController.markAsRead);
router.patch('/notifications/:id/read', notification_controller_1.NotificationController.markAsRead);
router.put('/:orgId/notifications/:id/read', notification_controller_1.NotificationController.markAsRead);
router.put('/notifications/:id/read', notification_controller_1.NotificationController.markAsRead);

// Preferences
router.get('/:orgId/notification-preferences', notification_controller_1.NotificationController.getPreferences);
router.get('/notification-preferences', notification_controller_1.NotificationController.getPreferences);
router.put('/:orgId/notification-preferences', notification_controller_1.NotificationController.updatePreferences);
router.put('/notification-preferences', notification_controller_1.NotificationController.updatePreferences);

exports.default = router;
