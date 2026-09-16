import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppShell from '../../shell/components/AppShell';
import { useNotifications } from '../hooks/useNotifications';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Settings,
  Search,
  Check,
  Trash2,
  ExternalLink,
  Sliders,
} from 'lucide-react';

const CATEGORY_MAP = {
  all: () => true,
  unread: (n) => n.unread,
  alerts: (n) => n.severity === 'critical' || n.severity === 'warning',
  pipeline: (n) => n.category === 'pipeline',
  system: (n) => n.category === 'system' || n.category === 'security' || n.category === 'monitoring',
};

const SEVERITY_BADGE = {
  critical: 'bg-red-50 text-red-700 border-red-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  neutral: 'bg-slate-100 text-slate-700 border-slate-200',
};

const SEVERITY_ICON = {
  critical: AlertCircle,
  warning: AlertTriangle,
  success: CheckCircle2,
  neutral: Settings,
};

export default function NotificationsCenterScreen() {
  const navigate = useNavigate();
  const {
    items,
    unreadCount,
    isLoading: _isLoading,
    isError: _isError,
    refetch: _refetch,
    markAllRead,
    isMarkingAllRead,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [toastMessage, setToastMessage] = useState(null);
  const [localDismissedIds, setLocalDismissedIds] = useState(new Set());

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const visibleNotifications = useMemo(() => {
    return items.filter((item) => !localDismissedIds.has(item.id));
  }, [items, localDismissedIds]);

  const filteredNotifications = useMemo(() => {
    const tabPredicate = CATEGORY_MAP[activeTab] || (() => true);
    return visibleNotifications.filter((item) => {
      if (!tabPredicate(item)) return false;
      if (severityFilter !== 'all' && item.severity !== severityFilter) return false;
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesTitle = item.title?.toLowerCase().includes(query);
        const matchesDetail = item.detail?.toLowerCase().includes(query);
        const matchesCategory = item.category?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDetail && !matchesCategory) return false;
      }
      return true;
    });
  }, [visibleNotifications, activeTab, severityFilter, search]);

  const criticalCount = visibleNotifications.filter((n) => n.severity === 'critical').length;
  const warningCount = visibleNotifications.filter((n) => n.severity === 'warning').length;

  const handleDismiss = (id, e) => {
    e?.stopPropagation();
    setLocalDismissedIds((prev) => new Set([...prev, id]));
    showToast('Notification dismissed');
  };

  const handleItemAction = (item) => {
    if (item.category === 'pipeline') {
      navigate('/pipelines');
    } else if (item.category === 'monitoring') {
      navigate('/dashboard/system-health');
    } else if (item.category === 'security' || item.category === 'account') {
      navigate('/account/profile');
    } else if (item.category === 'data-quality') {
      navigate('/dashboard/data-quality');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Notifications']}>
      <div className="flex flex-col gap-token-6">
        {/* Toast Feedback */}
        {toastMessage && (
          <div className="fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl shadow-lg border bg-slate-900 text-white border-slate-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col gap-token-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-token-3">
              <h1 className="m-0 text-token-lg font-bold tracking-[-0.02em] text-text-primary-alt">
                Notification Center
              </h1>
              {unreadCount > 0 && (
                <span className="rounded-full bg-red-500 text-white px-2 py-0.5 font-mono text-token-xs font-bold">
                  {unreadCount} Unread
                </span>
              )}
            </div>
            <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">
              Review and manage system alerts, pipeline events, operational updates, and security logs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-token-2">
            <button
              type="button"
              onClick={() => {
                markAllRead();
                showToast('All notifications marked as read');
              }}
              disabled={unreadCount === 0 || isMarkingAllRead}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-border bg-surface-card text-token-sm font-semibold text-text-secondary-alt hover:bg-surface-hover hover:text-text-primary-alt disabled:opacity-50 disabled:cursor-not-allowed transition shadow-2xs"
            >
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isMarkingAllRead ? 'Marking…' : 'Mark all read'}</span>
            </button>

            <Link
              to="/account/notifications"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-border bg-surface-card text-token-sm font-semibold text-text-secondary-alt hover:bg-surface-hover hover:text-text-primary-alt transition shadow-2xs"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-500" />
              <span>Notification Preferences</span>
            </Link>
          </div>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-token-4">
          <div className="p-token-5 bg-surface-card rounded-md border border-border shadow-sm">
            <div className="flex items-center justify-between text-text-faint text-token-xs font-mono font-semibold uppercase tracking-wider">
              <span>Total Notifications</span>
              <Bell className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-token-xl font-bold text-text-primary-alt mt-token-2">
              {visibleNotifications.length}
            </div>
            <div className="text-token-xs text-text-secondary-alt mt-token-1">
              Active alerts and messages
            </div>
          </div>

          <div className="p-token-5 bg-surface-card rounded-md border border-border shadow-sm">
            <div className="flex items-center justify-between text-text-faint text-token-xs font-mono font-semibold uppercase tracking-wider">
              <span>Unread</span>
              <AlertCircle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-token-xl font-bold text-amber-600 mt-token-2">
              {unreadCount}
            </div>
            <div className="text-token-xs text-text-secondary-alt mt-token-1">
              Require acknowledgment
            </div>
          </div>

          <div className="p-token-5 bg-surface-card rounded-md border border-border shadow-sm">
            <div className="flex items-center justify-between text-text-faint text-token-xs font-mono font-semibold uppercase tracking-wider">
              <span>Critical Incidents</span>
              <AlertCircle className="w-4 h-4 text-red-500" />
            </div>
            <div className="text-token-xl font-bold text-red-600 mt-token-2">
              {criticalCount}
            </div>
            <div className="text-token-xs text-text-secondary-alt mt-token-1">
              Immediate action needed
            </div>
          </div>

          <div className="p-token-5 bg-surface-card rounded-md border border-border shadow-sm">
            <div className="flex items-center justify-between text-text-faint text-token-xs font-mono font-semibold uppercase tracking-wider">
              <span>Warnings</span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-token-xl font-bold text-amber-700 mt-token-2">
              {warningCount}
            </div>
            <div className="text-token-xs text-text-secondary-alt mt-token-1">
              Threshold warnings
            </div>
          </div>
        </div>

        {/* Filter Toolbar & Search */}
        <div className="bg-surface-card rounded-md border border-border shadow-sm p-token-4 flex flex-col md:flex-row md:items-center justify-between gap-token-3">
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-1">
            {[
              { id: 'all', label: 'All', count: visibleNotifications.length },
              { id: 'unread', label: 'Unread', count: unreadCount },
              { id: 'alerts', label: 'Alerts', count: criticalCount + warningCount },
              { id: 'pipeline', label: 'Pipelines', count: visibleNotifications.filter((n) => n.category === 'pipeline').length },
              { id: 'system', label: 'System & Security', count: visibleNotifications.filter((n) => n.category === 'system' || n.category === 'security' || n.category === 'monitoring').length },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-1.5 px-token-3 py-1.5 rounded-sm text-token-sm font-medium transition ${
                    isActive
                      ? 'bg-surface-muted text-primary font-bold shadow-2xs'
                      : 'text-text-secondary-alt hover:text-text-primary-alt'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full font-mono text-[10px] font-bold ${
                      isActive ? 'bg-primary/10 text-primary' : 'bg-surface-muted-alt text-decorative-muted'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Severity Filter */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:w-64">
              <Search className="w-3.5 h-3.5 text-text-faint absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search notifications…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-md border border-border bg-surface-page text-token-sm text-text-primary placeholder:text-text-primary/50 focus:outline-none focus:border-primary"
              />
            </div>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-md border border-border bg-surface-page text-token-sm text-text-secondary-alt focus:outline-none focus:border-primary"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical Only</option>
              <option value="warning">Warnings Only</option>
              <option value="success">Success Only</option>
              <option value="neutral">Info Only</option>
            </select>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-surface-card rounded-md border border-border shadow-sm overflow-hidden divide-y divide-border-subtle">
          {filteredNotifications.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Bell className="w-8 h-8 text-text-faint mx-auto" />
              <p className="text-token-base font-semibold text-text-primary-alt m-0">
                No notifications found
              </p>
              <p className="text-token-sm text-text-secondary-alt m-0">
                {search || severityFilter !== 'all'
                  ? 'Try clearing active search or filters.'
                  : "You're all caught up! No active alerts."}
              </p>
            </div>
          ) : (
            filteredNotifications.map((item) => {
              const IconComponent = SEVERITY_ICON[item.severity] || CheckCircle2;
              const badgeStyle = SEVERITY_BADGE[item.severity] || SEVERITY_BADGE.neutral;

              return (
                <div
                  key={item.id}
                  onClick={() => handleItemAction(item)}
                  className={`p-token-5 flex items-start gap-token-4 hover:bg-surface-hover/70 transition cursor-pointer group ${
                    item.unread ? 'bg-primary/[0.02]' : ''
                  }`}
                >
                  {/* Severity Icon */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${badgeStyle}`}
                  >
                    <IconComponent className="w-4 h-4" />
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-token-sm text-text-primary-alt group-hover:text-primary transition">
                          {item.title}
                        </span>
                        {item.unread && (
                          <span className="w-2 h-2 rounded-full bg-primary shrink-0" title="Unread" />
                        )}
                      </div>
                      <span className="font-mono text-token-xs text-text-faint shrink-0">
                        {item.time}
                      </span>
                    </div>

                    <p className="text-token-sm text-text-secondary-alt m-0 leading-relaxed">
                      {item.detail}
                    </p>

                    <div className="flex items-center gap-2 pt-1">
                      {item.categoryLabel && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-surface-muted text-text-secondary-alt">
                          {item.categoryLabel}
                        </span>
                      )}
                      <span className="text-token-xs font-semibold text-primary group-hover:underline inline-flex items-center gap-1">
                        <span>Investigate</span>
                        <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>
                  </div>

                  {/* Dismiss */}
                  <button
                    type="button"
                    onClick={(e) => handleDismiss(item.id, e)}
                    className="p-1.5 rounded-md text-text-faint hover:text-danger hover:bg-danger-bg transition shrink-0 opacity-0 group-hover:opacity-100"
                    title="Dismiss notification"
                    aria-label="Dismiss notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </AppShell>
  );
}
