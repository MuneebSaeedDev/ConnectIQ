"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const transformationRule_controller_1 = require("../controllers/transformations/transformationRule.controller");

const router = (0, express_1.Router)({ mergeParams: true });

// Read operations
router.get('/:orgId/transformation-rules', transformationRule_controller_1.TransformationRuleController.listRules);
router.get('/transformation-rules', transformationRule_controller_1.TransformationRuleController.listRules);

router.get('/:orgId/transformation-rules/:id', transformationRule_controller_1.TransformationRuleController.getRule);
router.get('/transformation-rules/:id', transformationRule_controller_1.TransformationRuleController.getRule);

// Write operations
router.post('/:orgId/transformation-rules', transformationRule_controller_1.TransformationRuleController.createRule);
router.post('/transformation-rules', transformationRule_controller_1.TransformationRuleController.createRule);

router.put('/:orgId/transformation-rules/:id', transformationRule_controller_1.TransformationRuleController.updateRule);
router.put('/transformation-rules/:id', transformationRule_controller_1.TransformationRuleController.updateRule);

router.delete('/:orgId/transformation-rules/:id', transformationRule_controller_1.TransformationRuleController.deleteRule);
router.delete('/transformation-rules/:id', transformationRule_controller_1.TransformationRuleController.deleteRule);

// Partial updates (status toggle)
router.patch('/:orgId/transformation-rules/:id/toggle', transformationRule_controller_1.TransformationRuleController.toggleRuleStatus);
router.patch('/transformation-rules/:id/toggle', transformationRule_controller_1.TransformationRuleController.toggleRuleStatus);

exports.default = router;
