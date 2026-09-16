"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PipelineController = void 0;
const pipeline_service_1 = require("../../services/pipelines/pipeline.service");
const response_1 = require("../../utils/response");

class PipelineController {
    static async listPipelines(req, res, next) {
        try {
            const orgId = req.params.orgId || req.user?.organizationId || 'current';
            const queryParams = { ...req.query, ...req.body };
            const data = await pipeline_service_1.PipelineService.listPipelines(orgId, queryParams);
            return (0, response_1.sendSuccess)(res, data);
        } catch (error) {
            next(error);
        }
    }

    static async getPipelineById(req, res, next) {
        try {
            const orgId = req.params.orgId || req.user?.organizationId || 'current';
            const pipelineId = req.params.pipelineId || req.params.id;
            const data = await pipeline_service_1.PipelineService.getPipelineById(orgId, pipelineId);
            return (0, response_1.sendSuccess)(res, data);
        } catch (error) {
            next(error);
        }
    }

    static async createPipeline(req, res, next) {
        try {
            const orgId = req.params.orgId || req.user?.organizationId || 'current';
            const data = await pipeline_service_1.PipelineService.createPipeline(orgId, req.body);
            return (0, response_1.sendSuccess)(res, data, 201);
        } catch (error) {
            next(error);
        }
    }

    static async updatePipeline(req, res, next) {
        try {
            const orgId = req.params.orgId || req.user?.organizationId || 'current';
            const pipelineId = req.params.pipelineId || req.params.id;
            const data = await pipeline_service_1.PipelineService.updatePipeline(orgId, pipelineId, req.body);
            return (0, response_1.sendSuccess)(res, data);
        } catch (error) {
            next(error);
        }
    }

    static async deletePipeline(req, res, next) {
        try {
            const orgId = req.params.orgId || req.user?.organizationId || 'current';
            const pipelineId = req.params.pipelineId || req.params.id;
            const data = await pipeline_service_1.PipelineService.deletePipeline(orgId, pipelineId);
            return (0, response_1.sendSuccess)(res, data);
        } catch (error) {
            next(error);
        }
    }

    static async runPipeline(req, res, next) {
        try {
            const orgId = req.params.orgId || req.user?.organizationId || 'current';
            const pipelineId = req.params.pipelineId || req.params.id;
            const data = await pipeline_service_1.PipelineService.runPipeline(orgId, pipelineId);
            return (0, response_1.sendSuccess)(res, data);
        } catch (error) {
            next(error);
        }
    }

    static async getPipelineStatus(req, res, next) {
        try {
            const orgId = req.params.orgId || req.user?.organizationId || 'current';
            const pipelineId = req.params.pipelineId || req.params.id;
            const data = await pipeline_service_1.PipelineService.getPipelineStatus(orgId, pipelineId);
            return (0, response_1.sendSuccess)(res, data);
        } catch (error) {
            next(error);
        }
    }

    static async duplicatePipeline(req, res, next) {
        try {
            const orgId = req.params.orgId || req.user?.organizationId || 'current';
            const pipelineId = req.params.pipelineId || req.params.id;
            const data = await pipeline_service_1.PipelineService.duplicatePipeline(orgId, pipelineId);
            return (0, response_1.sendSuccess)(res, data, 201);
        } catch (error) {
            next(error);
        }
    }

    static async bulkAction(req, res, next) {
        try {
            const orgId = req.params.orgId || req.user?.organizationId || 'current';
            const data = await pipeline_service_1.PipelineService.bulkAction(orgId, req.body);
            return (0, response_1.sendSuccess)(res, data);
        } catch (error) {
            next(error);
        }
    }

    // Builder Graph Endpoints
    static async getBuilderGraph(req, res, next) {
        try {
            const orgId = req.params.orgId || req.user?.organizationId || 'current';
            const pipelineId = req.params.pipelineId || req.params.id;
            const data = await pipeline_service_1.PipelineService.getPipelineBuilderGraph(orgId, pipelineId);
            return (0, response_1.sendSuccess)(res, data);
        } catch (error) {
            next(error);
        }
    }

    static async saveBuilderGraph(req, res, next) {
        try {
            const orgId = req.params.orgId || req.user?.organizationId || 'current';
            const pipelineId = req.params.pipelineId || req.params.id;
            const data = await pipeline_service_1.PipelineService.savePipelineBuilderGraph(orgId, pipelineId, req.body);
            return (0, response_1.sendSuccess)(res, data);
        } catch (error) {
            next(error);
        }
    }

    static async validatePipelineGraph(req, res, next) {
        try {
            const orgId = req.params.orgId || req.user?.organizationId || 'current';
            const pipelineId = req.params.pipelineId || req.params.id;
            const data = await pipeline_service_1.PipelineService.validatePipelineGraph(orgId, pipelineId, req.body);
            return (0, response_1.sendSuccess)(res, data);
        } catch (error) {
            next(error);
        }
    }

    // Node Library
    static async listNodeLibrary(req, res, next) {
        try {
            const orgId = req.params.orgId || req.user?.organizationId || 'current';
            const data = await pipeline_service_1.PipelineService.listNodeLibrary(orgId, req.query);
            return (0, response_1.sendSuccess)(res, data);
        } catch (error) {
            next(error);
        }
    }

    // Generic Node Config Handler
    static async handleNodeConfigAction(req, res, next) {
        try {
            const { orgId = 'current', pipelineId, nodeId } = req.params;
            const actionPath = req.path.split('/').pop();
            const data = await pipeline_service_1.PipelineService.handleNodeConfig(orgId, pipelineId, nodeId, actionPath, req.body);
            return (0, response_1.sendSuccess)(res, data);
        } catch (error) {
            next(error);
        }
    }
}

exports.PipelineController = PipelineController;
