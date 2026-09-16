"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationActivity = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const OrganizationActivitySchema = new mongoose_1.Schema({
    organizationId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    eventId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    category: {
        type: String,
        enum: ['Pipeline Execution', 'Connector Sync', 'Authentication', 'Security Policy', 'User Management', 'System', 'Data Quality'],
        required: true,
        index: true,
    },
    categoryTone: { type: String, default: 'blue' },
    actor: {
        name: { type: String, required: true },
        email: { type: String },
        role: { type: String },
        type: { type: String, enum: ['User', 'System', 'Service Account'], default: 'User' },
    },
    resource: {
        type: { type: String, required: true },
        name: { type: String, required: true },
        id: { type: String },
    },
    result: {
        type: String,
        enum: ['Success', 'Failed', 'Warning', 'Info'],
        default: 'Success',
        index: true,
    },
    severity: {
        type: String,
        enum: ['Critical', 'High', 'Medium', 'Low', 'Info'],
        default: 'Low',
        index: true,
    },
    summary: { type: String },
    details: {
        duration: { type: String },
        recordsProcessed: { type: Number },
        sourceIp: { type: String },
        authMethod: { type: String },
        timeline: [
            {
                label: { type: String },
                time: { type: String },
                tone: { type: String, enum: ['success', 'error', 'warning', 'info'] },
            },
        ],
        errorTitle: { type: String },
        errorDetail: { type: String },
        errorHint: { type: String },
    },
    timestamp: { type: Date, default: Date.now, index: true },
}, {
    timestamps: true,
});
OrganizationActivitySchema.index({ organizationId: 1, timestamp: -1 });
exports.OrganizationActivity = mongoose_1.default.model('OrganizationActivity', OrganizationActivitySchema);
