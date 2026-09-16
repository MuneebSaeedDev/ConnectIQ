/**
 * Settings and Account management API client.
 * Supports all Account Settings sub-screens:
 * - Profile
 * - Preferences
 * - Notifications
 * - Change Password
 * - Two-Factor Authentication
 * - Active Sessions
 * - Team Members
 * - Integrations
 * - API Keys
 * - Audit Logs
 */

import { apiFetch, readJson } from '../../../services/api/client';

const MOCK_INCORRECT_CURRENT_PASSWORD = 'wrong-password';

export class ChangePasswordError extends Error {
  constructor(message, field) {
    super(message);
    this.field = field ?? null;
  }
}

// ── Profile ──
export async function getProfile() {
  try {
    const res = await apiFetch('/me/profile');
    if (res.ok) {
      const body = await readJson(res);
      if (body?.data) return { data: body.data, mocked: false };
    }
  } catch {
    // fallback
  }
  return {
    data: {
      firstName: 'Marcus',
      lastName: 'Chen',
      displayName: 'Marcus Chen',
      email: 'marcus.chen@acmecorp.com',
      phone: '+1 (555) 234-5678',
      jobTitle: 'Senior Data Engineer',
      officeLocation: 'San Francisco (HQ)',
      pronouns: 'he/him',
      avatarUrl: '',
      organization: 'Acme Corporation',
      department: 'Data Engineering',
      team: 'Pipeline Core',
      role: 'Engineer',
    },
    mocked: true,
  };
}

export async function updateProfile(payload) {
  try {
    const res = await apiFetch('/me/profile', { method: 'PUT', body: payload });
    if (res.ok) {
      const body = await readJson(res);
      return { data: body.data, mocked: false };
    }
  } catch {
    // fallback
  }
  return { data: payload, mocked: true };
}

// ── Preferences ──
export async function getPreferences() {
  try {
    const res = await apiFetch('/me/preferences');
    if (res.ok) {
      const body = await readJson(res);
      if (body?.data) return { data: body.data, mocked: false };
    }
  } catch {
    // fallback
  }
  return {
    data: {
      language: 'English (US)',
      timezone: 'UTC-8 (Pacific Time)',
      dateFormat: 'YYYY-MM-DD',
      timeFormat: '12-hour (AM/PM)',
      numberFormat: '1,234.56 (US)',
      theme: 'System Default',
      defaultLandingPage: 'Pipelines Dashboard',
    },
    mocked: true,
  };
}

export async function updatePreferences(payload) {
  try {
    const res = await apiFetch('/me/preferences', { method: 'PUT', body: payload });
    if (res.ok) {
      const body = await readJson(res);
      return { data: body.data, mocked: false };
    }
  } catch {
    // fallback
  }
  return { data: payload, mocked: true };
}

// ── Notifications ──
export async function getNotificationPreferences() {
  try {
    const res = await apiFetch('/me/notifications');
    if (res.ok) {
      const body = await readJson(res);
      if (body?.data) return { data: body.data, mocked: false };
    }
  } catch {
    // fallback
  }
  return {
    data: {
      email: {
        pipelineFailures: true,
        connectorAlerts: true,
        securityAlerts: true,
        weeklyDigest: false,
        marketingUpdates: false,
      },
      inApp: {
        realTimeExecutions: true,
        taskAssignments: true,
        systemAnnouncements: true,
        teamActivity: true,
      },
    },
    mocked: true,
  };
}

export async function updateNotificationPreferences(payload) {
  try {
    const res = await apiFetch('/me/notifications', { method: 'PUT', body: payload });
    if (res.ok) {
      const body = await readJson(res);
      return { data: body.data, mocked: false };
    }
  } catch {
    // fallback
  }
  return { data: payload, mocked: true };
}

// ── Change Password ──
export async function changePassword({ currentPassword, newPassword }) {
  try {
    const res = await apiFetch('/auth/change-password', { method: 'POST', body: { currentPassword, newPassword } });

    if (res.status === 401 || res.status === 400) {
      const body = await readJson(res);
      throw new ChangePasswordError(
        body?.message ?? 'Current password is incorrect.',
        body?.field ?? 'currentPassword'
      );
    }
    if (!res.ok) {
      throw new ChangePasswordError('Unable to change your password right now. Please try again.');
    }

    return { mocked: false };
  } catch (err) {
    if (err instanceof ChangePasswordError) throw err;

    if (currentPassword === MOCK_INCORRECT_CURRENT_PASSWORD) {
      throw new ChangePasswordError('Current password is incorrect.', 'currentPassword');
    }
    return { mocked: true };
  }
}

// ── Two-Factor Auth ──
export async function getTwoFactorStatus() {
  try {
    const res = await apiFetch('/me/2fa');
    if (res.ok) {
      const body = await readJson(res);
      if (body?.data) return { data: body.data, mocked: false };
    }
  } catch {
    // fallback
  }
  return { data: { enabled: true }, mocked: true };
}

export async function toggleTwoFactor(enable) {
  try {
    const res = await apiFetch('/me/2fa', { method: 'POST', body: { enable } });
    if (res.ok) {
      const body = await readJson(res);
      return { data: body.data, mocked: false };
    }
  } catch {
    // fallback
  }
  return { data: { enabled: enable }, mocked: true };
}

// ── Active Sessions ──
export async function getSessions() {
  try {
    const res = await apiFetch('/me/sessions');
    if (res.ok) {
      const body = await readJson(res);
      if (body?.data) return { data: body.data, mocked: false };
    }
  } catch {
    // fallback
  }
  return {
    data: [
      {
        id: 'sess_1',
        device: 'MacBook Pro 16"',
        browser: 'Chrome 122.0',
        os: 'macOS Sonoma',
        ip: '192.168.1.145',
        location: 'San Francisco, US',
        current: true,
        loginTime: 'Active now',
        status: 'Active',
      },
      {
        id: 'sess_2',
        device: 'iPhone 15 Pro',
        browser: 'Mobile Safari 17.2',
        os: 'iOS 17.4',
        ip: '172.56.21.89',
        location: 'San Francisco, US',
        current: false,
        loginTime: '2 hours ago',
        status: 'Active',
      },
      {
        id: 'sess_3',
        device: 'Workstation ThinkPad',
        browser: 'Firefox 123.0',
        os: 'Ubuntu 22.04',
        ip: '10.0.4.12',
        location: 'San Jose, US',
        current: false,
        loginTime: '3 days ago',
        status: 'Active',
      },
    ],
    mocked: true,
  };
}

export async function terminateSession(sessionId) {
  try {
    const res = await apiFetch(`/me/sessions/${sessionId}`, { method: 'DELETE' });
    if (res.ok) return { mocked: false };
  } catch {
    // fallback
  }
  return { mocked: true };
}

export async function terminateAllOtherSessions() {
  try {
    const res = await apiFetch('/me/sessions/terminate-all', { method: 'POST', body: { currentSessionId: 'sess_1' } });
    if (res.ok) return { mocked: false };
  } catch {
    // fallback
  }
  return { mocked: true };
}

// ── Team Members ──
export async function getTeamMembers() {
  try {
    const res = await apiFetch('/me/team-members');
    if (res.ok) {
      const body = await readJson(res);
      if (body?.data) return { data: body.data, mocked: false };
    }
  } catch {
    // fallback
  }
  return {
    data: [
      {
        id: 'usr_1',
        name: 'Marcus Chen',
        email: 'marcus.chen@acmecorp.com',
        role: 'Senior Data Engineer',
        team: 'Pipeline Core',
        department: 'Data Engineering',
        status: 'Active',
        avatar: 'MC',
        isCurrent: true,
      },
      {
        id: 'usr_2',
        name: 'Sarah Jenkins',
        email: 'sarah.j@acmecorp.com',
        role: 'Lead Architect',
        team: 'Pipeline Core',
        department: 'Data Engineering',
        status: 'Active',
        avatar: 'SJ',
        isCurrent: false,
      },
      {
        id: 'usr_3',
        name: 'Alex Rivera',
        email: 'alex.r@acmecorp.com',
        role: 'Data Platform Engineer',
        team: 'Infrastructure',
        department: 'Data Engineering',
        status: 'Active',
        avatar: 'AR',
        isCurrent: false,
      },
      {
        id: 'usr_4',
        name: 'Elena Rostova',
        email: 'elena.r@acmecorp.com',
        role: 'Analytics Engineer',
        team: 'BI & Reporting',
        department: 'Analytics',
        status: 'Active',
        avatar: 'ER',
        isCurrent: false,
      },
    ],
    mocked: true,
  };
}

// ── Integrations ──
export async function getIntegrations() {
  try {
    const res = await apiFetch('/me/integrations');
    if (res.ok) {
      const body = await readJson(res);
      if (body?.data) return { data: body.data, mocked: false };
    }
  } catch {
    // fallback
  }
  return {
    data: [
      {
        id: 'int_slack',
        name: 'Slack',
        provider: 'slack',
        category: 'Communication',
        description: 'Send pipeline failure alerts and execution updates to Slack channels.',
        status: 'connected',
        icon: '💬',
        connectedAt: '2025-01-15',
      },
      {
        id: 'int_github',
        name: 'GitHub Actions',
        provider: 'github',
        category: 'CI/CD',
        description: 'Sync pipeline schema definitions and deployment triggers via Git workflows.',
        status: 'connected',
        icon: '🐙',
        connectedAt: '2025-02-01',
      },
      {
        id: 'int_datadog',
        name: 'Datadog',
        provider: 'datadog',
        category: 'Monitoring',
        description: 'Export metrics, health telemetry, and APM spans to Datadog dashboards.',
        status: 'disconnected',
        icon: '🐶',
        connectedAt: null,
      },
      {
        id: 'int_pagerduty',
        name: 'PagerDuty',
        provider: 'pagerduty',
        category: 'Alerting',
        description: 'Trigger incident escalations on high-severity pipeline and connector errors.',
        status: 'disconnected',
        icon: '🚨',
        connectedAt: null,
      },
    ],
    mocked: true,
  };
}

export async function toggleIntegration(id, connect) {
  try {
    const res = await apiFetch(`/me/integrations/${id}`, { method: 'PATCH', body: { connect } });
    if (res.ok) {
      const body = await readJson(res);
      return { data: body.data, mocked: false };
    }
  } catch {
    // fallback
  }
  return { data: { id, status: connect ? 'connected' : 'disconnected' }, mocked: true };
}

// ── API Keys ──
export async function getApiKeys() {
  try {
    const res = await apiFetch('/me/api-keys');
    if (res.ok) {
      const body = await readJson(res);
      if (body?.data) return { data: body.data, mocked: false };
    }
  } catch {
    // fallback
  }
  return {
    data: [
      {
        id: 'key_1',
        name: 'Production Ingestion Worker',
        prefix: 'ciq_live_9f83',
        scope: 'read-write',
        lastUsed: '10 minutes ago',
        expires: '2025-12-31',
        status: 'Active',
      },
      {
        id: 'key_2',
        name: 'Airflow Pipeline Orchestrator',
        prefix: 'ciq_live_4b21',
        scope: 'read-write',
        lastUsed: '1 hour ago',
        expires: '2025-09-30',
        status: 'Active',
      },
      {
        id: 'key_3',
        name: 'Analytics Read-Only Client',
        prefix: 'ciq_ro_12a7',
        scope: 'read',
        lastUsed: '3 days ago',
        expires: '2026-06-15',
        status: 'Active',
      },
    ],
    mocked: true,
  };
}

export async function createApiKey(payload) {
  try {
    const res = await apiFetch('/me/api-keys', { method: 'POST', body: payload });
    if (res.ok) {
      const body = await readJson(res);
      return { data: body.data, mocked: false };
    }
  } catch {
    // fallback
  }
  return {
    data: {
      id: `key_${Date.now()}`,
      name: payload.name,
      prefix: 'ciq_live_' + Math.random().toString(36).substring(2, 6),
      key: `ciq_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      scope: payload.scope || 'read',
      expires: payload.expiresAt || 'No expiration',
      status: 'Active',
      lastUsed: 'Never',
    },
    mocked: true,
  };
}

export async function revokeApiKey(keyId) {
  try {
    const res = await apiFetch(`/me/api-keys/${keyId}`, { method: 'DELETE' });
    if (res.ok) return { mocked: false };
  } catch {
    // fallback
  }
  return { mocked: true };
}

// ── Audit Logs ──
export async function getAuditLogs(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await apiFetch(`/me/audit-logs${query ? `?${query}` : ''}`);
    if (res.ok) {
      const body = await readJson(res);
      if (body?.data) return { data: body.data, mocked: false };
    }
  } catch {
    // fallback
  }
  return {
    data: {
      logs: [
        {
          id: 'log_1',
          action: 'Password Changed',
          category: 'auth',
          details: 'Account password updated successfully via web portal.',
          ip: '192.168.1.145',
          status: 'success',
          severity: 'medium',
          timestamp: '2025-05-10 14:22:10 UTC',
          actor: 'Marcus Chen',
        },
        {
          id: 'log_2',
          action: 'API Key Created',
          category: 'security',
          details: 'Created API key "Airflow Pipeline Orchestrator" with read-write scope.',
          ip: '192.168.1.145',
          status: 'success',
          severity: 'low',
          timestamp: '2025-05-08 09:15:32 UTC',
          actor: 'Marcus Chen',
        },
        {
          id: 'log_3',
          action: '2FA Verification Enabled',
          category: 'security',
          details: 'Two-factor authenticator app setup completed.',
          ip: '192.168.1.145',
          status: 'success',
          severity: 'medium',
          timestamp: '2025-05-01 11:40:05 UTC',
          actor: 'Marcus Chen',
        },
        {
          id: 'log_4',
          action: 'Integration Connected',
          category: 'settings',
          details: 'Connected Slack workspace for error notifications.',
          ip: '192.168.1.145',
          status: 'success',
          severity: 'low',
          timestamp: '2025-04-20 16:04:18 UTC',
          actor: 'Marcus Chen',
        },
        {
          id: 'log_5',
          action: 'Failed Sign-in Attempt',
          category: 'auth',
          details: 'Failed sign-in attempt from unfamiliar IP address.',
          ip: '45.134.22.10',
          status: 'failed',
          severity: 'high',
          timestamp: '2025-04-12 03:22:45 UTC',
          actor: 'Unknown',
        },
      ],
      total: 5,
    },
    mocked: true,
  };
}
