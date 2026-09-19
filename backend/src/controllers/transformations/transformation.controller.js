"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransformationController = void 0;
const response_1 = require("../../utils/response");
const transformation_service_1 = require("../../services/transformations/transformation.service");

class TransformationController {
    static async listRules(req, res) {
        try {
            const orgId = req.params.orgId || req.user?.organizationId || 'org_default';
            const rules = await transformation_service_1.TransformationService.getRules(orgId, req.query);
            return (0, response_1.sendSuccess)(res, rules);
        } catch (err) {
            return (0, response_1.sendError)(res, 'Failed to fetch transformation rules', 500, err);
        }
    }

    static async getRuleSummary(req, res) {
        try {
            const orgId = req.params.orgId || req.user?.organizationId || 'org_default';
            const summary = await transformation_service_1.TransformationService.getCategoriesSummary(orgId);
            return (0, response_1.sendSuccess)(res, summary);
        } catch (err) {
            return (0, response_1.sendError)(res, 'Failed to fetch rule summary', 500, err);
        }
    }

    static async getRuleById(req, res) {
        try {
            const orgId = req.params.orgId || req.user?.organizationId || 'org_default';
            const { id } = req.params;
            const rule = await transformation_service_1.TransformationService.getRuleById(orgId, id);
            
            if (!rule) {
                return (0, response_1.sendError)(res, 'Transformation rule not found', 404);
            }
            
            return (0, response_1.sendSuccess)(res, rule);
        } catch (err) {
            return (0, response_1.sendError)(res, 'Failed to fetch transformation rule details', 500, err);
        }
    }

    static async createRule(req, res) {
        try {
            const orgId = req.params.orgId || req.user?.organizationId || 'org_default';
            const data = req.body;
            
            if (!data.name || !data.inputField || !data.outputField) {
                return (0, response_1.sendError)(res, 'Name, inputField, and outputField are required', 400);
            }

            const newRule = await transformation_service_1.TransformationService.createRule(orgId, data);
            return (0, response_1.sendSuccess)(res, newRule, 201);
        } catch (err) {
            return (0, response_1.sendError)(res, 'Failed to create transformation rule', 500, err);
        }
    }

    static async updateRule(req, res) {
        try {
            const orgId = req.params.orgId || req.user?.organizationId || 'org_default';
            const { id } = req.params;
            const data = req.body;

            const updatedRule = await transformation_service_1.TransformationService.updateRule(orgId, id, data);
            
            if (!updatedRule) {
                return (0, response_1.sendError)(res, 'Transformation rule not found', 404);
            }

            return (0, response_1.sendSuccess)(res, updatedRule);
        } catch (err) {
            return (0, response_1.sendError)(res, 'Failed to update transformation rule', 500, err);
        }
    }

    static async deleteRule(req, res) {
        try {
            const orgId = req.params.orgId || req.user?.organizationId || 'org_default';
            const { id } = req.params;

            await transformation_service_1.TransformationService.deleteRule(orgId, id);
            return (0, response_1.sendSuccess)(res, { message: 'Rule successfully deleted' });
        } catch (err) {
            return (0, response_1.sendError)(res, 'Failed to delete transformation rule', 500, err);
        }
    }
}

exports.TransformationController = TransformationController;
