"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionLog = exports.PipelineExecution = exports.PipelineNode = exports.Pipeline = void 0;
const mongoose_1 = __importDefault(require("mongoose"));

const PipelineSchema = new mongoose_1.default.Schema({
    organizationId: {
        type: String,
        required: true,
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
        default: 'General',
    },
    businessDomain: {
        type: String,
        default: 'Core',
    },
    environment: {
        type: String,
        enum: ['Production', 'Staging', 'Development'],
        default: 'Production',
    },
    status: {
        type: String,
        enum: ['Active', 'Running', 'Draft', 'Paused', 'Failed', 'Scheduled', 'Published'],
        default: 'Draft',
    },
    owner: {
        type: String,
        default: 'Current User',
    },
    team: {
        type: String,
        default: 'Data Engineering',
    },
    schedule: {
        type: String,
        default: 'Manual',
    },
    source: {
        type: String,
        default: 'Multiple Sources',
    },
    destination: {
        type: String,
        default: 'Multiple Destinations',
    },
    recordsProcessed: {
        type: Number,
        default: 0,
    },
    successRate: {
        type: Number,
        default: 100,
    },
    avgExecutionTime: {
        type: String,
        default: '0s',
    },
    lastRun: {
        type: String,
        default: 'Never',
    },
    nextRun: {
        type: String,
        default: '—',
    },
    version: {
        type: String,
        default: 'v1.0.0',
    },
    isTemplate: {
        type: Boolean,
        default: false,
    },
    tags: [String],
    nodes: {
        type: Array,
        default: [],
    },
    edges: {
        type: Array,
        default: [],
    },
    validationScore: {
        type: Number,
        default: 100,
    },
}, {
    timestamps: true,
});

const PipelineNodeSchema = new mongoose_1.default.Schema({
    organizationId: {
        type: String,
        required: true,
        index: true,
    },
    pipelineId: {
        type: String,
        index: true,
    },
    nodeId: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
        enum: ['source', 'filter', 'mapping', 'transformation', 'validation', 'merge', 'destination', 'utility', 'custom'],
    },
    category: {
        type: String,
        default: 'Standard',
    },
    config: {
        type: mongoose_1.default.Schema.Types.Mixed,
        default: {},
    },
    version: {
        type: String,
        default: 'v1.0.0',
    },
    status: {
        type: String,
        enum: ['idle', 'running', 'success', 'failed', 'valid', 'warning', 'draft', 'configured'],
        default: 'draft',
    }
}, {
    timestamps: true,
});

const PipelineExecutionSchema = new mongoose_1.default.Schema({
    organizationId: {
        type: String,
        required: true,
        index: true,
    },
    pipelineId: {
        type: String,
        required: true,
        index: true,
    },
    pipelineName: {
        type: String,
        default: 'Pipeline',
    },
    status: {
        type: String,
        enum: ['Running', 'Success', 'Failed', 'Paused', 'Canceled'],
        default: 'Running',
    },
    triggeredBy: {
        type: String,
        default: 'Manual',
    },
    startTime: {
        type: Date,
        default: Date.now,
    },
    endTime: {
        type: Date,
    },
    recordsProcessed: {
        type: Number,
        default: 0,
    },
    throughput: {
        type: String,
        default: '0 rec/s',
    },
    duration: {
        type: String,
        default: '0s',
    },
    metrics: {
        type: mongoose_1.default.Schema.Types.Mixed,
        default: {},
    },
}, {
    timestamps: true,
});

const ExecutionLogSchema = new mongoose_1.default.Schema({
    organizationId: {
        type: String,
        required: true,
        index: true,
    },
    pipelineId: {
        type: String,
        required: true,
        index: true,
    },
    executionId: {
        type: String,
        required: true,
        index: true,
    },
    level: {
        type: String,
        enum: ['INFO', 'WARN', 'ERROR', 'DEBUG', 'SUCCESS'],
        default: 'INFO',
    },
    message: {
        type: String,
        required: true,
    },
    nodeId: {
        type: String,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

exports.Pipeline = mongoose_1.default.model('Pipeline', PipelineSchema);
exports.PipelineNode = mongoose_1.default.model('PipelineNode', PipelineNodeSchema);
exports.PipelineExecution = mongoose_1.default.model('PipelineExecution', PipelineExecutionSchema);
exports.ExecutionLog = mongoose_1.default.model('ExecutionLog', ExecutionLogSchema);
