"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dataSource_controller_1 = require("../controllers/dataSources/dataSource.controller");

const router = (0, express_1.Router)({ mergeParams: true });

router.get('/:orgId/data-sources', dataSource_controller_1.DataSourceController.listDataSources);
router.post('/:orgId/data-sources', dataSource_controller_1.DataSourceController.createDataSource);
router.get('/:orgId/data-sources/:id', dataSource_controller_1.DataSourceController.getDataSource);
router.put('/:orgId/data-sources/:id', dataSource_controller_1.DataSourceController.updateDataSource);
router.patch('/:orgId/data-sources/:id', dataSource_controller_1.DataSourceController.updateDataSource);
router.delete('/:orgId/data-sources/:id', dataSource_controller_1.DataSourceController.deleteDataSource);
router.post('/:orgId/data-sources/:id/clone', dataSource_controller_1.DataSourceController.cloneDataSource);
router.post('/:orgId/data-sources/:id/archive', dataSource_controller_1.DataSourceController.archiveDataSource);

// Handles all connection tests (generic + db/api specific mock boundaries)
router.post('/:orgId/data-sources/test-connection', dataSource_controller_1.DataSourceController.testConnection);
router.post('/:orgId/data-sources/database/test-connection', dataSource_controller_1.DataSourceController.testConnection);
router.post('/:orgId/data-sources/api/test-request', dataSource_controller_1.DataSourceController.testConnection);

// Handles creation by type wrappers
router.post('/:orgId/data-sources/database', dataSource_controller_1.DataSourceController.createDataSource);
router.post('/:orgId/data-sources/api', dataSource_controller_1.DataSourceController.createDataSource);

exports.default = router;
