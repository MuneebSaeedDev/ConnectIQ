"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RbacController = void 0;
const joi_1 = __importDefault(require("joi"));
const rbac_service_1 = require("../../services/roles/rbac.service");
const response_1 = require("../../utils/response");
const role_model_1 = require("../../models/roles/role.model");
class RbacController {
    static async listRoles(req, res, next) {
        try {
            const orgId = req.params.orgId || req.user?.organizationId || 'current';
            const roles = await rbac_service_1.RbacService.getRoles(orgId, req.query);
            return (0, response_1.sendSuccess)(res, { roles });
        }
        catch (error) {
            next(error);
        }
    }
    static async getRole(req, res, next) {
        try {
            const orgId = req.params.orgId || req.user?.organizationId || 'current';
            const role = await rbac_service_1.RbacService.getRoleById(orgId, req.params.roleId);
            return (0, response_1.sendSuccess)(res, { role, form: role });
        }
        catch (error) {
            next(error);
        }
    }
    static async createRole(req, res, next) {
        try {
            const schema = joi_1.default.object({
                name: joi_1.default.string().required(),
                key: joi_1.default.string().required(),
                description: joi_1.default.string().allow('', null),
                type: joi_1.default.string().valid(...Object.values(role_model_1.RoleType)).default(role_model_1.RoleType.CUSTOM),
                privilegeLevel: joi_1.default.string().valid(...Object.values(role_model_1.PrivilegeLevel)).default(role_model_1.PrivilegeLevel.STANDARD),
                isActive: joi_1.default.boolean().default(true),
                permissions: joi_1.default.array().items(joi_1.default.object({
                    resource: joi_1.default.string().required(),
                    action: joi_1.default.string().required(),
                    effect: joi_1.default.string().valid('ALLOW', 'DENY').required(),
                    conditions: joi_1.default.object().optional(),
                })).default([]),
            });
            const { error, value } = schema.validate(req.body);
            if (error) {
                return (0, response_1.sendError)(res, error.details[0].message, 400);
            }
            const orgId = req.params.orgId || req.user?.organizationId || 'current';
            const role = await rbac_service_1.RbacService.createRole(orgId, value);
            return (0, response_1.sendSuccess)(res, { role, id: role._id }, 'Role created successfully', 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async updateRole(req, res, next) {
        try {
            const schema = joi_1.default.object({
                name: joi_1.default.string(),
                key: joi_1.default.string(),
                description: joi_1.default.string().allow('', null),
                privilegeLevel: joi_1.default.string().valid(...Object.values(role_model_1.PrivilegeLevel)),
                isActive: joi_1.default.boolean(),
                permissions: joi_1.default.array().items(joi_1.default.object({
                    resource: joi_1.default.string().required(),
                    action: joi_1.default.string().required(),
                    effect: joi_1.default.string().valid('ALLOW', 'DENY').required(),
                    conditions: joi_1.default.object().optional(),
                })),
            });
            const { error, value } = schema.validate(req.body);
            if (error) {
                return (0, response_1.sendError)(res, error.details[0].message, 400);
            }
            const orgId = req.params.orgId || req.user?.organizationId || 'current';
            const role = await rbac_service_1.RbacService.updateRole(orgId, req.params.roleId, value);
            return (0, response_1.sendSuccess)(res, { role, id: role._id, savedAt: new Date().toISOString() }, 'Role updated successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteRole(req, res, next) {
        try {
            const orgId = req.params.orgId || req.user?.organizationId || 'current';
            const result = await rbac_service_1.RbacService.deleteRole(orgId, req.params.roleId);
            return (0, response_1.sendSuccess)(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    static async getPermissionMatrix(req, res, next) {
        try {
            const orgId = req.params.orgId || req.user?.organizationId || 'current';
            const matrix = await rbac_service_1.RbacService.getPermissionMatrix(orgId);
            return (0, response_1.sendSuccess)(res, matrix);
        }
        catch (error) {
            next(error);
        }
    }
    static async getAccessControlSettings(req, res, next) {
        try {
            const orgId = req.params.orgId || req.user?.organizationId || 'current';
            const settings = await rbac_service_1.RbacService.getAccessControlSettings(orgId);
            return (0, response_1.sendSuccess)(res, { form: settings });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateAccessControlSettings(req, res, next) {
        try {
            const orgId = req.params.orgId || req.user?.organizationId || 'current';
            const settings = await rbac_service_1.RbacService.updateAccessControlSettings(orgId, req.body);
            return (0, response_1.sendSuccess)(res, { form: settings, savedAt: new Date().toISOString() }, 'Access control settings updated');
        }
        catch (error) {
            next(error);
        }
    }
}
exports.RbacController = RbacController;
