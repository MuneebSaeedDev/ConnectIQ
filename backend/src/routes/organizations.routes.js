const express = require('express');
const { organizationController } = require('../controllers/organizations/organization.controller');

const router = express.Router();

// Organizations CRUD
router.get('/', (req, res, next) => organizationController.listOrganizations(req, res, next));
router.post('/', (req, res, next) => organizationController.createOrganization(req, res, next));
router.get('/:id', (req, res, next) => organizationController.getOrganizationDetails(req, res, next));
router.patch('/:id', (req, res, next) => organizationController.updateOrganization(req, res, next));

// Settings
router.get('/:id/settings', (req, res, next) => organizationController.getOrganizationSettings(req, res, next));
router.patch('/:id/settings', (req, res, next) => organizationController.updateOrganizationSettings(req, res, next));

// Departments
router.get('/:id/departments', (req, res, next) => organizationController.listDepartments(req, res, next));
router.post('/:id/departments', (req, res, next) => organizationController.createDepartment(req, res, next));
router.patch('/:id/departments/:deptId', (req, res, next) => organizationController.updateDepartment(req, res, next));

// Teams
router.get('/:id/teams', (req, res, next) => organizationController.listTeams(req, res, next));
router.post('/:id/teams', (req, res, next) => organizationController.createTeam(req, res, next));
router.patch('/:id/teams/:teamId', (req, res, next) => organizationController.updateTeam(req, res, next));

// Activity
router.get('/:id/activity', (req, res, next) => organizationController.listActivity(req, res, next));
router.get('/:id/activity/:eventId', (req, res, next) => organizationController.getActivityEvent(req, res, next));

module.exports = router;
