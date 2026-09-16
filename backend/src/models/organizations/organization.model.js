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
exports.Organization = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const OrganizationSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, uppercase: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    region: { type: String, default: 'US-East (N. Virginia)' },
    plan: {
        type: String,
        enum: ['Enterprise', 'Professional', 'Starter', 'Custom'],
        default: 'Enterprise',
    },
    status: {
        type: String,
        enum: ['Active', 'Trial', 'Suspended', 'Expiring', 'Pending'],
        default: 'Active',
    },
    primaryAdmin: {
        name: { type: String, required: true },
        email: { type: String, required: true, lowercase: true, trim: true },
    },
    domain: { type: String, trim: true },
    website: { type: String, trim: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    renewalDate: { type: Date },
    trialExpiration: { type: Date },
    settings: {
        general: {
            displayName: { type: String, default: 'Acme Corporation' },
            organizationCode: { type: String, default: 'ORG-00142' },
            timezone: { type: String, default: 'America/New_York (UTC-5)' },
            dateFormat: { type: String, default: 'YYYY-MM-DD' },
            timeFormat: { type: String, default: '24-hour' },
            language: { type: String, default: 'English (US)' },
            fiscalYearStart: { type: String, default: 'January' },
            defaultDataRetentionDays: { type: Number, default: 90 },
            allowMemberInvites: { type: Boolean, default: true },
            requireAdminApprovalForTeams: { type: Boolean, default: true },
        },
        security: {
            mfaRequired: { type: Boolean, default: true },
            mfaGracePeriodDays: { type: Number, default: 7 },
            ssoEnforced: { type: Boolean, default: false },
            sessionIdleTimeoutMinutes: { type: Number, default: 30 },
            maxConcurrentSessions: { type: Number, default: 5 },
            ipAllowlist: { type: [String], default: [] },
            allowedCountries: { type: [String], default: ['US', 'CA', 'GB', 'DE', 'AU'] },
            passwordMinLength: { type: Number, default: 12 },
            passwordRequireSpecialChar: { type: Boolean, default: true },
            passwordRequireNumbers: { type: Boolean, default: true },
            passwordRequireUppercase: { type: Boolean, default: true },
            passwordExpireDays: { type: Number, default: 90 },
            failedLoginLockoutThreshold: { type: Number, default: 5 },
            lockoutDurationMinutes: { type: Number, default: 15 },
        },
        notifications: {
            emailNotificationsEnabled: { type: Boolean, default: true },
            slackWebhookUrl: { type: String },
            teamsWebhookUrl: { type: String },
            pagerDutyApiKey: { type: String },
            alertEmailRecipients: { type: [String], default: [] },
            notifyPipelineFailures: { type: Boolean, default: true },
            notifyConnectorFailures: { type: Boolean, default: true },
            notifySecurityAlerts: { type: Boolean, default: true },
            notifyWeeklyDigest: { type: Boolean, default: true },
            notifyMonthlyComplianceReport: { type: Boolean, default: true },
        },
        branding: {
            portalHeaderTitle: { type: String, default: 'ConnectIQ Enterprise Portal' },
            primaryBrandColor: { type: String, default: '#4318FF' },
            accentBrandColor: { type: String, default: '#6AD2FF' },
            customFaviconUrl: { type: String },
            customLogoUrl: { type: String },
            showPoweredByFooter: { type: Boolean, default: true },
        },
        integrations: {
            githubOrgName: { type: String },
            awsAccountId: { type: String },
            datadogApiKey: { type: String },
            splunkEndpointUrl: { type: String },
            enableAuditLogStreaming: { type: Boolean, default: false },
            auditLogStreamDestination: { type: String },
        },
        operationalDefaults: {
            defaultPipelineTimeoutMinutes: { type: Number, default: 60 },
            defaultPipelineMaxRetries: { type: Number, default: 3 },
            defaultNodeWorkerConcurrency: { type: Number, default: 10 },
            defaultLogLevel: { type: String, enum: ['DEBUG', 'INFO', 'WARN', 'ERROR'], default: 'INFO' },
            enableRealtimeMonitoring: { type: Boolean, default: true },
            telemetrySamplingRatePercent: { type: Number, default: 100 },
        },
        compliance: {
            soc2ComplianceMode: { type: Boolean, default: true },
            gdprCompliantDeletion: { type: Boolean, default: true },
            hipaaBaaSigned: { type: Boolean, default: false },
            pciDssRestrictedLogging: { type: Boolean, default: true },
            auditLogRetentionYears: { type: Number, default: 7 },
            dataResidencyRegion: { type: String, default: 'US-East' },
        },
    },
}, {
    timestamps: true,
});
exports.Organization = mongoose_1.default.model('Organization', OrganizationSchema);
