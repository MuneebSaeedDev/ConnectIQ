const { Team } = require('../../models/organizations/team.model');
const { TeamNotFoundError } = require('../../utils/errors');

class TeamService {
  async getTeams(orgId, filters = {}) {
    const query = { organizationId: orgId };

    if (filters.status && filters.status !== 'All statuses') {
      query.status = filters.status;
    }
    if (filters.department && filters.department !== 'All departments') {
      query.departmentCode = filters.department;
    }
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { slug: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const teams = await Team.find(query).sort({ createdAt: -1 }).lean();

    return {
      items: teams,
      total: teams.length,
      kpis: {
        total: await Team.countDocuments({ organizationId: orgId }),
        active: await Team.countDocuments({ organizationId: orgId, status: 'Active' }),
        attention: await Team.countDocuments({ organizationId: orgId, requiresAttention: true }),
      }
    };
  }

  async getTeamById(orgId, teamId) {
    const team = await Team.findOne({ _id: teamId, organizationId: orgId }).lean();
    if (!team) {
      throw new TeamNotFoundError();
    }
    return team;
  }

  async createTeam(orgId, data) {
    let slug = data.slug;
    if (!slug && data.name) {
      slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    }

    const team = new Team({
      ...data,
      slug,
      organizationId: orgId,
    });
    await team.save();
    return team.toJSON();
  }

  async updateTeam(orgId, teamId, updates) {
    const team = await Team.findOneAndUpdate(
      { _id: teamId, organizationId: orgId },
      { $set: updates },
      { new: true }
    );
    if (!team) {
      throw new TeamNotFoundError();
    }
    return team.toJSON();
  }
}

module.exports = {
  TeamService,
  teamService: new TeamService(),
};
