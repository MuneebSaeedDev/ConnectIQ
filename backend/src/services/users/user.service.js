"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
class UserService {
    static async listUsers(orgId, query) { return { rows: [] }; }
    static async getUserDetails(orgId, userId) { return { userId }; }
    static async getEditableUser(orgId, userId) { return { form: {} }; }
    static async inviteUser(orgId, payload) { return { id: 'u_1' }; }
    static async updateUser(orgId, userId, body) { return { ok: true }; }
    static async getMyProfile(userId) { return { userId, form: {} }; }
    static async saveMyProfile(userId, body) { return { form: body }; }
    static async getUserActivityHistory(orgId, userId, query) { return { user: {}, activities: [] }; }
    static async getUserLoginHistory(orgId, userId, query) { return { user: {}, events: [] }; }
    static async getUserPermissions(orgId, userId) { return { userId }; }
    static async saveUserPermissions(orgId, userId, body) { return { ok: true }; }
}
exports.UserService = UserService;
