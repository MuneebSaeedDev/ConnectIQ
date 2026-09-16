"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pipeline_controller_1 = require("../controllers/pipelines/pipeline.controller");

const router = (0, express_1.Router)({ mergeParams: true });

// Node library
router.get('/:orgId/pipeline-nodes', pipeline_controller_1.PipelineController.listNodeLibrary);
router.get('/:orgId/pipeline-node-categories', pipeline_controller_1.PipelineController.listNodeLibrary);
router.get('/:orgId/pipeline-node-metrics', pipeline_controller_1.PipelineController.listNodeLibrary);
router.post('/:orgId/pipeline-nodes/import', pipeline_controller_1.PipelineController.listNodeLibrary);

// Pipelines collection and bulk
router.get('/:orgId/pipelines', pipeline_controller_1.PipelineController.listPipelines);
router.post('/:orgId/pipelines', pipeline_controller_1.PipelineController.createPipeline);
router.post('/pipelines', pipeline_controller_1.PipelineController.createPipeline);
router.post('/pipelines/drafts', pipeline_controller_1.PipelineController.createPipeline);
router.post('/pipelines/bulk', pipeline_controller_1.PipelineController.bulkAction);

// Single pipeline base routes
router.get('/pipelines/:id', pipeline_controller_1.PipelineController.getPipelineById);
router.get('/:orgId/pipelines/:id', pipeline_controller_1.PipelineController.getPipelineById);
router.delete('/pipelines/:id', pipeline_controller_1.PipelineController.deletePipeline);
router.delete('/:orgId/pipelines/:id', pipeline_controller_1.PipelineController.deletePipeline);

// Single pipeline actions
router.post('/pipelines/:id/run', pipeline_controller_1.PipelineController.runPipeline);
router.get('/pipelines/:id/status', pipeline_controller_1.PipelineController.getPipelineStatus);
router.post('/pipelines/:id/duplicate', pipeline_controller_1.PipelineController.duplicatePipeline);

// Visual Builder Graph routes
router.get('/:orgId/pipelines/:id/builder', pipeline_controller_1.PipelineController.getBuilderGraph);
router.put('/:orgId/pipelines/:id/builder', pipeline_controller_1.PipelineController.saveBuilderGraph);
router.post('/:orgId/pipelines/:id/validate', pipeline_controller_1.PipelineController.validatePipelineGraph);
router.post('/:orgId/pipelines/:id/publish', pipeline_controller_1.PipelineController.saveBuilderGraph);
router.post('/:orgId/pipelines/:id/execute', pipeline_controller_1.PipelineController.runPipeline);

// Generic Node actions (/api/v1/pipelines/:pipelineId/nodes/:nodeId/*)
router.get('/pipelines/:pipelineId/nodes/:nodeId/:actionUrl', pipeline_controller_1.PipelineController.handleNodeConfigAction);
router.post('/pipelines/:pipelineId/nodes/:nodeId/:actionUrl', pipeline_controller_1.PipelineController.handleNodeConfigAction);
router.put('/pipelines/:pipelineId/nodes/:nodeId/:actionUrl', pipeline_controller_1.PipelineController.handleNodeConfigAction);
router.post('/pipelines/nodes/:nodeId/:actionUrl', pipeline_controller_1.PipelineController.handleNodeConfigAction);

exports.default = router;
