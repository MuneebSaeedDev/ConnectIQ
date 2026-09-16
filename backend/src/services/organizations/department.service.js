const { Department } = require('../../models/organizations/department.model');
const { DepartmentNotFoundError } = require('../../utils/errors');

class DepartmentService {
  async getDepartments(orgId, filters = {}) {
    const query = { organizationId: orgId };

    if (filters.status && filters.status !== 'All statuses') {
      query.status = filters.status;
    }
    if (filters.businessUnit && filters.businessUnit !== 'All business units') {
      query.businessUnit = filters.businessUnit;
    }
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { code: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const departments = await Department.find(query).sort({ createdAt: -1 }).lean();

    return {
      items: departments,
      total: departments.length,
      kpis: {
        total: await Department.countDocuments({ organizationId: orgId }),
        active: await Department.countDocuments({ organizationId: orgId, status: 'Active' }),
        inactive: await Department.countDocuments({ organizationId: orgId, status: 'Inactive' }),
      }
    };
  }

  async getDepartmentById(orgId, departmentId) {
    const department = await Department.findOne({ _id: departmentId, organizationId: orgId }).lean();
    if (!department) {
      throw new DepartmentNotFoundError();
    }
    return department;
  }

  async createDepartment(orgId, data) {
    const department = new Department({
      ...data,
      organizationId: orgId,
    });
    await department.save();
    return department.toJSON();
  }

  async updateDepartment(orgId, departmentId, updates) {
    const department = await Department.findOneAndUpdate(
      { _id: departmentId, organizationId: orgId },
      { $set: updates },
      { new: true }
    );
    if (!department) {
      throw new DepartmentNotFoundError();
    }
    return department.toJSON();
  }
}

exports.departmentService = new DepartmentService();
