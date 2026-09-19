import { apiFetch, readJson } from '../../../services/api/client';

export const MOCK_LOOKUP_TABLES = [
  {
    _id: 'lt-01',
    name: 'Country Codes',
    description: 'Maps ISO country codes to standardized country information and geographic regions.',
    type: 'Key/Value',
    keyField: 'code',
    returnFields: ['country', 'region'],
    records: 249,
    dataSource: 'Internal Managed',
    pipelinesCount: 14,
    status: 'Active',
    lastUpdated: '2026-09-18T10:30:00Z',
    updatedBy: 'Admin User'
  },
  {
    _id: 'lt-02',
    name: 'Product Categories',
    description: 'Maps legacy catalog product IDs to new master taxonomy category hierarchy.',
    type: 'Multi-Column',
    keyField: 'legacy_id',
    returnFields: ['category', 'sub-category', 'department'],
    records: 1250,
    dataSource: 'Database (MySQL)',
    pipelinesCount: 8,
    status: 'Active',
    lastUpdated: '2026-09-15T14:20:00Z',
    updatedBy: 'Data Engineer'
  },
  {
    _id: 'lt-03',
    name: 'Customer Segments',
    description: 'Regional customer value scoring matrix and account tier categorization.',
    type: 'Composite Key',
    keyField: 'region + zip',
    returnFields: ['segment', 'manager'],
    records: 45000,
    dataSource: 'CSV Import',
    pipelinesCount: 2,
    status: 'Draft',
    lastUpdated: '2026-09-19T08:15:00Z',
    updatedBy: 'Data Analyst'
  },
  {
    _id: 'lt-04',
    name: 'Status Codes',
    description: 'Order status mappings for external logistics and warehouse delivery partners.',
    type: 'Key/Value',
    keyField: 'partner_status',
    returnFields: ['internal_status'],
    records: 42,
    dataSource: 'API',
    pipelinesCount: 0,
    status: 'Disabled',
    lastUpdated: '2026-08-20T11:00:00Z',
    updatedBy: 'System'
  },
  {
    _id: 'lt-05',
    name: 'Department Mapping',
    description: 'Human Resources internal department codes and organizational hierarchy.',
    type: 'Key/Value',
    keyField: 'dept_code',
    returnFields: ['dept_name', 'cost_center'],
    records: 118,
    dataSource: 'Internal Managed',
    pipelinesCount: 5,
    status: 'Active',
    lastUpdated: '2026-09-10T11:20:00Z',
    updatedBy: 'HR Systems'
  },
  {
    _id: 'lt-06',
    name: 'Currency Information',
    description: 'ISO 4217 currency code lookup with symbol, name, and minor units.',
    type: 'Multi-Column',
    keyField: 'currency_code',
    returnFields: ['currency_name', 'symbol', 'decimals'],
    records: 178,
    dataSource: 'API',
    pipelinesCount: 19,
    status: 'Active',
    lastUpdated: '2026-09-12T09:00:00Z',
    updatedBy: 'Finance Admin'
  }
];

let localTables = [...MOCK_LOOKUP_TABLES];

export const lookupTablesApi = {
  async getTables(params = {}) {
    try {
      const res = await apiFetch('/transformations/lookup-tables');
      if (res.ok) {
        const json = await readJson(res);
        if (json?.data || json?.tables) {
          return json.data || json;
        }
      }
    } catch (_e) {
      // Backend unavailable or 401 unauthorized in demo mode
    }

    // Local client-side search/filter/paginate fallback
    let list = [...localTables];

    if (params.search) {
      const s = params.search.toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(s) ||
          t.description?.toLowerCase().includes(s) ||
          t.keyField?.toLowerCase().includes(s)
      );
    }

    if (params.type && params.type !== 'All' && params.type !== 'All Types') {
      list = list.filter((t) => t.type === params.type);
    }

    if (params.status && params.status !== 'All' && params.status !== 'All Statuses') {
      list = list.filter((t) => t.status === params.status);
    }

    if (params.source && params.source !== 'All' && params.source !== 'All Sources') {
      list = list.filter((t) => t.dataSource?.toLowerCase().includes(params.source.toLowerCase()));
    }

    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const total = list.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const paginated = list.slice((page - 1) * limit, page * limit);

    return {
      tables: paginated,
      pagination: { total, page, limit, totalPages },
      stats: {
        total: localTables.length,
        active: localTables.filter((t) => t.status === 'Active').length,
        draft: localTables.filter((t) => t.status === 'Draft').length,
        disabled: localTables.filter((t) => t.status === 'Disabled').length,
        usedInPipelines: localTables.filter((t) => (t.pipelinesCount || 0) > 0).length,
      },
    };
  },

  async getTableById(id) {
    try {
      const res = await apiFetch(`/transformations/lookup-tables/${id}`);
      if (res.ok) {
        const json = await readJson(res);
        return json?.data?.table || json?.table || json;
      }
    } catch (_e) {}

    return localTables.find((t) => t._id === id || t.id === id) || null;
  },

  async createTable(payload) {
    try {
      const res = await apiFetch('/transformations/lookup-tables', {
        method: 'POST',
        body: payload,
      });
      if (res.ok) {
        const json = await readJson(res);
        return json?.data?.table || json?.table || json;
      }
    } catch (_e) {}

    const newTable = {
      _id: `lt-${Date.now()}`,
      ...payload,
      records: payload.records || 0,
      pipelinesCount: 0,
      lastUpdated: new Date().toISOString(),
      updatedBy: 'Admin User',
    };
    localTables = [newTable, ...localTables];
    return newTable;
  },

  async updateTable(id, payload) {
    try {
      const res = await apiFetch(`/transformations/lookup-tables/${id}`, {
        method: 'PUT',
        body: payload,
      });
      if (res.ok) {
        const json = await readJson(res);
        return json?.data?.table || json?.table || json;
      }
    } catch (_e) {}

    localTables = localTables.map((t) =>
      t._id === id || t.id === id ? { ...t, ...payload, lastUpdated: new Date().toISOString() } : t
    );
    return localTables.find((t) => t._id === id || t.id === id);
  },

  async deleteTable(id) {
    try {
      const res = await apiFetch(`/transformations/lookup-tables/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) return true;
    } catch (_e) {}

    localTables = localTables.filter((t) => t._id !== id && t.id !== id);
    return true;
  },

  async toggleStatus(id) {
    try {
      const res = await apiFetch(`/transformations/lookup-tables/${id}/toggle`, {
        method: 'PATCH',
      });
      if (res.ok) {
        const json = await readJson(res);
        return json?.data?.table || json?.table || json;
      }
    } catch (_e) {}

    localTables = localTables.map((t) => {
      if (t._id === id || t.id === id) {
        return { ...t, status: t.status === 'Active' ? 'Disabled' : 'Active' };
      }
      return t;
    });
    return localTables.find((t) => t._id === id || t.id === id);
  },

  async testLookup(payload) {
    try {
      const res = await apiFetch('/transformations/lookup-tables/test', {
        method: 'POST',
        body: payload,
      });
      if (res.ok) {
        return await readJson(res);
      }
    } catch (_e) {}

    return {
      success: true,
      testResults: [
        {
          input: payload.testKey,
          match: `Match for: ${payload.testKey}`,
          returnedValue: 'Verified Sample Return',
          result: 'Found',
        },
      ],
    };
  },
};
