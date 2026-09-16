"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const destination_controller_1 = require("../controllers/destinations/destination.controller");

const router = (0, express_1.Router)({ mergeParams: true });

router.get('/:orgId/destinations', destination_controller_1.DestinationController.listDestinations);
router.post('/:orgId/destinations', destination_controller_1.DestinationController.createDestination);
router.get('/:orgId/destinations/:id', destination_controller_1.DestinationController.getDestinationById);
router.put('/:orgId/destinations/:id', destination_controller_1.DestinationController.updateDestination);
router.delete('/:orgId/destinations/:id', destination_controller_1.DestinationController.deleteDestination);

// Connection Testing
router.post('/:orgId/destinations/test-connection', destination_controller_1.DestinationController.testConnection);
router.post('/:orgId/destinations/:id/test', destination_controller_1.DestinationController.testConnection);
router.post('/:orgId/destinations/:id/test-quick', destination_controller_1.DestinationController.testConnection);
router.post('/:orgId/destinations/:id/save', destination_controller_1.DestinationController.updateDestinationConfig);

// Configuration
router.get('/:orgId/destinations/:id/config', destination_controller_1.DestinationController.getDestinationConfig);
router.put('/:orgId/destinations/:id/config', destination_controller_1.DestinationController.updateDestinationConfig);

// Health Monitoring
router.get('/:orgId/destinations/:id/health', destination_controller_1.DestinationController.getDestinationHealth);
router.post('/:orgId/destinations/:id/health/alerts/:alertId/acknowledge', destination_controller_1.DestinationController.acknowledgeAlert);
router.post('/:orgId/destinations/:id/health/checks/run-all', destination_controller_1.DestinationController.runAllHealthChecks);
router.post('/:orgId/destinations/:id/health/checks/:checkId/run', destination_controller_1.DestinationController.runHealthCheck);

// History
router.get('/:orgId/destinations/:id/history', destination_controller_1.DestinationController.getDestinationHistory);

exports.default = router;
