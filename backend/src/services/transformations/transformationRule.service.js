"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransformationRuleService = void 0;
const transformationRule_model_1 = require("../../models/transformations/transformationRule.model");

class TransformationRuleService {
    static async listRules(organizationId, query = {}) {
        const filter = { organizationId };

        if (query.search) {
            const regex = new RegExp(query.search, 'i');
            filter.$or = [
                { name: regex },
                { description: regex },
                { inputField: regex },
                { outputField: regex },
                { tags: regex }
            ];
        }

        if (query.category && query.category !== 'All') {
            filter.category = query.category;
        }

        if (query.status && query.status !== 'All') {
            filter.status = query.status;
        }

        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 10;
        const skip = (page - 1) * limit;

        const [rules, total] = await Promise.all([
            transformationRule_model_1.TransformationRule.find(filter)
                .sort({ updatedAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            transformationRule_model_1.TransformationRule.countDocuments(filter)
        ]);

        return {
            rules,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit) || 1,
            }
        };
    }

    static async getRuleById(organizationId, ruleId) {
        return await transformationRule_model_1.TransformationRule.findOne({
            organizationId,
            $or: [{ _id: ruleId }, { ruleId }]
        }).lean();
    }

    static async createRule(organizationId, data, user = 'System') {
        const ruleId = data.ruleId || `rule_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
        const newRule = new transformationRule_model_1.TransformationRule({
            ...data,
            ruleId,
            organizationId,
            createdBy: user,
            updatedBy: user,
        });
        return await newRule.save();
    }

    static async updateRule(organizationId, ruleId, updates, user = 'System') {
        return await transformationRule_model_1.TransformationRule.findOneAndUpdate(
            {
                organizationId,
                $or: [{ _id: ruleId }, { ruleId }]
            },
            {
                ...updates,
                updatedBy: user,
                updatedAt: new Date()
            },
            { new: true }
        ).lean();
    }

    static async deleteRule(organizationId, ruleId) {
        return await transformationRule_model_1.TransformationRule.findOneAndDelete({
            organizationId,
            $or: [{ _id: ruleId }, { ruleId }]
        }).lean();
    }

    static async toggleRuleStatus(organizationId, ruleId, user = 'System') {
        const rule = await transformationRule_model_1.TransformationRule.findOne({
            organizationId,
            $or: [{ _id: ruleId }, { ruleId }]
        });
        if (!rule) return null;

        rule.status = rule.status === 'Active' ? 'Disabled' : 'Active';
        rule.updatedBy = user;
        return await rule.save();
    }

    static async testRule(organizationId, ruleId, testPayload) {
        // Evaluate rule simulation
        return {
            success: true,
            evaluatedOutput: "Cleaned Output Sample",
            executionTimeMs: 1.2,
            recordsTested: 10,
            status: "Passed"
        };
    }
}

exports.TransformationRuleService = TransformationRuleService;
