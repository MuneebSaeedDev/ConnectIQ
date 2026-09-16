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
exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));

const UserSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    firstName: {
        type: String,
        trim: true,
    },
    lastName: {
        type: String,
        trim: true,
    },
    displayName: {
        type: String,
        trim: true,
    },
    jobTitle: {
        type: String,
        trim: true,
    },
    employeeId: {
        type: String,
        trim: true,
    },
    phone: {
        type: String,
        trim: true,
    },
    officeLocation: {
        type: String,
        trim: true,
    },
    pronouns: {
        type: String,
        trim: true,
    },
    avatarUrl: {
        type: String,
    },
    organizationId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Organization',
        index: true,
    },
    departmentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Department',
    },
    department: {
        type: String,
        trim: true,
    },
    teamId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Team',
    },
    team: {
        type: String,
        trim: true,
    },
    manager: {
        type: String,
        trim: true,
    },
    role: {
        type: String,
        default: 'Engineer',
        index: true,
    },
    roleId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Role',
    },
    accountType: {
        type: String,
        enum: ['Org Admin', 'Dept Manager', 'Team Lead', 'Standard', 'Guest'],
        default: 'Standard',
    },
    license: {
        type: {
            type: String,
            default: 'Full — Engineer',
        },
        status: {
            type: String,
            default: 'Active',
        },
        assignedDate: {
            type: Date,
            default: Date.now,
        },
        expiration: {
            type: String,
            default: 'No expiration',
        },
        seat: {
            type: String,
        },
        featureAccess: [{
            key: { type: String },
            label: { type: String },
            enabled: { type: Boolean, default: true },
        }],
    },
    status: {
        type: String,
        enum: ['active', 'pending', 'suspended', 'deactivated', 'locked', 'Active', 'Pending', 'Suspended', 'Locked'],
        default: 'Active',
        index: true,
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    twoFactorEnabled: {
        type: Boolean,
        default: false,
    },
    twoFactorSecret: {
        type: String,
    },
    ssoEnabled: {
        type: Boolean,
        default: false,
    },
    lastLoginAt: {
        type: Date,
    },
    lastLoginText: {
        type: String,
        default: 'Never',
    },
    loginCount: {
        type: Number,
        default: 0,
    },
    failedLoginAttempts: {
        type: Number,
        default: 0,
    },
    ipAllowlist: {
        type: String,
    },
    concurrentSessionsLimit: {
        type: Number,
        default: 3,
    },
    sessionTimeoutMinutes: {
        type: Number,
        default: 60,
    },
    notificationPreferences: {
        email: {
            pipelineFailures: { type: Boolean, default: true },
            connectorAlerts: { type: Boolean, default: true },
            securityAlerts: { type: Boolean, default: true },
            weeklyDigest: { type: Boolean, default: false },
            marketingUpdates: { type: Boolean, default: false },
        },
        inApp: {
            realTimeExecutions: { type: Boolean, default: true },
            taskAssignments: { type: Boolean, default: true },
            systemAnnouncements: { type: Boolean, default: true },
            teamActivity: { type: Boolean, default: true },
        },
    },
    personalPreferences: {
        language: { type: String, default: 'English (US)' },
        timezone: { type: String, default: 'UTC-8 (Pacific Time)' },
        dateFormat: { type: String, default: 'YYYY-MM-DD' },
        timeFormat: { type: String, default: '12-hour (AM/PM)' },
        numberFormat: { type: String, default: '1,234.56 (US)' },
        theme: { type: String, default: 'System Default' },
        defaultLandingPage: { type: String, default: 'Pipelines Dashboard' },
    },
    permissionOverrides: {
        primaryRole: { type: String },
        secondaryRoles: [{ type: String }],
        permissionGroups: [{ type: String }],
        directPermissions: [{
            key: { type: String },
            granted: { type: Boolean },
        }],
        resourceGrants: [{
            resource: { type: String },
            resourceType: { type: String },
            accessLevel: { type: String },
            conditions: { type: String },
        }],
        administrativePrivileges: {
            bypassApprovals: { type: Boolean, default: false },
            manageApiKeys: { type: Boolean, default: false },
            impersonateUsers: { type: Boolean, default: false },
            exportAuditLogs: { type: Boolean, default: false },
            viewSensitiveData: { type: Boolean, default: false },
            manageSecurityPolicies: { type: Boolean, default: false },
        },
    },
}, {
    timestamps: true,
});

exports.User = mongoose_1.default.model('User', UserSchema);
