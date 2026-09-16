import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppShell from '../../shell/components/AppShell';
import {
  Search,
  BookOpen,
  Workflow,
  Database,
  Activity,
  ShieldCheck,
  MessageSquare,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  HelpCircle,
  Zap,
  Terminal,
  LifeBuoy,
} from 'lucide-react';

const CATEGORIES = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Learn the fundamentals of ConnectIQ ETL, workspaces, and distributed execution.',
    icon: Zap,
    tone: 'bg-blue-50 text-blue-600 border-blue-100',
    articles: [
      'Platform Architecture & Engine Overview',
      'Quick Start: Creating your first ETL Pipeline in 5 minutes',
      'Understanding ConnectIQ DAGs and Execution Lifecycle',
      'Workspace Organization, Teams, and Projects',
    ],
  },
  {
    id: 'pipeline-builder',
    title: 'Visual Pipeline Builder',
    description: 'Design, test, and orchestrate complex ETL data pipelines with visual nodes.',
    icon: Workflow,
    tone: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    articles: [
      'Connecting Source Nodes: CDC, Streaming & Batch Polls',
      'Building Transformation Pipelines with SQL & JavaScript',
      'Configuring Data Quality & Validation Filters',
      'Scheduling Pipelines: Cron, Event Triggers, and Webhooks',
    ],
  },
  {
    id: 'connectors',
    title: 'Connectors & Data Sources',
    description: 'Configuration guides for 50+ enterprise databases, cloud warehouses, and APIs.',
    icon: Database,
    tone: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    articles: [
      'PostgreSQL, MySQL & Oracle Database Connectors',
      'Snowflake, Google BigQuery & Amazon Redshift Destinations',
      'REST API, Webhook, and SFTP Ingestion Setup',
      'Connection Testing, Health Monitoring & Credential Vaults',
    ],
  },
  {
    id: 'monitoring',
    title: 'Monitoring & Operations',
    description: 'Real-time telemetry, worker node clusters, queue delays, and incident management.',
    icon: Activity,
    tone: 'bg-amber-50 text-amber-600 border-amber-100',
    articles: [
      'Real-Time Pipeline Execution Monitoring & Step Tracking',
      'Diagnosing Pipeline Failures and Retry Policies',
      'Worker Fleet Scaling, Queues, and Resource Utilization',
      'Configuring Alert Notifications via Email, Slack, and PagerDuty',
    ],
  },
  {
    id: 'security-rbac',
    title: 'Security, Roles & Access Control',
    description: 'Enterprise security, role-based access control (RBAC), and compliance audits.',
    icon: ShieldCheck,
    tone: 'bg-purple-50 text-purple-600 border-purple-100',
    articles: [
      'Configuring Role Permissions and Permission Matrices',
      'Organization & Team Multi-Tenancy Management',
      'Audit Logs, Compliance Tracking, and Access Reviews',
      'Two-Factor Authentication (2FA) & Session Security',
    ],
  },
  {
    id: 'api-sdk',
    title: 'API Reference & CLI SDK',
    description: 'Programmatic access, REST endpoints, API keys, and automated deployments.',
    icon: Terminal,
    tone: 'bg-slate-100 text-slate-700 border-slate-200',
    articles: [
      'ConnectIQ REST API Authentication & Rate Limits',
      'Pipeline Trigger API & Programmatic Execution',
      'Managing API Keys, Scopes, and Expiry Policies',
      'Webhook Payload Specifications & Verification Signatures',
    ],
  },
];

const FAQS = [
  {
    q: 'How do I recover a failed pipeline execution?',
    a: 'You can retry a failed execution from the Dashboard or Execution Statistics screen. Click "Retry" on the failed row, which will re-queue the pipeline at the specific stage where the failure occurred without re-processing previously succeeded steps.',
  },
  {
    q: 'What data formats does ConnectIQ support for exports?',
    a: 'ConnectIQ supports JSON, CSV, and plain text formatted summaries for dashboard snapshots, pipeline catalogs, and audit logs. Custom schema exports are also available in JSON Schema and YAML manifest formats.',
  },
  {
    q: 'How does role-based access control (RBAC) work across organizations?',
    a: 'Permissions are scoped at both the Organization and Team levels. A user can be an Organization Admin in one workspace and a Viewer in another. Super Admins have full administrative authority across all registered organizations.',
  },
  {
    q: 'What is the maximum throughput supported by the worker fleet?',
    a: 'The distributed worker engine scales dynamically across available compute nodes, supporting upwards of 50,000 records per second per active worker node with micro-batch latency under 20ms.',
  },
];

export default function HelpCenterScreen() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return CATEGORIES;
    const query = search.toLowerCase();
    return CATEGORIES.map((cat) => ({
      ...cat,
      articles: cat.articles.filter(
        (art) =>
          art.toLowerCase().includes(query) ||
          cat.title.toLowerCase().includes(query) ||
          cat.description.toLowerCase().includes(query)
      ),
    })).filter(
      (cat) =>
        cat.title.toLowerCase().includes(query) ||
        cat.description.toLowerCase().includes(query) ||
        cat.articles.length > 0
    );
  }, [search]);

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Help & Support']}>
      <div className="flex flex-col gap-token-6">
        {/* Hero Header with Search */}
        <div className="rounded-2xl border border-border bg-surface-card p-8 shadow-sm text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>ConnectIQ Knowledge Center</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary-alt m-0 max-w-2xl mx-auto">
            How can we help you with your ETL operations today?
          </h1>
          <p className="text-token-sm text-text-secondary-alt max-w-xl mx-auto m-0">
            Search our comprehensive guides, connector tutorials, developer APIs, and operational troubleshooting manuals.
          </p>

          <div className="max-w-xl mx-auto relative pt-2">
            <Search className="w-4 h-4 text-text-faint absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search guides, nodes, connectors, API endpoints, error codes…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface-page text-token-sm text-text-primary placeholder:text-text-primary/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 shadow-2xs"
            />
          </div>
        </div>

        {/* Quick Links Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-token-4">
          <Link
            to="/support/contact"
            className="p-token-5 bg-surface-card rounded-md border border-border shadow-sm hover:border-primary/50 transition group flex items-start gap-3"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-token-sm font-bold text-text-primary-alt group-hover:text-primary transition m-0">
                Contact Technical Support
              </h3>
              <p className="text-token-xs text-text-secondary-alt mt-1 m-0">
                Submit an urgent support ticket to our 24/7 engineering desk.
              </p>
            </div>
          </Link>

          <Link
            to="/dashboard/system-health"
            className="p-token-5 bg-surface-card rounded-md border border-border shadow-sm hover:border-primary/50 transition group flex items-start gap-3"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-token-sm font-bold text-text-primary-alt group-hover:text-primary transition m-0">
                Live Platform Status
              </h3>
              <p className="text-token-xs text-text-secondary-alt mt-1 m-0">
                Check cluster uptime, service availability, and scheduled maintenance.
              </p>
            </div>
          </Link>

          <Link
            to="/pipelines/templates"
            className="p-token-5 bg-surface-card rounded-md border border-border shadow-sm hover:border-primary/50 transition group flex items-start gap-3"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-token-sm font-bold text-text-primary-alt group-hover:text-primary transition m-0">
                Pipeline Templates Library
              </h3>
              <p className="text-token-xs text-text-secondary-alt mt-1 m-0">
                Explore pre-built blueprints for e-commerce, CRM, and analytics.
              </p>
            </div>
          </Link>
        </div>

        {/* Documentation Categories Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-token-base font-bold text-text-primary-alt m-0">
              Knowledge Base Categories
            </h2>
            <span className="text-token-xs font-mono text-text-faint">
              {filteredCategories.length} categories available
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-token-4">
            {filteredCategories.map((cat) => {
              const IconComponent = cat.icon;
              return (
                <div
                  key={cat.id}
                  className="bg-surface-card rounded-md border border-border shadow-sm p-token-5 flex flex-col justify-between space-y-4 hover:border-primary/40 transition"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${cat.tone}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <h3 className="text-token-sm font-bold text-text-primary-alt m-0">
                        {cat.title}
                      </h3>
                    </div>
                    <p className="text-token-xs text-text-secondary-alt m-0">
                      {cat.description}
                    </p>
                    <ul className="list-none p-0 m-0 space-y-2 pt-2 border-t border-border-subtle">
                      {cat.articles.map((art) => (
                        <li key={art}>
                          <button
                            type="button"
                            onClick={() => navigate('/support/contact')}
                            className="text-left text-token-xs text-text-secondary-alt hover:text-primary transition flex items-center gap-1.5 group"
                          >
                            <ChevronRight className="w-3 h-3 text-text-faint group-hover:text-primary transition shrink-0" />
                            <span className="truncate">{art}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-border-subtle">
                    <button
                      type="button"
                      onClick={() => navigate('/support/contact')}
                      className="text-token-xs font-semibold text-primary hover:underline flex items-center gap-1"
                    >
                      <span>Explore all articles</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FAQs Section */}
        <div className="bg-surface-card rounded-md border border-border shadow-sm p-token-6 space-y-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <h2 className="text-token-base font-bold text-text-primary-alt m-0">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="divide-y divide-border-subtle">
            {FAQS.map((faq, i) => {
              const isOpen = openFaqIndex === i;
              return (
                <div key={faq.q} className="py-token-4">
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                    className="w-full flex items-center justify-between text-left text-token-sm font-semibold text-text-primary-alt hover:text-primary transition"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-text-faint transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-primary' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <p className="text-token-sm text-text-secondary-alt mt-token-2 leading-relaxed m-0 animate-in fade-in duration-150">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
