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
exports.DataSource = void 0;
const mongoose_1 = __importStar(require("mongoose"));

const DataSourceSchema = new mongoose_1.Schema({
    organizationId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Organization',
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
        trim: true,
    },
    sourceType: {
        type: String,
        required: true,
        index: true,
    },
    category: {
        type: String,
        required: true,
    },
    environment: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['Connected', 'Failed', 'Degraded', 'Configuring'],
        default: 'Configuring',
    },
    authMethod: {
        type: String,
    },
    owner: {
        type: String,
    },
    ownerEmail: {
        type: String,
    },
    pipelines: {
        type: Number,
        default: 0,
    },
    lastConnection: {
        type: String,
    },
    lastModified: {
        type: String,
    },
    host: { type: String },
    port: { type: String },
    databaseDetails: { type: String },
    latency: { type: String },
    version: { type: String },
    uptime: { type: String },
    alerts: { type: Number, default: 0 },
}, {
    timestamps: true,
});

exports.DataSource = mongoose_1.default.model('DataSource', DataSourceSchema);
