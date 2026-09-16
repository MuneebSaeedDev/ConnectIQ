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
exports.Role = exports.PrivilegeLevel = exports.RoleType = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var RoleType;
(function (RoleType) {
    RoleType["SYSTEM"] = "SYSTEM";
    RoleType["CUSTOM"] = "CUSTOM";
})(RoleType || (exports.RoleType = RoleType = {}));
var PrivilegeLevel;
(function (PrivilegeLevel) {
    PrivilegeLevel["ADMINISTRATIVE"] = "ADMINISTRATIVE";
    PrivilegeLevel["ELEVATED"] = "ELEVATED";
    PrivilegeLevel["STANDARD"] = "STANDARD";
    PrivilegeLevel["RESTRICTED"] = "RESTRICTED";
    PrivilegeLevel["READ_ONLY"] = "READ_ONLY";
})(PrivilegeLevel || (exports.PrivilegeLevel = PrivilegeLevel = {}));
const roleSchema = new mongoose_1.Schema({
    organizationId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
        index: true,
    },
    key: {
        type: String,
        required: true,
        trim: true,
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
    type: {
        type: String,
        enum: Object.values(RoleType),
        default: RoleType.CUSTOM,
        required: true,
    },
    privilegeLevel: {
        type: String,
        enum: Object.values(PrivilegeLevel),
        default: PrivilegeLevel.STANDARD,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true,
    },
    assignedUsersCount: {
        type: Number,
        default: 0,
    },
    permissions: [
        {
            resource: { type: String, required: true },
            action: { type: String, required: true },
            effect: { type: String, enum: ['ALLOW', 'DENY'], required: true },
            conditions: { type: mongoose_1.Schema.Types.Mixed },
        },
    ],
}, {
    timestamps: true,
});
// Compound index to ensure role key uniqueness per organization
roleSchema.index({ organizationId: 1, key: 1 }, { unique: true });
exports.Role = mongoose_1.default.model('Role', roleSchema);
