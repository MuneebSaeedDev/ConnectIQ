/**
 * Data for the Data Quality Dashboard Screen (SCR-016, node 50:4167).
 *
 * MOCK BOUNDARY: MOD-009 (Analytics & Monitoring Dashboards) is still
 * `PLANNED` with no backend deployed. `getDataQuality` always attempts
 * a real request first and only falls back to the mock snapshot below
 * when the endpoint is unreachable, mirroring
 * pipelineOverview.api.js's/executiveDashboard.api.js's dev-proxy-aware
 * mock-fallback shape (including the SCR-014-discovered content-type
 * check against the Vite dev server's own HTML fallback).
 *
 * The mock KPI/chart/table values reproduce the literal numbers shown
 * in the Figma design (node 50:4167).
 *
 * KNOWN LIMITATION: the mock snapshot below is a single fixed dataset
 * and ignores the `dateRange` param (Today/7d/30d) — same documented
 * limitation as pipelineOverview.api.js's dateRange handling. A real
 * MOD-009 endpoint would aggregate per range.
 */

import { apiFetch, readJson } from '../../../services/api/client';

export class DataQualityError extends Error {}

const MOCK_DATA_QUALITY = {
  updatedAt: '1m ago',
  kpis: [
    { key: 'quality-score', label: 'Overall Quality Score', value: '96.8', suffix: '%', tone: 'success', trend: '↑ 0.3% vs last week', trendTone: 'up', footer: 'Across 94 monitored datasets', icon: 'circle-check' },
    { key: 'healthy-datasets', label: 'Healthy Datasets', value: '82', tone: 'success', trend: '↑ 3 vs yesterday', trendTone: 'up', footer: 'Out of 94 total datasets', icon: 'database' },
    { key: 'failed-validations', label: 'Failed Validations', value: '17', tone: 'danger', trend: '↑ 4 vs yesterday', trendTone: 'down', footer: '3 critical · 14 warning', icon: 'alert-circle' },
    { key: 'active-rules', label: 'Active Quality Rules', value: '98', tone: 'default', trend: '↑ 6 new this week', trendTone: 'up', footer: 'Across 12 rule categories', icon: 'check-square' },
    { key: 'pass-rate', label: 'Rule Pass Rate', value: '98.2', suffix: '%', tone: 'success', trend: '↑ 0.4% vs yesterday', trendTone: 'up', footer: '1,284 passed · 23 failed', icon: 'bar-chart2' },
    { key: 'freshness-sla', label: 'Freshness SLA', value: '97.9', suffix: '%', tone: 'default', trend: '= Stable', trendTone: 'flat', footer: '2 datasets delayed', icon: 'clock' },
    { key: 'schema-compliance', label: 'Schema Compliance', value: '99.3', suffix: '%', tone: 'success', trend: '↑ 0.2% this week', trendTone: 'up', footer: '1 schema mismatch active', icon: 'layers' },
    { key: 'critical-incidents', label: 'Critical Incidents', value: '3', tone: 'danger', trend: '↑ 1 vs yesterday', trendTone: 'down', footer: 'Require immediate action', icon: 'zap' },
  ],
  qualityScoreTrend: {
    subtitle: '30-day overall platform data quality',
    series: [96.1, 96.2, 96.0, 96.3, 96.5, 96.4, 96.6, 96.8, 97.0, 96.9, 97.1, 97.3, 97.6, 97.4, 97.2, 97.0, 96.8, 96.6, 96.4, 96.2, 96.0, 95.9, 96.1, 96.3, 96.5, 96.7, 96.9, 97.0, 96.9, 96.8],
    stats: { avg30d: '96.8%', peak: '97.6%', lowest: '95.9%', trend: 'Improving' },
  },
  qualityAlerts: [
    { id: 'qa1', title: 'Customer IDs duplicated in Orders dataset', description: 'orders_prod · 3,214 duplicate records detected', severity: 'critical' },
    { id: 'qa2', title: 'Null primary keys in Transactions table', description: 'transactions_prod · 148 records missing transaction_id', severity: 'critical' },
    { id: 'qa3', title: 'Inventory Sync freshness SLA breached', description: 'inventory_prod · Last load 3h 18m ago, SLA is 1h', severity: 'critical' },
    { id: 'qa4', title: 'Email format validation failing 8.2%', description: 'contacts_prod · 1,842 invalid email formats', severity: 'warning' },
    { id: 'qa5', title: 'Product prices below $0 detected', description: 'products_prod · 12 records with negative amounts', severity: 'warning' },
    { id: 'qa6', title: 'Schema change detected in Salesforce connector', description: 'contacts_prod · 3 new columns added, 1 renamed', severity: 'info' },
  ],
  validationResults: {
    subtitle: 'Daily pass / warn / fail — last 30 days',
    series: Array.from({ length: 30 }, (_, i) => ({
      day: `D${i + 1}`,
      passed: 118 + Math.round(Math.sin(i / 3) * 8),
      warning: 3 + (i % 4),
      failed: i % 7 === 0 ? 4 : 1,
    })),
    stats: { total30d: '3,854', passed: '3,688', warning: '101', failed: '65' },
  },
  datasetHealth: {
    subtitle: '94 monitored datasets',
    breakdown: [
      { key: 'healthy', label: 'Healthy', count: 82, percent: 87 },
      { key: 'warning', label: 'Warning', count: 8, percent: 9 },
      { key: 'failed', label: 'Failed', count: 3, percent: 3 },
      { key: 'stale', label: 'Stale/Late', count: 1, percent: 1 },
    ],
    topIssues: [
      { key: 'duplicate', label: 'Duplicate Records', count: '3,214' },
      { key: 'null-key', label: 'Null Key Violations', count: '148' },
      { key: 'format', label: 'Format Failures', count: '1,842' },
      { key: 'range', label: 'Range Violations', count: '312' },
      { key: 'schema', label: 'Schema Mismatches', count: '4' },
    ],
  },
  ruleViolations: [
    { id: 'rv1', rule: 'No Duplicate IDs', dataset: 'orders_prod', severity: 'critical', count: '3,214', status: 'Open' },
    { id: 'rv2', rule: 'Primary Key Not Null', dataset: 'transactions_prod', severity: 'critical', count: '148', status: 'Open' },
    { id: 'rv3', rule: 'Valid Email Format', dataset: 'contacts_prod', severity: 'warning', count: '1,842', status: 'Open' },
    { id: 'rv4', rule: 'Amount > 0', dataset: 'products_prod', severity: 'warning', count: '12', status: 'Open' },
    { id: 'rv5', rule: 'Required Fields', dataset: 'orders_prod', severity: 'warning', count: '34', status: 'Open' },
    { id: 'rv6', rule: 'Referential Integrity', dataset: 'orders_prod', severity: 'warning', count: '8', status: 'Ack' },
    { id: 'rv7', rule: 'Date Range Valid', dataset: 'events_prod', severity: 'info', count: '2', status: 'Ack' },
  ],
  freshnessSla: [
    { id: 'fs1', dataset: 'orders_prod', lastLoad: '2m ago', sla: '30m', delay: '—', status: 'On Time' },
    { id: 'fs2', dataset: 'customers_prod', lastLoad: '8m ago', sla: '1h', delay: '—', status: 'On Time' },
    { id: 'fs3', dataset: 'inventory_prod', lastLoad: '3h 18m ago', sla: '1h', delay: '+2h 18m', status: 'Delayed' },
    { id: 'fs4', dataset: 'transactions_prod', lastLoad: '14m ago', sla: '1h', delay: '—', status: 'On Time' },
    { id: 'fs5', dataset: 'products_prod', lastLoad: '22m ago', sla: '6h', delay: '—', status: 'On Time' },
    { id: 'fs6', dataset: 'events_prod', lastLoad: '4m ago', sla: '15m', delay: '—', status: 'On Time' },
    { id: 'fs7', dataset: 'campaigns_prod', lastLoad: '4h 44m ago', sla: '2h', delay: '+2h 44m', status: 'Delayed' },
  ],
  schemaChanges: [
    { id: 'sc1', dataset: 'contacts_prod', pipeline: 'Salesforce Sync', changeType: 'New Columns', details: '3 new fields added', impact: 'Low', detected: '2h ago', status: 'Ack' },
    { id: 'sc2', dataset: 'orders_prod', pipeline: 'Shopify → BigQuery', changeType: 'Column Renamed', details: 'order_ref → order_code', impact: 'High', detected: '6h ago', status: 'Open' },
    { id: 'sc3', dataset: 'transactions_prod', pipeline: 'Stripe ETL', changeType: 'Type Changed', details: 'amount: int → decimal', impact: 'Medium', detected: '1d ago', status: 'Ack' },
    { id: 'sc4', dataset: 'inventory_prod', pipeline: 'Warehouse API Sync', changeType: 'Column Removed', details: 'legacy_sku removed', impact: 'Low', detected: '2d ago', status: 'Resolved' },
    { id: 'sc5', dataset: 'products_prod', pipeline: 'PIM → Elasticsearch', changeType: 'New Columns', details: '2 metadata fields', impact: 'Low', detected: '3d ago', status: 'Resolved' },
  ],
  failedValidations: {
    subtitle: '17 open issues · sorted by severity',
    statusFilters: [
      { key: 'all', label: 'All', count: 17 },
      { key: 'critical', label: 'Critical', count: 3 },
      { key: 'warning', label: 'Warning', count: 11 },
      { key: 'info', label: 'Info', count: 3 },
    ],
    rows: [
      { id: 'fv1', dataset: 'orders_prod', pipeline: 'Shopify → BigQuery', rule: 'No Duplicate IDs', severity: 'critical', failures: 3214, ownerInitials: 'RC', owner: 'R. Chen', lastRun: '15m ago', env: 'prod' },
      { id: 'fv2', dataset: 'transactions_prod', pipeline: 'Stripe ETL', rule: 'Primary Key Not Null', severity: 'critical', failures: 148, ownerInitials: 'AC', owner: 'A. Chen', lastRun: '22m ago', env: 'prod' },
      { id: 'fv3', dataset: 'inventory_prod', pipeline: 'Warehouse API', rule: 'Freshness SLA', severity: 'critical', failures: 1, ownerInitials: 'MT', owner: 'M. Torres', lastRun: '3h ago', env: 'prod' },
      { id: 'fv4', dataset: 'contacts_prod', pipeline: 'Salesforce Sync', rule: 'Valid Email Format', severity: 'warning', failures: 1842, ownerInitials: 'JP', owner: 'J. Park', lastRun: '8m ago', env: 'prod' },
      { id: 'fv5', dataset: 'products_prod', pipeline: 'PIM Sync', rule: 'Amount > 0', severity: 'warning', failures: 12, ownerInitials: 'KL', owner: 'K. Lee', lastRun: '18m ago', env: 'prod' },
      { id: 'fv6', dataset: 'orders_prod', pipeline: 'Shopify → BigQuery', rule: 'Required Fields', severity: 'warning', failures: 34, ownerInitials: 'RC', owner: 'R. Chen', lastRun: '25m ago', env: 'prod' },
      { id: 'fv7', dataset: 'orders_prod', pipeline: 'Shopify → BigQuery', rule: 'Referential Integrity', severity: 'warning', failures: 8, ownerInitials: 'RC', owner: 'R. Chen', lastRun: '31m ago', env: 'prod' },
      { id: 'fv8', dataset: 'customers_prod', pipeline: 'Salesforce Sync', rule: 'Phone Format Valid', severity: 'warning', failures: 6, ownerInitials: 'JP', owner: 'J. Park', lastRun: '8m ago', env: 'prod' },
      { id: 'fv9', dataset: 'campaigns_prod', pipeline: 'Mailchimp Sync', rule: 'Freshness SLA', severity: 'warning', failures: 1, ownerInitials: 'MT', owner: 'M. Torres', lastRun: '4h ago', env: 'prod' },
      { id: 'fv10', dataset: 'events_prod', pipeline: 'Segment → Redshift', rule: 'Date Range Valid', severity: 'info', failures: 2, ownerInitials: 'JP', owner: 'J. Park', lastRun: '4m ago', env: 'prod' },
      { id: 'fv11', dataset: 'customers_prod', pipeline: 'Salesforce Sync', rule: 'Phone Format Valid', severity: 'info', failures: 6, ownerInitials: 'JP', owner: 'J. Park', lastRun: '8m ago', env: 'prod' },
      { id: 'fv12', dataset: 'products_prod', pipeline: 'PIM Sync', rule: 'SKU Format Valid', severity: 'info', failures: 3, ownerInitials: 'KL', owner: 'K. Lee', lastRun: '18m ago', env: 'prod' },
      { id: 'fv13', dataset: 'contacts_prod', pipeline: 'Salesforce Sync', rule: 'Duplicate Contact Check', severity: 'warning', failures: 21, ownerInitials: 'JP', owner: 'J. Park', lastRun: '8m ago', env: 'prod' },
      { id: 'fv14', dataset: 'inventory_prod', pipeline: 'Warehouse API', rule: 'Stock Non-Negative', severity: 'warning', failures: 4, ownerInitials: 'MT', owner: 'M. Torres', lastRun: '3h ago', env: 'staging' },
      { id: 'fv15', dataset: 'transactions_prod', pipeline: 'Stripe ETL', rule: 'Currency Code Valid', severity: 'warning', failures: 2, ownerInitials: 'AC', owner: 'A. Chen', lastRun: '22m ago', env: 'prod' },
      { id: 'fv16', dataset: 'orders_prod', pipeline: 'Shopify → BigQuery', rule: 'Order Total Matches Lines', severity: 'warning', failures: 9, ownerInitials: 'RC', owner: 'R. Chen', lastRun: '15m ago', env: 'prod' },
      { id: 'fv17', dataset: 'campaigns_prod', pipeline: 'Mailchimp Sync', rule: 'Unsubscribed Suppression', severity: 'critical', failures: 57, ownerInitials: 'MT', owner: 'M. Torres', lastRun: '4h ago', env: 'prod' },
    ],
    totalCount: 17,
  },
};

export async function getDataQuality(dateRange) {
  try {
    const query = dateRange ? `?range=${encodeURIComponent(dateRange)}` : '';
    const res = await apiFetch(`/dashboard/data-quality${query}`);
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new DataQualityError('Unable to load the data quality dashboard right now.');
    }
    const data = await readJson(res);
    if (!data) {
      throw new DataQualityError('Received an unexpected response from the server.');
    }
    return { ...data, mocked: false };
  } catch {
    return { ...MOCK_DATA_QUALITY, mocked: true };
  }
}
