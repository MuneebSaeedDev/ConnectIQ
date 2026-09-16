const { OrganizationActivity } = require('../../models/organizations/organizationActivity.model');

class OrganizationActivityService {
  async getActivity(orgId, filters = {}) {
    const query = { organizationId: orgId };

    if (filters.category && filters.category !== 'All categories') {
      query.category = filters.category;
    }
    if (filters.status && filters.status !== 'All statuses') {
      query.result = filters.status;
    }
    if (filters.severity && filters.severity !== 'All severities') {
      query.severity = filters.severity;
    }
    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { eventId: { $regex: filters.search, $options: 'i' } },
        { 'actor.name': { $regex: filters.search, $options: 'i' } },
        { 'resource.name': { $regex: filters.search, $options: 'i' } },
      ];
    }

    const sortOrder = filters.sort === 'Oldest' ? 1 : -1;

    const items = await OrganizationActivity.find(query).sort({ timestamp: sortOrder }).lean();

    return {
      items,
      total: items.length,
      kpis: {
        total: await OrganizationActivity.countDocuments({ organizationId: orgId }),
        failed: await OrganizationActivity.countDocuments({ organizationId: orgId, result: 'Failed' }),
        securityAlerts: await OrganizationActivity.countDocuments({ organizationId: orgId, category: 'Security Policy' }),
        activeUsers: 48, // Aggregated placeholder
      },
      categories: ['Pipeline Execution', 'Connector Sync', 'Authentication', 'Security Policy', 'User Management', 'System', 'Data Quality'],
      statusFilters: ['All statuses', 'Success', 'Failed', 'Warning', 'Info']
    };
  }

  async getEventById(orgId, eventId) {
    const event = await OrganizationActivity.findOne({
      $or: [{ _id: eventId }, { eventId }],
      organizationId: orgId,
    }).lean();

    return event;
  }
}

exports.organizationActivityService = new OrganizationActivityService();
