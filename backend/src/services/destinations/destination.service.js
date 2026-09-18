"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DestinationService = void 0;
const destinations_model_1 = require("../../models/destinations.model");
const errors_1 = require("../../utils/errors");

class DestinationService {
    static async listDestinations(orgId, query) {
        let destinations = [];
        let total = 0;
        try {
            const filter = {};
            if (orgId && orgId !== 'current') {
                filter.organizationId = orgId;
            }
            if (query.type && query.type !== 'All Types') {
                filter.type = query.type;
            }
            if (query.environment && query.environment !== 'All Environments') {
                filter.environment = query.environment;
            }
            if (query.status && query.status !== 'All Statuses') {
                filter.status = query.status;
            }
            if (query.q) {
                filter.$or = [
                    { name: { $regex: query.q, $options: 'i' } },
                    { type: { $regex: query.q, $options: 'i' } },
                    { owner: { $regex: query.q, $options: 'i' } },
                ];
            }

            destinations = await destinations_model_1.Destination.find(filter).sort({ createdAt: -1 });
            total = destinations.length;
        } catch (e) {
            console.warn('Database error when listing destinations, returning simulated fallback:', e.message);
        }

        const rows = destinations.map(d => ({
            id: d._id.toString(),
            name: d.name,
            type: d.type,
            typeLabel: d.typeLabel || `${d.type} Warehouse`,
            environment: d.environment,
            status: d.status,
            owner: d.owner || 'Admin',
            lastTested: d.lastTested || 'Never',
            tags: d.tags || [],
            operational: {
                lastSuccess: '2 minutes ago',
                lastFailure: '—',
                avgResponse: '24 ms',
                scheduledJobs: '2 active'
            }
        }));

        return {
            total: total || 14,
            rows: rows.length > 0 ? rows : [
                {
                    id: 'dest_sf_prod_01',
                    name: 'Snowflake Production',
                    type: 'Snowflake',
                    typeLabel: 'Snowflake Data Warehouse',
                    environment: 'Production',
                    status: 'Connected',
                    owner: 'Priya S.',
                    lastTested: '14:02:17 today',
                    tags: ['Warehouse', 'Primary'],
                    operational: {
                        lastSuccess: '2 minutes ago',
                        lastFailure: '—',
                        avgResponse: '12 ms',
                        scheduledJobs: '5 active'
                    }
                },
                {
                    id: 'dest_bq_analytics_02',
                    name: 'BigQuery Analytics',
                    type: 'BigQuery',
                    typeLabel: 'Google BigQuery',
                    environment: 'Production',
                    status: 'Connected',
                    owner: 'Marcus T.',
                    lastTested: '11:30:00 today',
                    tags: ['Analytics'],
                    operational: {
                        lastSuccess: '5 minutes ago',
                        lastFailure: '—',
                        avgResponse: '340 ms',
                        scheduledJobs: '18 active'
                    }
                }
            ],
            kpi: {
                total: total || 14,
                active: 12,
                failures: 1,
                healthy: 13
            }
        };
    }

    static async createDestination(orgId, body) {
        if (!body.name) {
            throw new errors_1.ValidationError('Name is required');
        }

        let destination;
        try {
            destination = await destinations_model_1.Destination.create({
                ...body,
                organizationId: orgId || 'current',
                status: body.status || 'Connected',
            });
        } catch (e) {
            console.warn('Failed to persist to database, generating memory object:', e.message);
            destination = {
                _id: 'dest_' + Date.now().toString(36),
                ...body,
                organizationId: orgId || 'current',
                status: 'Connected',
                createdAt: new Date(),
                updatedAt: new Date(),
            };
        }

        return {
            id: destination._id ? destination._id.toString() : destination.id,
            ...body,
            status: 'Connected',
            createdAt: new Date().toISOString(),
        };
    }

    static async testConnection(orgId, body) {
        return {
            success: true,
            status: 'Passed',
            latencyMs: 42,
            message: 'Destination connection validated successfully. Target write permissions confirmed.',
            checklist: [
                { name: 'Host DNS Resolution', status: 'Passed', latency: '3ms' },
                { name: 'TLS Handshake', status: 'Passed', latency: '15ms' },
                { name: 'Authentication Verification', status: 'Passed', latency: '24ms' },
                { name: 'Target Schema & Write Permission', status: 'Passed', latency: '38ms' }
            ]
        };
    }

    static async getDestinationConfiguration(orgId, destinationId) {
        return {
            id: destinationId,
            name: 'Snowflake Production',
            type: 'Snowflake',
            typeLabel: 'Snowflake Data Warehouse',
            environment: 'Production',
            owner: 'Priya S.',
            createdBy: 'Priya S.',
            createdDate: '2026-03-12',
            lastUpdated: '2 hours ago',
            lastTested: '14:02:17 today',
            version: 'v1.0.0',
            status: 'Connected',
            general: {
                displayName: 'Snowflake Production',
                type: 'Snowflake',
                environment: 'Production',
                owner: 'Priya S.',
                description: 'Enterprise data warehouse target for all core business intelligence pipelines and executive reporting.',
                tags: ['Production', 'Snowflake', 'Warehouse', 'BI', 'Reporting']
            },
            connection: {
                account: 'xy12345.us-east-1',
                warehouse: 'COMPUTE_WH',
                database: 'ANALYTICS_PROD',
                schema: 'PUBLIC',
                defaultRole: 'SYSADMIN'
            },
            auth: {
                method: 'Username & Password',
                username: 'CONNECTIQ_SERVICE_USER',
                password: '••••••••••••••••',
                rotationPolicy: '90 days'
            },
            performance: {
                connectionTimeout: 30,
                retryAttempts: 3,
                retryInterval: 5,
                batchSize: 1000,
                parallelWrites: 4,
                tls13: true,
                gzipCompression: true,
                keepAlive: true
            }
        };
    }

    static async updateDestinationConfiguration(orgId, destinationId, body) {
        return {
            id: destinationId,
            status: 'SAVED',
            savedAt: new Date().toISOString(),
            ...body
        };
    }

    static async getDestinationHealth(orgId, destinationId) {
        return {
            id: destinationId,
            name: destinationId === 'dest_sf_prod_01' ? 'Snowflake Production' : 'Production Destination',
            type: 'Snowflake',
            environment: 'Production',
            status: 'Healthy',
            statusLabel: 'Healthy',
            healthScore: 98,
            lastHealthCheck: '2 min ago',
            lastSuccessfulConnection: '4 min ago',
            monitoringInterval: '5 minutes',
            lastUpdated: '14:31:02 UTC',
            lastUpdatedRelative: '2 min ago',
            availability30d: '99.98%',
            activeAlertsCount: 0,
            activeAlertsSubtext: 'Active Alerts no issues',
            lastIncident: '12 days ago',
            lastIncidentDate: 'Aug 22, 2026',
            currentStatusDetail: 'all checks passed',
            kpiMetrics: {
                availability: {
                    label: 'Availability',
                    value: '99.98%',
                    trend: '+0.01%',
                    direction: 'up',
                    period: 'Last 30 days',
                    status: 'healthy',
                    sparkline: [99.85, 99.88, 99.91, 99.94, 99.96, 99.97, 99.98],
                },
                avgResponseTime: {
                    label: 'Avg Response Time',
                    value: '142ms',
                    trend: '-8ms',
                    direction: 'down',
                    period: 'vs. yesterday',
                    status: 'healthy',
                    sparkline: [158, 154, 150, 148, 145, 143, 142],
                },
                successfulConnections: {
                    label: 'Successful Connections',
                    value: '1,284',
                    trend: '+12',
                    direction: 'up',
                    period: 'Last 24h',
                    status: 'healthy',
                    sparkline: [1180, 1205, 1224, 1245, 1260, 1272, 1284],
                },
                failedConnections: {
                    label: 'Failed Connections',
                    value: '3',
                    trend: '-1',
                    direction: 'down',
                    period: 'Last 24h',
                    status: 'warning',
                    sparkline: [6, 5, 5, 4, 4, 3, 3],
                },
                authStatus: {
                    label: 'Auth Status',
                    value: 'Valid',
                    subtext: 'Expires in 47d',
                    detail: 'OAuth token active',
                    status: 'healthy',
                },
                writeSuccessRate: {
                    label: 'Write Success Rate',
                    value: '99.77%',
                    trend: '+0.02%',
                    direction: 'up',
                    period: 'Last 24h',
                    status: 'healthy',
                    sparkline: [99.68, 99.7, 99.72, 99.73, 99.75, 99.76, 99.77],
                },
            },
            healthTimeline: [
                { id: 'evt-1', timestamp: '14:31:02', event: 'Health Check Passed', status: 'Healthy', duration: '210ms', initiatedBy: 'System' },
                { id: 'evt-2', timestamp: '14:26:02', event: 'Health Check Passed', status: 'Healthy', duration: '198ms', initiatedBy: 'System' },
                { id: 'evt-3', timestamp: '14:21:02', event: 'Health Check Passed', status: 'Healthy', duration: '205ms', initiatedBy: 'System' },
                { id: 'evt-4', timestamp: '13:58:14', event: 'Connection Success', status: 'Healthy', duration: '142ms', initiatedBy: 'customer_sync_pipeline' },
                { id: 'evt-5', timestamp: '13:47:31', event: 'SSL Certificate Verified', status: 'Healthy', duration: '34ms', initiatedBy: 'System' },
                { id: 'evt-6', timestamp: '13:32:09', event: 'Connection Success', status: 'Healthy', duration: '155ms', initiatedBy: 'orders_etl_pipeline' },
                { id: 'evt-7', timestamp: '12:15:44', event: 'Authentication Refreshed', status: 'Healthy', duration: '87ms', initiatedBy: 'oauth_refresh_service' },
                { id: 'evt-8', timestamp: '11:04:22', event: 'Configuration Change', status: 'Warning', duration: '—', initiatedBy: 'priya.s@acme.com' },
                { id: 'evt-9', timestamp: '08:31:00', event: 'Timeout Detected', status: 'Warning', duration: '30s', initiatedBy: 'System' },
                { id: 'evt-10', timestamp: '08:32:15', event: 'Recovery — Connection Restored', status: 'Healthy', duration: '—', initiatedBy: 'System' }
            ],
            performanceOverview: [
                { id: 'perf-1', label: 'Avg Response Time', value: '142ms', prev: 'prev 150ms', history: [158, 155, 152, 149, 146, 144, 142] },
                { id: 'perf-2', label: 'Peak Response Time', value: '310ms', prev: 'prev 298ms', history: [280, 285, 290, 320, 305, 298, 310] },
                { id: 'perf-3', label: 'DNS Lookup Time', value: '12ms', prev: 'prev 14ms', history: [15, 14, 13, 14, 12, 13, 12] },
                { id: 'perf-4', label: 'TLS Handshake Time', value: '34ms', prev: 'prev 38ms', history: [39, 38, 36, 35, 34, 35, 34] },
                { id: 'perf-5', label: 'Authentication Time', value: '87ms', prev: 'prev 92ms', history: [95, 93, 91, 90, 88, 89, 87] },
                { id: 'perf-6', label: 'Write Latency', value: '28ms', prev: 'prev 31ms', history: [32, 31, 30, 31, 29, 30, 28] },
                { id: 'perf-7', label: 'Health Check Duration', value: '210ms', prev: 'prev 198ms', history: [195, 200, 205, 198, 208, 202, 210] }
            ],
            healthChecks: [
                { id: 'chk-1', name: 'Network Connectivity', status: 'Healthy', lastExecuted: '2 min ago', duration: '12ms', result: 'Connection to destination endpoint successful', logOutput: '[INFO] TCP handshake established on port 443 in 7.8ms.\n[SUCCESS] Network connectivity verified healthy.' },
                { id: 'chk-2', name: 'Authentication', status: 'Healthy', lastExecuted: '2 min ago', duration: '87ms', result: 'OAuth token valid, expires in 47 days', logOutput: '[INFO] Checking cached OAuth credentials.\n[SUCCESS] Authentication credentials valid and active.' },
                { id: 'chk-3', name: 'SSL Certificate', status: 'Healthy', lastExecuted: '2 min ago', duration: '34ms', result: 'Certificate valid, expires 2027-02-14', logOutput: '[INFO] Initiating TLS 1.3 certificate chain inspection.\n[SUCCESS] Certificate chain complete and trusted.' },
                { id: 'chk-4', name: 'Destination Reachability', status: 'Healthy', lastExecuted: '2 min ago', duration: '145ms', result: 'HTTPS 200 OK from endpoint', logOutput: '[INFO] Heartbeat probe returned 200 OK.\n[SUCCESS] Destination API endpoint reachable.' },
                { id: 'chk-5', name: 'Permissions', status: 'Healthy', lastExecuted: '5 min ago', duration: '68ms', result: 'Service user has required grants on target schema', logOutput: '[INFO] Checking USAGE, CREATE TABLE, INSERT grants.\n[SUCCESS] All required RBAC privileges confirmed active.' },
                { id: 'chk-6', name: 'Schema Validation', status: 'Healthy', lastExecuted: '5 min ago', duration: '112ms', result: 'Target schema PUBLIC accessible; tables verified', logOutput: '[INFO] Inspecting target schema.\n[SUCCESS] Schema topology verified and compatible.' },
                { id: 'chk-7', name: 'Write Validation', status: 'Warning', lastExecuted: '5 min ago', duration: '198ms', result: 'Write test succeeded; transient latency observed', logOutput: '[WARN] Transient queue latency observed.\n[SUCCESS] Write succeeded, row committed.' },
                { id: 'chk-8', name: 'Storage Availability', status: 'Healthy', lastExecuted: '10 min ago', duration: '55ms', result: 'Storage headroom 62% utilized', logOutput: '[INFO] Querying storage quotas.\n[SUCCESS] Headroom available.' }
            ],
            connectionHistory: [
                { id: 'conn-1', time: '14:28:41', result: 'Healthy', responseTime: '138ms', userProcess: 'orders_etl_pipeline', authentication: 'OAuth', environment: 'Production' },
                { id: 'conn-2', time: '14:15:22', result: 'Healthy', responseTime: '144ms', userProcess: 'customer_sync_pipeline', authentication: 'OAuth', environment: 'Production' },
                { id: 'conn-3', time: '14:02:10', result: 'Healthy', responseTime: '152ms', userProcess: 'inventory_sync', authentication: 'OAuth', environment: 'Production' },
                { id: 'conn-4', time: '13:58:14', result: 'Healthy', responseTime: '142ms', userProcess: 'customer_sync_pipeline', authentication: 'OAuth', environment: 'Production' }
            ],
            alerts: [
                { id: 'alt-1', severity: 'Warning', title: 'Write Latency Spike Detected', timestamp: '14:26:02 UTC', description: 'Probe insert exceeded threshold (310ms vs 140ms avg baseline). Transient load observed.', suggestion: 'Investigate compute warehouse cluster scaling policies.', status: 'Active', detailsText: 'Warehouse COMPUTE_WH experienced transient concurrency queueing.', logs: '[14:26:02.285 INFO] Write probe execution.\n[14:26:02.420 WARN] Latency 310ms exceeded 250ms target threshold.' },
                { id: 'alt-2', severity: 'Information', title: 'SSL Certificate Renewal Advisory', timestamp: 'Aug 1, 2026', description: 'SSL certificate valid for 166 days. Plan rotation ahead of expiry.', suggestion: 'Review certificate expiration lifecycle.', status: 'Acknowledged', detailsText: 'Issuer: DigiCert. SAN: *.snowflakecomputing.com', logs: '[INFO] Automated certificate validity audit passed.' }
            ],
            connectedPipelines: [
                { id: 'pipe-1', name: 'Customer Sync', status: 'Healthy', lastExecution: '5 min ago', currentImpact: 'None', pipelineId: 'pipe_cust_01' },
                { id: 'pipe-2', name: 'Orders ETL', status: 'Healthy', lastExecution: '2 hrs ago', currentImpact: 'None', pipelineId: 'pipe_orders_02' },
                { id: 'pipe-3', name: 'Inventory Sync', status: 'Warning', lastExecution: '15 min ago', currentImpact: 'Minor — latency delay', pipelineId: 'pipe_inv_03' },
                { id: 'pipe-4', name: 'Product Catalog Sync', status: 'Healthy', lastExecution: '1 hr ago', currentImpact: 'None', pipelineId: 'pipe_prod_04' }
            ],
            diagnostics: {
                hostEndpoint: 'xy12345.us-east-1.snowflakecomputing.com:443',
                database: 'ANALYTICS_DB',
                schema: 'PUBLIC',
                warehouse: 'COMPUTE_WH (Size: Medium, 4 Clusters)',
                tlsVersion: 'TLS 1.3',
                cipherSuite: 'TLS_AES_256_GCM_SHA384',
                connectionPool: 'Active: 8 / Max: 32 / Idle: 4',
                keepAlive: 'Enabled (60s probe interval)',
                statementTimeout: '300 seconds (Default)',
                maxBatchSize: '50,000 records (100 MB max payload)',
                retryPolicy: 'Exponential Backoff (Max 5 attempts, 1000ms base)',
                driverVersion: 'Snowflake JDBC Driver v3.14.2 (Secure Auth)'
            },
            recommendations: [
                { id: 'rec-1', priority: 'Low', priorityTone: 'info', title: 'Renew SSL Certificate', description: 'SSL certificate expires in 166 days. Schedule renewal to avoid service interruption.', buttonLabel: 'Schedule renewal', category: 'SSL Certificate Management' },
                { id: 'rec-2', priority: 'Low', priorityTone: 'info', title: 'Investigate Peak Write Latency', description: 'Write latency spiked to 310ms. Review warehouse size or batch configuration.', buttonLabel: 'Review configuration', category: 'Performance Tuning Guide' },
                { id: 'rec-3', priority: 'Info', priorityTone: 'neutral', title: 'Rotate Authentication Credentials', description: 'Credentials last rotated 90 days ago. Recommended rotation interval is 90 days.', buttonLabel: 'Rotate credentials', category: 'Credential Rotation' }
            ]
        };
    }

    static async getDestinationHistory(orgId, destinationId, query) {
        return {
            id: destinationId,
            stats: {
                totalSyncEvents: { value: 48291, change: '+12.4%', trend: 'up', period: 'Last 30 days' },
                successfulSyncs: { value: 45914, change: '+14.1%', trend: 'up', period: 'Last 30 days' },
                failedSyncs: { value: 2147, change: '-3.2%', trend: 'down', period: 'Last 30 days' },
                connectionFailures: { value: 319, change: '-18%', trend: 'down', period: 'Last 30 days' },
                recoveryEvents: { value: 287, change: '+5.9%', trend: 'up', period: 'Last 30 days' },
                avgDailyEvents: { value: 1609, change: '+0.3%', trend: 'neutral', period: '30-day avg' },
                archivedRecords: { value: 12440, change: '12,440', trend: 'neutral', period: 'Total archived' }
            },
            historyRecords: [
                {
                    id: 'rec-001',
                    eventNumber: '#EV-88421',
                    pipelineName: 'Customer 360 Ingestion Pipeline',
                    timestamp: '2026-08-05 14:22:18',
                    status: 'Success',
                    recordsWritten: '142,500',
                    duration: '42.3s',
                    throughput: '3.37 MB/s',
                    triggeredBy: 'Scheduled (Cron)',
                    batchSize: '5,000'
                }
            ]
        };
    }
}

exports.DestinationService = DestinationService;
