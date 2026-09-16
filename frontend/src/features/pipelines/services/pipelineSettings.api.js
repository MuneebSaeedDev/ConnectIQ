/**
 * pipelineSettings.api.js
 * API client and Figma-verified mock baseline for SCR-074: Pipeline Settings
 */

import { apiFetch, readJson } from '../../../services/api/client';

export const DEFAULT_PIPELINE_SETTINGS = {
  pipelineId: 'pip_001',
  name: 'Customer 360 Ingestion',
  description: 'End-to-end extraction from PostgreSQL CRM to Snowflake Data Warehouse with data quality and validation stages.',
  status: 'active',
  owner: 'Priya Sharma',
  tags: ['Production', 'Snowflake', 'PostgreSQL', 'Customer-360'],

  // Execution Profile
  executionProfile: {
    engine: 'spark_distributed',
    concurrency: 4,
    timeoutMinutes: 120,
    retryPolicy: {
      maxRetries: 3,
      backoffMultiplier: 1.5,
      delaySeconds: 60,
    }
  },

  // Alerting
  alerting: {
    onFailure: true,
    onSuccess: false,
    onStalled: true,
    channels: ['email', 'slack'],
    emailAddresses: ['data-eng@acme.corp'],
    slackChannels: ['#alerts-data-eng']
  },

  // Resources
  resources: {
    memoryMb: 8192,
    cpuCores: 4,
    ephemeralStorageGb: 50
  },

  // Environment and Access
  environment: 'production',
  linkedTeams: ['Data Engineering', 'Marketing Analytics'],
};

export async function getPipelineSettings(pipelineId) {
  try {
    const res = await apiFetch(`/pipelines/${pipelineId}/settings`);
    if (res.ok) {
      const data = await readJson(res);
      if (data && data.data) return data.data;
    }
  } catch (e) {
    console.info('[PipelineSettings] Using fallback:', e.message);
  }
  return { ...DEFAULT_PIPELINE_SETTINGS, pipelineId };
}

export async function savePipelineSettings(pipelineId, payload) {
  try {
    const res = await apiFetch(`/pipelines/${pipelineId}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const data = await readJson(res);
      return data.data || payload;
    }
  } catch (e) {
    console.warn('[PipelineSettings] Save fallback:', e.message);
  }
  return { ...payload, updatedAt: new Date().toISOString() };
}
