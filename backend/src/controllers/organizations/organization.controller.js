const { organizationService } = require('../../services/organizations/organization.service');
const { departmentService } = require('../../services/organizations/department.service');
const { teamService } = require('../../services/organizations/team.service');
const { organizationActivityService } = require('../../services/organizations/organizationActivity.service');
const { sendSuccess, sendError } = require('../../utils/response');

class OrganizationController {
  // Organizations CRUD
  async listOrganizations(req, res, next) {
    try {
      const { status, plan, region, search, page, limit } = req.query;
      const result = await organizationService.getOrganizations(
        { status, plan, region, search },
        parseInt(page, 10) || 1,
        parseInt(limit, 10) || 25
      );
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async getOrganizationDetails(req, res, next) {
    try {
      const { id } = req.params;
      const result = await organizationService.getOrganizationById(id);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async createOrganization(req, res, next) {
    try {
      const result = await organizationService.createOrganization(req.body);
      return sendSuccess(res, result, 'Organization created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async updateOrganization(req, res, next) {
    try {
      const { id } = req.params;
      const result = await organizationService.updateOrganization(id, req.body);
      return sendSuccess(res, result, 'Organization updated successfully');
    } catch (err) {
      next(err);
    }
  }

  async getOrganizationSettings(req, res, next) {
    try {
      const { id } = req.params;
      const result = await organizationService.getOrganizationSettings(id);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async updateOrganizationSettings(req, res, next) {
    try {
      const { id } = req.params;
      const result = await organizationService.updateOrganizationSettings(id, req.body);
      return sendSuccess(res, result, 'Settings updated successfully');
    } catch (err) {
      next(err);
    }
  }

  // Departments
  async listDepartments(req, res, next) {
    try {
      const { id } = req.params;
      const { status, businessUnit, search } = req.query;
      const result = await departmentService.getDepartments(id, { status, businessUnit, search });
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async createDepartment(req, res, next) {
    try {
      const { id } = req.params;
      const result = await departmentService.createDepartment(id, req.body);
      return sendSuccess(res, result, 'Department created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async updateDepartment(req, res, next) {
    try {
      const { id, deptId } = req.params;
      const result = await departmentService.updateDepartment(id, deptId, req.body);
      return sendSuccess(res, result, 'Department updated successfully');
    } catch (err) {
      next(err);
    }
  }

  // Teams
  async listTeams(req, res, next) {
    try {
      const { id } = req.params;
      const { status, department, search } = req.query;
      const result = await teamService.getTeams(id, { status, department, search });
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async createTeam(req, res, next) {
    try {
      const { id } = req.params;
      const result = await teamService.createTeam(id, req.body);
      return sendSuccess(res, result, 'Team created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async updateTeam(req, res, next) {
    try {
      const { id, teamId } = req.params;
      const result = await teamService.updateTeam(id, teamId, req.body);
      return sendSuccess(res, result, 'Team updated successfully');
    } catch (err) {
      next(err);
    }
  }

  // Activity
  async listActivity(req, res, next) {
    try {
      const { id } = req.params;
      const { category, severity, status, search, sort, page, limit } = req.query;
      const result = await organizationActivityService.getActivity(
        id,
        { category, severity, status, search, sort },
        parseInt(page, 10) || 1,
        parseInt(limit, 10) || 25
      );
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async getActivityEvent(req, res, next) {
    try {
      const { id, eventId } = req.params;
      const result = await organizationActivityService.getEventById(id, eventId);
      if (!result) {
        return sendError(res, 'Activity event not found', 404);
      }
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }
}

exports.organizationController = new OrganizationController();
