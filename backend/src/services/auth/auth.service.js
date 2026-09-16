"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const user_model_1 = require("../../models/user.model");
const token_model_1 = require("../../models/token.model");
const errors_1 = require("../../utils/errors");
const password_1 = require("../../utils/password");
const jwt_1 = require("../../utils/jwt");
// Helper for tokens
const generateRandomToken = () => crypto_1.default.randomBytes(32).toString('hex');
class AuthService {
    
    static async register(email, password, firstName, lastName, gender) {
        const existingUser = await user_model_1.User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            throw new errors_1.AppError('Email already in use.', 400);
        }
        const passwordHash = await (0, password_1.hashPassword)(password);
        
        const user = await user_model_1.User.create({
            email: email.toLowerCase(),
            passwordHash,
            firstName,
            lastName,
            // Custom field mapping if needed
            // gender is not strictly in the user model currently but can be omitted or added.
        });
        
        return user;
    }

    static async login(email, password, ipAddress, userAgent) {
        const user = await user_model_1.User.findOne({ email: email.toLowerCase() });
        if (!user) { console.log('User not found during login:', email); } if (!user || (user.status !== 'active' && user.status !== 'Active')) {
            throw new errors_1.AuthenticationError('Invalid email or password.');
        }
        const isValid = await (0, password_1.comparePassword)(password, user.passwordHash);
        if (!isValid) {
            throw new errors_1.AuthenticationError('Invalid email or password.');
        }
        user.lastLoginAt = new Date();
        await user.save();
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role,
            organizationId: user.organizationId?.toString(),
        };
        const accessToken = (0, jwt_1.generateAccessToken)(payload);
        const refreshTokenValue = (0, jwt_1.generateRefreshToken)(payload);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
        await token_model_1.RefreshToken.create({
            token: refreshTokenValue,
            userId: user.id,
            expiresAt,
            ipAddress,
            userAgent,
        });
        return {
            accessToken,
            refreshToken: refreshTokenValue,
            user
        };
    }
    static async logout(refreshToken) {
        await token_model_1.RefreshToken.updateOne({ token: refreshToken }, { $set: { isRevoked: true } });
    }
    static async requestPasswordReset(email) {
        const user = await user_model_1.User.findOne({ email: email.toLowerCase() });
        if (!user) {
            // Return true to avoid email enumeration
            return true;
        }
        const token = generateRandomToken();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry
        await token_model_1.PasswordResetToken.create({
            token,
            userId: user.id,
            expiresAt,
        });
        // Treat email delivery as external integration (unknown provider — mark unknown)
        console.log(`[Email Mock] Password reset link for ${email}: /reset-password?token=${token}`);
        return true;
    }
    static async resetPassword(token, newPassword) {
        const resetToken = await token_model_1.PasswordResetToken.findOne({
            token,
            isUsed: false,
            expiresAt: { $gt: new Date() }
        });
        if (!resetToken) {
            throw new errors_1.ValidationError('This reset link is invalid or has expired. Request a new one.');
        }
        const user = await user_model_1.User.findById(resetToken.userId);
        if (!user) {
            throw new errors_1.ValidationError('This reset link is invalid or has expired. Request a new one.');
        }
        const passwordHash = await (0, password_1.hashPassword)(newPassword);
        user.passwordHash = passwordHash;
        await user.save();
        resetToken.isUsed = true;
        await resetToken.save();
        // Invalidate all active refresh tokens for security
        await token_model_1.RefreshToken.updateMany({ userId: user.id, isRevoked: false }, { $set: { isRevoked: true } });
    }
    static async changePassword(userId, currentPassword, newPassword) {
        const user = await user_model_1.User.findById(userId);
        if (!user)
            throw new errors_1.NotFoundError('User not found');
        const isValid = await (0, password_1.comparePassword)(currentPassword, user.passwordHash);
        if (!isValid) {
            throw new errors_1.ValidationError('Incorrect current password.');
        }
        const passwordHash = await (0, password_1.hashPassword)(newPassword);
        user.passwordHash = passwordHash;
        await user.save();
    }
    static async requestEmailVerification(userId) {
        const user = await user_model_1.User.findById(userId);
        if (!user)
            throw new errors_1.NotFoundError('User not found');
        if (user.isEmailVerified) {
            throw new errors_1.ValidationError('Email is already verified.');
        }
        const token = generateRandomToken();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours expiry
        await token_model_1.EmailVerificationToken.create({
            token,
            userId: user.id,
            expiresAt,
        });
        // Treat email delivery as external provider
        console.log(`[Email Mock] Email verification link for ${user.email}: /verify-email?token=${token}`);
    }
    static async verifyEmail(token) {
        const verificationToken = await token_model_1.EmailVerificationToken.findOne({
            token,
            isUsed: false,
            expiresAt: { $gt: new Date() }
        });
        if (!verificationToken) {
            throw new errors_1.ValidationError('This verification link is invalid or has expired.');
        }
        const user = await user_model_1.User.findById(verificationToken.userId);
        if (!user) {
            throw new errors_1.ValidationError('This verification link is invalid or has expired.');
        }
        user.isEmailVerified = true;
        await user.save();
        verificationToken.isUsed = true;
        await verificationToken.save();
    }
    static async verifyTwoFactor(userId, code) {
        const user = await user_model_1.User.findById(userId);
        if (!user)
            throw new errors_1.NotFoundError('User not found');
        // Without a real TOTP secret generation, we follow the docs mock requirement:
        // Treat any 6 numeric digits as valid.
        if (!/^\d{6}$/.test(code)) {
            throw new errors_1.ValidationError('Incorrect verification code. Please try again.');
        }
    }
    static async resendTwoFactor(userId) {
        const user = await user_model_1.User.findById(userId);
        if (!user)
            throw new errors_1.NotFoundError('User not found');
        // In a real app we might regenerate a code and send via Email/SMS
        console.log(`[Email Mock] Resent 2FA code to ${user.email}: 123456`);
    }
}
exports.AuthService = AuthService;
