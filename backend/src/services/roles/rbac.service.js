"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RbacService = void 0;
const role_model_1 = require("../../models/roles/role.model");
const accessControl_model_1 = require("../../models/roles/accessControl.model");
const errors_1 = require("../../utils/errors");
class RbacService {
    /**
     * List all roles for an organization
     */
    static async getRoles(organizationId, filters = {}) {
        const query = { organizationId };
        if (filters.type) {
            query.type = filters.type.toUpperCase();
        }
        if (filters.status) {
            query.isActive = filters.status.toLowerCase() === 'active';
        }
        if (filters.privilegeLevel) {
            query.privilegeLevel = filters.privilegeLevel.toUpperCase();
        }
        if (filters.search) {
            query.$or = [
                { name: { $regex: filters.search, $options: 'i' } },
                { key: { $regex: filters.search, $options: 'i' } },
                { description: { $regex: filters.search, $options: 'i' } },
            ];
        }
        const roles = await role_model_1.Role.find(query).sort({ createdAt: -1 });
        return roles;
    }
    /**
     * Get single role by ID
     */
    static async getRoleById(organizationId, roleId) {
        const role = await role_model_1.Role.findOne({ _id: roleId, organizationId });
        if (!role) {
            throw new errors_1.NotFoundError('Role not found');
        }
        return role;
    }
    /**
     * Create a new custom role
     */
    static async createRole(organizationId, payload) {
        // Validate role key uniqueness
        const existing = await role_model_1.Role.findOne({
            organizationId,
            key: payload.key?.toLowerCase().trim(),
        });
        if (existing) {
            throw new errors_1.ValidationError('A role with this key already exists in the organization');
        }
        const role = new role_model_1.Role({
            ...payload,
            organizationId,
            key: payload.key?.toLowerCase().trim(),
            type: role_model_1.RoleType.CUSTOM,
        });
        await role.save();
        return role;
    }
    /**
     * Update an existing role
     */
    static async updateRole(organizationId, roleId, payload) {
        const role = await role_model_1.Role.findOne({ _id: roleId, organizationId });
        if (!role) {
            throw new errors_1.NotFoundError('Role not found');
        }
        if (role.type === role_model_1.RoleType.SYSTEM && payload.key && payload.key !== role.key) {
            throw new errors_1.ValidationError('System role keys cannot be modified');
        }
        Object.assign(role, payload);
        await role.save();
        return role;
    }
    /**
     * Delete custom role
     */
    static async deleteRole(organizationId, roleId) {
        const role = await role_model_1.Role.findOne({ _id: roleId, organizationId });
        if (!role) {
            throw new errors_1.NotFoundError('Role not found');
        }
        if (role.type === role_model_1.RoleType.SYSTEM) {
            throw new errors_1.ValidationError('System roles cannot be deleted');
        }
        if (role.assignedUsersCount > 0) {
            throw new errors_1.ValidationError('Cannot delete role with assigned users. Reassign users first.');
        }
        await role_model_1.Role.deleteOne({ _id: roleId, organizationId });
        return { success: true };
    }
    /**
     * Get organization Permission Matrix representation
     */
    static async getPermissionMatrix(organizationId) {
        const roles = await role_model_1.Role.find({ organizationId }).sort({ privilegeLevel: 1 });
        return {
            roles,
            generatedAt: new Date().toISOString(),
        };
    }
    /**
     * Get organization Access Control Settings
     */
    static async getAccessControlSettings(organizationId) {
        let settings = await accessControl_model_1.AccessControlSettings.findOne({ organizationId });
        if (!settings) {
            settings = await accessControl_model_1.AccessControlSettings.create({ organizationId });
        }
        return settings;
    }
    /**
     * Update organization Access Control Settings
     */
    static async updateAccessControlSettings(organizationId, payload) {
        let settings = await accessControl_model_1.AccessControlSettings.findOne({ organizationId });
        if (!settings) {
            settings = new accessControl_model_1.AccessControlSettings({
                organizationId,
                ...payload,
            });
        }
        else {
            Object.assign(settings, payload);
        }
        await settings.save();
        return settings;
    }
}
exports.RbacService = RbacService;
