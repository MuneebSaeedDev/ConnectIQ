"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransformationService = void 0;
const transformationRule_model_1 = require("../../models/transformations/transformationRule.model");

const DEFAULT_RULES = [
    {
        ruleId: 'RULE-TR-001',
        name: 'Email Normalization & Sanitize',
        description: 'Converts customer email to lowercase and strips leading/trailing spaces.',
        category: 'Data Cleaning',
        inputField: 'email',
        outputField: 'email_clean',
        outputType: 'String',
        transformationType: 'Normalize Case + Trim',
        parameters: { case: 'lowercase', trim: true },
        pipelineCount: 14,
        status: 'Active',
        author: 'D. Engineer',
        version: 'v1.2.0',
        tags: ['customer', 'pii', 'clean'],
    },
    {
        ruleId: 'RULE-TR-002',
        name: 'Currency String to Decimal Casting',
        description: 'Parses string currency values ($1,499.99) into precise double/decimal format.',
        category: 'Type Conversion',
        inputField: 'total_amount',
        outputField: 'amount',
        outputType: 'Decimal',
        transformationType: 'String → Decimal',
        parameters: { format: '0.00', removeSymbols: ['$', ','] },
        pipelineCount: 8,
        status: 'Active',
        author: 'J. Doe',
        version: 'v2.0.1',
        tags: ['finance', 'casting', 'orders'],
    },
    {
        ruleId: 'RULE-TR-003',
        name: 'ISO Timestamp to UTC Standard',
        description: 'Parses varied date/time inputs and normalizes to ISO-8601 UTC timestamp format.',
        category: 'Date Formatting',
        inputField: 'order_date',
        outputField: 'order_ts',
        outputType: 'Timestamp',
        transformationType: 'Parse Date / Timezone Cast',
        parameters: { sourceFormat: 'auto', targetTz: 'UTC' },
        pipelineCount: 22,
        status: 'Active',
        author: 'A. Weber',
        version: 'v1.0.0',
        tags: ['dates', 'timestamps', 'core'],
    },
    {
        ruleId: 'RULE-TR-004',
        name: 'Address Whitespace Cleanup',
        description: 'Removes double spaces and tabs from street address field lines.',
        category: 'String Manipulation',
        inputField: 'street_address',
        outputField: 'street_address_clean',
        outputType: 'String',
        transformationType: 'Regex Replace / Multi-space',
        parameters: { regex: '\\s+', replacement: ' ' },
        pipelineCount: 3,
        status: 'Draft',
        author: 'D. Engineer',
        version: 'v0.9.0',
        tags: ['address', 'geo'],
    },
    {
        ruleId: 'RULE-TR-005',
        name: 'Order Status Code to Label Lookup',
        description: 'Joins standard status codes (1, 2, 3) against status lookup mapping dictionary.',
        category: 'Lookup & Reference',
        inputField: 'status_code',
        outputField: 'status_label',
        outputType: 'String',
        transformationType: 'Dictionary Map / Fallback',
        parameters: { lookupTable: 'status_map_v2', defaultValue: 'UNKNOWN' },
        pipelineCount: 19,
        status: 'Active',
        author: 'M. Chen',
        version: 'v3.1.0',
        tags: ['orders', 'dictionary', 'lookup'],
    },
    {
        ruleId: 'RULE-TR-006',
        name: 'Tax Calculation Custom Expression',
        description: 'Calculates subtotal * (1 + tax_rate) using mathematical safe expression.',
        category: 'Custom Expression',
        inputField: 'subtotal, tax_rate',
        outputField: 'total_with_tax',
        outputType: 'Decimal',
        transformationType: 'Expression Formula',
        parameters: { formula: 'subtotal * (1 + tax_rate)' },
        pipelineCount: 6,
        status: 'Active',
        author: 'Finance Team',
        version: 'v1.1.0',
        tags: ['tax', 'math', 'billing'],
    },
    {
        ruleId: 'RULE-TR-007',
        name: 'Legacy Phone Number Standardizer',
        description: 'Strips punctuation and applies E.164 country code formatting.',
        category: 'Data Cleaning',
        inputField: 'phone_number',
        outputField: 'phone_e164',
        outputType: 'String',
        transformationType: 'Regex Strip & Format',
        parameters: { countryCode: '+1' },
        pipelineCount: 0,
        status: 'Disabled',
        author: 'A. Weber',
        version: 'v1.0.0',
        tags: ['phone', 'contact'],
    }
];

class TransformationService {
    static async getRules(orgId, query = {}) {
        const filter = { organizationId: orgId };

        if (query.category && query.category !== 'All') {
            filter.category = query.category;
        }
        if (query.status && query.status !== 'All') {
            filter.status = query.status;
        }
        if (query.search) {
            filter.$or = [
                { name: { $regex: query.search, $options: 'i' } },
                { description: { $regex: query.search, $options: 'i' } },
                { inputField: { $regex: query.search, $options: 'i' } },
                { outputField: { $regex: query.search, $options: 'i' } },
                { ruleId: { $regex: query.search, $options: 'i' } },
            ];
        }

        try {
            let rules = await transformationRule_model_1.TransformationRule.find(filter).sort({ createdAt: -1 });
            if (!rules || rules.length === 0) {
                // Initialize default seeds if database empty for organization
                const seeds = DEFAULT_RULES.map(r => ({ ...r, organizationId: orgId }));
                await transformationRule_model_1.TransformationRule.insertMany(seeds);
                rules = await transformationRule_model_1.TransformationRule.find(filter).sort({ createdAt: -1 });
            }
            return rules;
        } catch (_err) {
            // Memory mock fallback
            let rules = DEFAULT_RULES.map(r => ({ ...r, organizationId: orgId }));
            if (query.category && query.category !== 'All') {
                rules = rules.filter(r => r.category === query.category);
            }
            if (query.status && query.status !== 'All') {
                rules = rules.filter(r => r.status === query.status);
            }
            if (query.search) {
                const s = query.search.toLowerCase();
                rules = rules.filter(r =>
                    r.name.toLowerCase().includes(s) ||
                    r.description.toLowerCase().includes(s) ||
                    r.inputField.toLowerCase().includes(s) ||
                    r.outputField.toLowerCase().includes(s)
                );
            }
            return rules;
        }
    }

    static async getRuleById(orgId, ruleId) {
        try {
            const rule = await transformationRule_model_1.TransformationRule.findOne({ organizationId: orgId, ruleId });
            if (rule) return rule;
        } catch (_err) {
            // Fallback
        }
        return DEFAULT_RULES.find(r => r.ruleId === ruleId) || null;
    }

    static async createRule(orgId, data) {
        const ruleId = data.ruleId || `RULE-TR-${Date.now().toString().slice(-4)}`;
        const newRuleData = {
            ...data,
            ruleId,
            organizationId: orgId,
            status: data.status || 'Active',
            version: data.version || 'v1.0.0',
            pipelineCount: 0,
        };

        try {
            const created = await transformationRule_model_1.TransformationRule.create(newRuleData);
            return created;
        } catch (_err) {
            return newRuleData;
        }
    }

    static async updateRule(orgId, ruleId, updates) {
        try {
            const updated = await transformationRule_model_1.TransformationRule.findOneAndUpdate(
                { organizationId: orgId, ruleId },
                { $set: updates },
                { new: true }
            );
            return updated;
        } catch (_err) {
            return { ruleId, ...updates };
        }
    }

    static async deleteRule(orgId, ruleId) {
        try {
            await transformationRule_model_1.TransformationRule.deleteOne({ organizationId: orgId, ruleId });
            return true;
        } catch (_err) {
            return true;
        }
    }

    static async getCategoriesSummary(orgId) {
        const rules = await this.getRules(orgId);
        const counts = {
            total: rules.length,
            active: rules.filter(r => r.status === 'Active').length,
            draft: rules.filter(r => r.status === 'Draft').length,
            disabled: rules.filter(r => r.status === 'Disabled').length,
            categories: {},
        };
        rules.forEach(r => {
            counts.categories[r.category] = (counts.categories[r.category] || 0) + 1;
        });
        return counts;
    }
}

exports.TransformationService = TransformationService;
