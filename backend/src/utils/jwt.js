"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAccessToken = generateAccessToken;
exports.generateRefreshToken = generateRefreshToken;
exports.verifyAccessToken = verifyAccessToken;
exports.verifyRefreshToken = verifyRefreshToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
function generateAccessToken(payload) {
    const options = {
        expiresIn: env_1.config.jwtExpiresIn,
    };
    return jsonwebtoken_1.default.sign(payload, env_1.config.jwtSecret, options);
}
function generateRefreshToken(payload) {
    const options = {
        expiresIn: env_1.config.jwtRefreshExpiresIn,
    };
    return jsonwebtoken_1.default.sign(payload, env_1.config.jwtRefreshSecret, options);
}
function verifyAccessToken(token) {
    return jsonwebtoken_1.default.verify(token, env_1.config.jwtSecret);
}
function verifyRefreshToken(token) {
    return jsonwebtoken_1.default.verify(token, env_1.config.jwtRefreshSecret);
}
