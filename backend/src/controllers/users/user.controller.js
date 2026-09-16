"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("../../services/users/user.service");
const response_1 = require("../../utils/response");

class UserController {
    static async listUsers(req, res, next) {
        try {
            const orgId = req.params.orgId || req.user?.organizationId || 'current';
            const users = await user_service_1.UserService.listUsers(orgId, req.query);
            return (0, response_1.sendSuccess)(res, users);
        } catch (error) { next(error); }
    }

    static async getUserDetails(req, res, next) {
        try {
            const orgId = req.params.orgId || req.user?.organizationId || 'current';
            const user = await user_service_1.UserService.getUserDetails(orgId, req.params.userId || req.params.id);
            return (0, response_1.sendSuccess)(res, user);
        } catch (error) { next(error); }
    }

    static async getEditableUser(req, res, next) {
        try {
            const orgId = req.params.orgId || req.user?.organizationId || 'current';
            const user = await user_service_1.UserService.getEditableUser(orgId, req.params.userId || req.params.id);
            return (0, response_1.sendSuccess)(res, user);
        } catch (error) { next(error); }
    }

    static async inviteUser(req, res, next) {
        try {
            const orgId = req.params.orgId || req.user?.organizationId || 'current';
            const result = await user_service_1.UserService.inviteUser(orgId, req.body);
            return (0, response_1.sendSuccess)(res, result, 201);
        } catch (error) { next(error); }
    }

    static async updateUser(req, res, next) {
        try {
            const orgId = req.params.orgId || req.user?.organizationId || 'current';
            const result = await user_service_1.UserService.updateUser(orgId, req.params.userId || req.params.id, req.body);
            return (0, response_1.sendSuccess)(res, result);
        } catch (error) { next(error); }
    }

    static async getMyProfile(req, res, next) {
        try {
            const userId = req.user?.userId || req.user?._id;
            const profile = await user_service_1.UserService.getMyProfile(userId);
            return (0, response_1.sendSuccess)(res, profile);
        } catch (error) { next(error); }
    }

    static async saveMyProfile(req, res, next) {
        try {
            const userId = req.user?.userId || req.user?._id;
            const result = await user_service_1.UserService.saveMyProfile(userId, req.body);
            return (0, response_1.sendSuccess)(res, result);
        } catch (error) { next(error); }
    }

    static async getUserActivityHistory(req, res, next) {
        try {
            const orgId = req.params.orgId || req.user?.organizationId || 'current';
            const activities = await user_service_1.UserService.getUserActivityHistory(orgId, req.params.userId || req.params.id, req.query);
            return (0, response_1.sendSuccess)(res, activities);
        } catch (error) { next(error); }
    }

    static async getUserLoginHistory(req, res, next) {
        try {
            const orgId = req.params.orgId || req.user?.organizationId || 'current';
            const logins = await user_service_1.UserService.getUserLoginHistory(orgId, req.params.userId || req.params.id, req.query);
            return (0, response_1.sendSuccess)(res, logins);
        } catch (error) { next(error); }
    }

    static async getUserPermissions(req, res, next) {
        try {
            const orgId = req.params.orgId || req.user?.organizationId || 'current';
            const permissions = await user_service_1.UserService.getUserPermissions(orgId, req.params.userId || req.params.id);
            return (0, response_1.sendSuccess)(res, permissions);
        } catch (error) { next(error); }
    }

    static async saveUserPermissions(req, res, next) {
        try {
            const orgId = req.params.orgId || req.user?.organizationId || 'current';
            const result = await user_service_1.UserService.saveUserPermissions(orgId, req.params.userId || req.params.id, req.body);
            return (0, response_1.sendSuccess)(res, result);
        } catch (error) { next(error); }
    }
}
exports.UserController = UserController;
