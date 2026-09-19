"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransformationRuleController = void 0;
const transformationRule_service_1 = require("../../services/transformations/transformationRule.service");
const response_1 = require("../../utils/response");

class TransformationRuleController {
    static async listRules(req, res) {
        try {
            // Support both auth-derived organization and url parameter for multi-tenant matching
            const orgId = req.user?.organizationId || req.params.orgId || 'org_123';
            const query = {
                search: req.query.search,
                category: req.query.category,
                status: req.query.status,
                page: req.query.page,
                limit: req.query.limit,
            };

            const data = await transformationRule_service_1.TransformationRuleService.listRules(orgId, query);
            return (0, response_1.sendSuccess)(res, data);
        } catch (error) {
            console.error('Error listing transformation rules:', error);
            // Fallback for UI if DB empty/mocked
            return (0, response_1.sendSuccess)(res, {
                rules: [],
                pagination: { total: 0, page: 1, limit: 10, totalPages: 1 }
            });
        }
    }

    static async getRule(req, res) {
        try {
            const orgId = req.user?.organizationId || req.params.orgId || 'org_123';
            const { id } = req.params;
            const rule = await transformationRule_service_1.TransformationRuleService.getRuleById(orgId, id);

            if (!rule) {
                return (0, response_1.sendError)(res, 'Transformation rule not found', 404);
            }
            return (0, response_1.sendSuccess)(res, { rule });
        } catch (error) {
            return (0, response_1.sendError)(res, 'Failed to fetch transformation rule', 500);
        }
    }

    static async createRule(req, res) {
        try {
            const orgId = req.user?.organizationId || req.params.orgId || 'org_123';
            const user = req.user?.name || 'System';

            // Validate required fields
            if (!req.body.name || !req.body.inputField) {
                return (0, response_1.sendError)(res, 'Name and Input Field are required', 400);
            }

            const rule = await transformationRule_service_1.TransformationRuleService.createRule(orgId, req.body, user);
            return (0, response_1.sendSuccess)(res, { rule }, 'Transformation rule created successfully', 201);
        } catch (error) {
            return (0, response_1.sendError)(res, 'Failed to create transformation rule', 500);
        }
    }

    static async updateRule(req, res) {
        try {
            const orgId = req.user?.organizationId || req.params.orgId || 'org_123';
            const { id } = req.params;
            const user = req.user?.name || 'System';

            const rule = await transformationRule_service_1.TransformationRuleService.updateRule(orgId, id, req.body, user);
            if (!rule) {
                return (0, response_1.sendError)(res, 'Transformation rule not found', 404);
            }
            return (0, response_1.sendSuccess)(res, { rule }, 'Transformation rule updated successfully');
        } catch (error) {
            return (0, response_1.sendError)(res, 'Failed to update transformation rule', 500);
        }
    }

    static async deleteRule(req, res) {
        try {
            const orgId = req.user?.organizationId || req.params.orgId || 'org_123';
            const { id } = req.params;

            const rule = await transformationRule_service_1.TransformationRuleService.deleteRule(orgId, id);
            if (!rule) {
                return (0, response_1.sendError)(res, 'Transformation rule not found', 404);
            }
            return (0, response_1.sendSuccess)(res, null, 'Transformation rule deleted successfully');
        } catch (error) {
            return (0, response_1.sendError)(res, 'Failed to delete transformation rule', 500);
        }
    }

    static async toggleRuleStatus(req, res) {
        try {
            const orgId = req.user?.organizationId || req.params.orgId || 'org_123';
            const { id } = req.params;
            const user = req.user?.name || 'System';

            const rule = await transformationRule_service_1.TransformationRuleService.toggleRuleStatus(orgId, id, user);
            if (!rule) {
                return (0, response_1.sendError)(res, 'Transformation rule not found', 404);
            }
            return (0, response_1.sendSuccess)(res, { rule, status: rule.status }, 'Status updated successfully');
        } catch (error) {
            return (0, response_1.sendError)(res, 'Failed to toggle rule status', 500);
        }
    }
}

exports.TransformationRuleController = TransformationRuleController;
