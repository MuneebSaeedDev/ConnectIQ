"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const rbac_controller_1 = require("../controllers/roles/rbac.controller");
const router = (0, express_1.Router)();
// Notice: In a real app we'd attach `requireAuth` and org-scoping middlewares here.
// Role CRUD
router.get('/:orgId/roles', rbac_controller_1.RbacController.listRoles);
router.post('/:orgId/roles', rbac_controller_1.RbacController.createRole);
router.get('/:orgId/roles/:roleId', rbac_controller_1.RbacController.getRole);
router.get('/:orgId/roles/:roleId/edit', rbac_controller_1.RbacController.getRole);
router.put('/:orgId/roles/:roleId', rbac_controller_1.RbacController.updateRole);
router.delete('/:orgId/roles/:roleId', rbac_controller_1.RbacController.deleteRole);
// Permission Matrix
router.get('/:orgId/permission-matrix', rbac_controller_1.RbacController.getPermissionMatrix);
// Access Control Settings
router.get('/:orgId/access-control', rbac_controller_1.RbacController.getAccessControlSettings);
router.patch('/:orgId/access-control', rbac_controller_1.RbacController.updateAccessControlSettings);
exports.default = router;
