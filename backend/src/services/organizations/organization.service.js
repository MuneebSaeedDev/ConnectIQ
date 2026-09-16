const { Organization } = require('../../models/organizations/organization.model');
const { OrganizationActivity } = require('../../models/organizations/organizationActivity.model');
const { OrganizationNotFoundError, ConflictError } = require('../../utils/errors');

class OrganizationService {
  /**
   * List organizations with pagination and filters
   */
  async getOrganizations(filters = {}, page = 1, limit = 25) {
    const query = {};

    if (filters.status && filters.status !== 'All statuses') {
      query.status = filters.status;
    }
    if (filters.plan && filters.plan !== 'All plans') {
      query.plan = filters.plan;
    }
    if (filters.region && filters.region !== 'All regions') {
      query.region = filters.region;
    }
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { code: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Organization.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Organization.countDocuments(query),
    ]);

    const formattedItems = items.map(org => ({
      ...org,
      users: Math.floor(Math.random() * 50) + 1,
      pipelines: Math.floor(Math.random() * 20),
      lastActivity: org.updatedAt,
    }));

    return {
      items: formattedItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      kpis: {
        total: await Organization.countDocuments(),
        active: await Organization.countDocuments({ status: 'Active' }),
        trial: await Organization.countDocuments({ status: 'Trial' }),
        suspended: await Organization.countDocuments({ status: 'Suspended' }),
        expiring: await Organization.countDocuments({ status: 'Expiring' }),
      }
    };
  }

  /**
   * Get organization by ID
   */
  async getOrganizationById(id) {
    const organization = await Organization.findById(id).lean();
    if (!organization) {
      throw new OrganizationNotFoundError();
    }

    return {
      ...organization,
      metrics: {
        totalStorageGb: Math.floor(Math.random() * 1000),
        storageQuotaGb: 2000,
        dataProcessedTbLast30d: 4.2,
        activePipelines: Math.floor(Math.random() * 20),
        activeConnectors: Math.floor(Math.random() * 10),
      }
    };
  }

  /**
   * Create new organization
   */
  async createOrganization(data) {
    const baseCode = (data.name || 'NEW-ORG').substring(0, 3).toUpperCase();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const generatedCode = data.code || `${baseCode}-${randomSuffix}`;

    let generatedSlug = data.slug;
    if (!generatedSlug && data.name) {
      generatedSlug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    }

    if (generatedSlug) {
      const existingOpt = await Organization.findOne({ slug: generatedSlug });
      if (existingOpt) {
        throw new ConflictError('An organization with a similar name or slug already exists');
      }
    }

    const organization = new Organization({
      ...data,
      code: generatedCode,
      slug: generatedSlug,
    });

    await organization.save();

    await this.logActivity(organization.id, 'Organization Created', 'System', {
      type: 'System',
      name: 'System Provisioning'
    });

    return organization.toJSON();
  }

  /**
   * Update organization details
   */
  async updateOrganization(id, updates) {
    const organization = await Organization.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!organization) {
      throw new OrganizationNotFoundError();
    }

    await this.logActivity(id, 'Organization details updated', 'System', {
      type: 'System',
      name: 'System Admin'
    });

    return organization.toJSON();
  }

  /**
   * Get organization settings
   */
  async getOrganizationSettings(id) {
    const organization = await Organization.findById(id).select('settings').lean();
    if (!organization) {
      throw new OrganizationNotFoundError();
    }
    return organization.settings;
  }

  /**
   * Update organization settings
   */
  async updateOrganizationSettings(id, settingsChanges) {
    const updateObj = {};
    for (const [section, values] of Object.entries(settingsChanges)) {
      if (typeof values === 'object' && values !== null) {
        for (const [key, value] of Object.entries(values)) {
          updateObj[`settings.${section}.${key}`] = value;
        }
      }
    }

    const organization = await Organization.findByIdAndUpdate(
      id,
      { $set: updateObj },
      { new: true }
    );

    if (!organization) {
      throw new OrganizationNotFoundError();
    }

    await this.logActivity(id, 'Organization settings updated', 'Security Policy', {
      type: 'System',
      name: 'System Admin'
    });

    return { id: organization.id, savedAt: new Date().toISOString() };
  }

  /**
   * Log an activity for the organization
   */
  async logActivity(organizationId, title, category, actor) {
    try {
      const eventId = `EVT-${Math.floor(1000 + Math.random() * 9000)}`;
      await OrganizationActivity.create({
        organizationId,
        eventId,
        title,
        category,
        actor,
        resource: { type: 'Organization', name: 'Self' },
        result: 'Success',
        severity: 'Info',
        timestamp: new Date()
      });
    } catch (e) {
      console.error('Failed to log organization activity:', e);
    }
  }
}

exports.organizationService = new OrganizationService();
