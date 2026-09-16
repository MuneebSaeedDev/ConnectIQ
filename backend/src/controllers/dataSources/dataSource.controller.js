"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataSourceController = void 0;
const dataSource_service_1 = require("../../services/dataSources/dataSource.service");
const response_1 = require("../../utils/response");

class DataSourceController {
    static async listDataSources(req, res, next) {
        try {
            const orgId = req.params.orgId || req.user?.organizationId || 'current';
            const data = await dataSource_service_1.DataSourceService.listDataSources(orgId, req.query);
            return (0, response_1.sendSuccess)(res, data);
        } catch (error) {
            next(error);
        }
    }

    static async createDataSource(req, res, next) {
        try {
            const orgId = req.params.orgId || req.user?.organizationId || 'current';
            const data = await dataSource_service_1.DataSourceService.createDataSource(orgId, req.body);
            return (0, response_1.sendSuccess)(res, data, 201);
        } catch (error) {
            next(error);
        }
    }

    static async testConnection(req, res, next) {
        try {
            const orgId = req.params.orgId || req.user?.organizationId || 'current';
            const data = await dataSource_service_1.DataSourceService.testConnection(orgId, req.body);
            return (0, response_1.sendSuccess)(res, data);
        } catch (error) {
            next(error);
        }
    }
}

exports.DataSourceController = DataSourceController;
