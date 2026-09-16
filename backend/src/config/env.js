"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const node_process_1 = require("node:process");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    port: node_process_1.env.PORT || 3001,
    mongodbUri: node_process_1.env.MONGODB_URI || 'mongodb://localhost:27017/connectiq',
    redisUrl: node_process_1.env.REDIS_URL || 'redis://localhost:6379',
    jwtSecret: node_process_1.env.JWT_SECRET || 'dev_secret',
    jwtExpiresIn: node_process_1.env.JWT_EXPIRES_IN || '15m',
    jwtRefreshSecret: node_process_1.env.JWT_REFRESH_SECRET || 'dev_refresh_secret',
    jwtRefreshExpiresIn: node_process_1.env.JWT_REFRESH_EXPIRES_IN || '7d',
    nodeEnv: node_process_1.env.NODE_ENV || 'development'
};
