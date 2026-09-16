"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;

class NotificationService {
    static async listNotifications(orgId, _query) {
        // Return structured notification records matching SCR-012/Figma specifications
        return {
            items: [
                {
                    id: 'notif-1',
                    organizationId: orgId,
                    type: 'Alert',
                    title: 'Orders Sync Pipeline Failed',
                    message: 'Shopify to BigQuery connection timed out on step 3',
                    severity: 'critical',
                    isRead: false,
                    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
                    metadata: { pipelineId: 'pipe_123', executionId: 'exec_789' }
                },
                {
                    id: 'notif-2',
                    organizationId: orgId,
                    type: 'DataQuality',
                    title: 'Data Quality Warning',
                    message: 'Contacts dataset had 12 schema validation mismatches',
                    severity: 'warning',
                    isRead: false,
                    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
                    metadata: { dataset: 'contacts_prod' }
                },
                {
                    id: 'notif-3',
                    organizationId: orgId,
                    type: 'System',
                    title: 'System Maintenance Scheduled',
                    message: 'Planned cluster reboot in 2 days',
                    severity: 'info',
                    isRead: true,
                    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
                    metadata: {}
                }
            ],
            unreadCount: 2,
            total: 3
        };
    }

    static async markAsRead(orgId, id) {
        return {
            id,
            isRead: true,
            updatedAt: new Date().toISOString()
        };
    }

    static async markAllAsRead(_orgId) {
        return {
            success: true,
            markedCount: 2
        };
    }

    static async getPreferences(orgId, userId) {
        return {
            organizationId: orgId,
            userId,
            emailAlerts: true,
            inAppAlerts: true,
            webhookAlerts: false
        };
    }

    static async updatePreferences(orgId, userId, payload) {
        return {
            organizationId: orgId,
            userId,
            ...payload,
            updatedAt: new Date().toISOString()
        };
    }
}

exports.NotificationService = NotificationService;
