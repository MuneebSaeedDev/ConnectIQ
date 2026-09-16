"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationPreference = exports.Notification = void 0;
const mongoose_1 = __importDefault(require("mongoose"));

const NotificationSchema = new mongoose_1.default.Schema({
    organizationId: {
        type: String,
        required: true,
        index: true,
    },
    userId: {
        type: String,
        required: true,
        index: true,
    },
    type: {
        type: String,
        enum: ['Alert', 'System', 'Pipeline', 'DataQuality'],
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    message: {
        type: String,
        required: true,
    },
    severity: {
        type: String,
        enum: ['info', 'warning', 'critical', 'success'],
        default: 'info',
    },
    isRead: {
        type: Boolean,
        default: false,
        index: true,
    },
    metadata: {
        type: Map,
        of: mongoose_1.default.Schema.Types.Mixed,
        default: {},
    }
}, {
    timestamps: true,
});

const NotificationPreferenceSchema = new mongoose_1.default.Schema({
    organizationId: {
        type: String,
        required: true,
        index: true,
    },
    userId: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    emailAlerts: {
        type: Boolean,
        default: true
    },
    inAppAlerts: {
        type: Boolean,
        default: true
    },
    webhookAlerts: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
});

exports.Notification = mongoose_1.default.model('Notification', NotificationSchema);
exports.NotificationPreference = mongoose_1.default.model('NotificationPreference', NotificationPreferenceSchema);
