"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Destination = void 0;
const mongoose_1 = __importDefault(require("mongoose"));

const DestinationSchema = new mongoose_1.default.Schema({
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
    type: {
        type: String,
        required: true,
        enum: [
            'Snowflake',
            'Amazon Redshift',
            'Google BigQuery',
            'PostgreSQL',
            'MySQL',
            'Amazon S3',
            'Azure Blob Storage',
            'Google Cloud Storage',
            'Apache Kafka',
            'RabbitMQ',
            'Elasticsearch',
            'MongoDB',
            'Webhook / REST API',
            'Databricks Delta Lake',
        ],
    },
    typeLabel: {
        type: String,
    },
    environment: {
        type: String,
        enum: ['Production', 'Staging', 'Development'],
        default: 'Production',
    },
    status: {
        type: String,
        enum: ['Connected', 'Failed', 'Degraded', 'Configuring'],
        default: 'Connected',
    },
    owner: {
        type: String,
        default: 'System',
    },
    description: {
        type: String,
    },
    account: { type: String },
    warehouse: { type: String },
    database: { type: String },
    schema: { type: String },
    username: { type: String },
    authMethod: {
        type: String,
        enum: ['Username & Password', 'OAuth 2.0', 'Key Pair', 'AWS IAM Role', 'Service Account'],
        default: 'Username & Password',
    },
    host: { type: String },
    port: { type: String },
    connectionTimeout: { type: Number, default: 30 },
    batchSize: { type: Number, default: 5000 },
    retryAttempts: { type: Number, default: 3 },
    retryInterval: { type: Number, default: 10 },
    parallelWrites: { type: Number, default: 4 },
    enableTls: { type: Boolean, default: true },
    enableGzip: { type: Boolean, default: true },
    enableKeepAlive: { type: Boolean, default: true },
    lastTested: { type: String },
    lastModified: { type: String },
    latency: { type: String, default: '45 ms' },
    version: { type: String, default: 'v1.0.0' },
    uptime: { type: String, default: '99.98%' },
    alerts: { type: Number, default: 0 },
}, {
    timestamps: true,
});

exports.Destination = mongoose_1.default.model('Destination', DestinationSchema);
