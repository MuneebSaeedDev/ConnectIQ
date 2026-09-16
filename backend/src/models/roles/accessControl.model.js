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
exports.AccessControlSettings = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const accessControlSettingsSchema = new mongoose_1.Schema({
    organizationId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
        unique: true,
        index: true,
    },
    authProviders: {
        passwordAuth: { type: Boolean, default: true },
        googleSso: { type: Boolean, default: false },
        samlSso: { type: Boolean, default: false },
        oktaSso: { type: Boolean, default: false },
        azureAdSso: { type: Boolean, default: false },
        githubSso: { type: Boolean, default: false },
    },
    mfaSettings: {
        enforceAllUsers: { type: Boolean, default: false },
        enforceAdminUsers: { type: Boolean, default: true },
        allowRememberDevice: { type: Boolean, default: true },
        rememberDeviceDays: { type: Number, default: 30 },
        gracePeriodDays: { type: Number, default: 7 },
        totpEnabled: { type: Boolean, default: true },
        smsEnabled: { type: Boolean, default: false },
        emailOtpEnabled: { type: Boolean, default: true },
        webAuthnEnabled: { type: Boolean, default: false },
        recoveryCodesEnabled: { type: Boolean, default: true },
    },
    passwordPolicy: {
        minLength: { type: Number, default: 12 },
        requireUppercase: { type: Boolean, default: true },
        requireLowercase: { type: Boolean, default: true },
        requireNumbers: { type: Boolean, default: true },
        requireSymbols: { type: Boolean, default: true },
        preventPasswordReuseCount: { type: Number, default: 5 },
        expirationDays: { type: Number, default: 90 },
    },
    sessionManagement: {
        idleTimeoutMinutes: { type: Number, default: 60 },
        maxSessionDurationHours: { type: Number, default: 24 },
        maxConcurrentSessionsPerUser: { type: Number, default: 3 },
        singleSessionOnly: { type: Boolean, default: false },
    },
    networkIpRestrictions: {
        ipAllowlistEnabled: { type: Boolean, default: false },
        allowedIpRanges: [{ type: String }],
        allowedCountries: [{ type: String }],
        blockUnknownLocations: { type: Boolean, default: false },
    },
}, {
    timestamps: true,
});
exports.AccessControlSettings = mongoose_1.default.model('AccessControlSettings', accessControlSettingsSchema);
