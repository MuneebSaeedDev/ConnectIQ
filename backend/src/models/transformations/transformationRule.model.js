"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransformationRule = void 0;
const mongoose_1 = __importDefault(require("mongoose"));

const TransformationRuleSchema = new mongoose_1.default.Schema({
    organizationId: {
        type: String,
        required: true,
        index: true,
    },
    ruleId: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        default: '',
    },
    category: {
        type: String,
        enum: [
            'Data Cleaning',
            'Type Conversion',
            'Date Formatting',
            'Duplicate Removal',
            'Lookup & Enrichment',
            'Custom Expression',
            'Field Mapping',
            'Normalization',
            'General'
        ],
        default: 'General',
        index: true,
    },
    type: {
        type: String,
        required: true,
        default: 'rule_based',
    },
    status: {
        type: String,
        enum: ['Active', 'Draft', 'Disabled', 'Archived', 'Invalid'],
        default: 'Active',
        index: true,
    },
    version: {
        type: String,
        default: 'v1.0.0',
    },
    inputField: {
        type: String,
        default: '',
    },
    outputField: {
        type: String,
        default: '',
    },
    sourceType: {
        type: String,
        default: 'String',
    },
    targetType: {
        type: String,
        default: 'String',
    },
    operation: {
        type: String,
        default: 'Custom',
    },
    parameters: {
        type: mongoose_1.default.Schema.Types.Mixed,
        default: {},
    },
    expression: {
        type: String,
        default: '',
    },
    pipelinesCount: {
        type: Number,
        default: 0,
    },
    usageCount: {
        type: Number,
        default: 0,
    },
    lastExecuted: {
        type: Date,
    },
    createdBy: {
        type: String,
        default: 'System',
    },
    updatedBy: {
        type: String,
        default: 'System',
    },
    tags: [String],
    isGlobal: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true,
});

exports.TransformationRule = mongoose_1.default.model('TransformationRule', TransformationRuleSchema);
