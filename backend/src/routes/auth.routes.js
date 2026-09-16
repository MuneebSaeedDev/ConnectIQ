"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth/auth.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Public routes
router.post('/signup', auth_controller_1.AuthController.register);
router.post('/register', auth_controller_1.AuthController.register);
router.post('/login', auth_controller_1.AuthController.login);
router.post('/logout', auth_controller_1.AuthController.logout);
router.post('/forgot-password', auth_controller_1.AuthController.forgotPassword);
router.post('/reset-password', auth_controller_1.AuthController.resetPassword);
// Email Verification
router.post('/verify-email/confirm', auth_controller_1.AuthController.verifyEmail);
router.post('/verify-email/resend', auth_middleware_1.requireAuth, auth_controller_1.AuthController.requestEmailVerification);
// 2FA routes
router.post('/2fa/verify', auth_middleware_1.requireAuth, auth_controller_1.AuthController.verifyTwoFactor);
router.post('/2fa/resend', auth_middleware_1.requireAuth, auth_controller_1.AuthController.resendTwoFactorCode);
// Authenticated routes
router.post('/change-password', auth_middleware_1.requireAuth, auth_controller_1.AuthController.changePassword);
exports.default = router;
