"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/users/user.controller");

const router = (0, express_1.Router)();

// Self-service profile routes (no trailing /users)
router.get('/me', user_controller_1.UserController.getMyProfile);
router.put('/me', user_controller_1.UserController.saveMyProfile);

// Organization-scoped user management (nested under /:orgId)
router.get('/:orgId/users', user_controller_1.UserController.listUsers);
router.post('/:orgId/users', user_controller_1.UserController.inviteUser);

// Ensure longer paths match before shorter ones
router.get('/:orgId/users/:id/edit', user_controller_1.UserController.getEditableUser);
router.get('/:orgId/users/:id/activity', user_controller_1.UserController.getUserActivityHistory);
router.get('/:orgId/users/:id/login-history', user_controller_1.UserController.getUserLoginHistory);
router.get('/:orgId/users/:id/permissions', user_controller_1.UserController.getUserPermissions);
router.put('/:orgId/users/:id/permissions', user_controller_1.UserController.saveUserPermissions);
router.patch('/:orgId/users/:id', user_controller_1.UserController.updateUser);

// Fallback exact match param route
router.get('/:orgId/users/:id', user_controller_1.UserController.getUserDetails);

exports.default = router;
