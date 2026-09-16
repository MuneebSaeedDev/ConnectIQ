import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../../shell/components/AppShell';
import {
  CheckCircle2,
  Send,
  Paperclip,
  Clock,
  LifeBuoy,
  FileText,
} from 'lucide-react';

const CATEGORIES = [
  'Pipeline Failure / Crash',
  'Connector / Data Source Authentication',
  'Worker Fleet / Queue Timeout',
  'Data Quality & Validation Rules',
  'Access Control / Roles & Permissions',
  'Billing & Subscription',
  'Feature Request / Optimization',
  'General Question',
];

const PRIORITIES = [
  { id: 'low', label: 'Low', desc: 'General guidance or cosmetic issue', badge: 'bg-slate-100 text-slate-700' },
  { id: 'medium', label: 'Medium', desc: 'Non-critical workflow delayed', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'high', label: 'High', desc: 'Production pipeline degraded', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'urgent', label: 'Urgent (SLA)', desc: 'Production data outage / critical failure', badge: 'bg-red-50 text-red-700 border-red-200' },
];

export default function ContactSupportScreen() {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [priority, setPriority] = useState('medium');
  const [resourceId, setResourceId] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('a.chen@acmecorp.com');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState(null);

  const [submittedTickets, setSubmittedTickets] = useState([
    {
      id: 'TICK-4819',
      subject: 'Orders Sync BigQuery rate-limit timeout',
      category: 'Pipeline Failure',
      priority: 'High',
      status: 'In Progress',
      created: '2h ago',
      assignedTo: 'Support Eng · D. Wright',
    },
    {
      id: 'TICK-4792',
      subject: 'Salesforce CDC credential rotation guide',
      category: 'Connector',
      priority: 'Low',
      status: 'Resolved',
      created: '3 days ago',
      assignedTo: 'Support Eng · E. Clark',
    },
  ]);

  const showToast = (message) => {
    setFeedbackToast(message);
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      showToast('Please provide both a subject and issue description.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const newTicketId = `TICK-${Math.floor(5000 + Math.random() * 5000)}`;
      const newTicket = {
        id: newTicketId,
        subject,
        category,
        priority: priority.charAt(0).toUpperCase() + priority.slice(1),
        status: 'Open',
        created: 'Just now',
        assignedTo: 'Triage Queue',
      };

      setSubmittedTickets((prev) => [newTicket, ...prev]);
      setIsSubmitting(false);
      setSubject('');
      setDescription('');
      setResourceId('');
      showToast(`Support ticket ${newTicketId} created successfully. Our team will reply shortly.`);
    }, 1200);
  };

  return (
    <AppShell breadcrumb={['ConnectIQ', 'Support', 'Contact Support']}>
      <div className="flex flex-col gap-token-6">
        {/* Toast */}
        {feedbackToast && (
          <div className="fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl shadow-lg border bg-slate-900 text-white border-slate-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{feedbackToast}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col gap-token-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="m-0 text-token-lg font-bold tracking-[-0.02em] text-text-primary-alt">
                Contact Technical Support
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-[10px] font-bold">
                ● 24/7 SLA Active
              </span>
            </div>
            <p className="m-0 mt-token-1 text-token-sm text-text-secondary-alt">
              Submit operational inquiries, report pipeline incidents, or request enterprise configuration assistance.
            </p>
          </div>

          <Link
            to="/help"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface-card text-token-sm font-semibold text-text-secondary-alt hover:bg-surface-hover hover:text-text-primary-alt transition shadow-2xs"
          >
            <LifeBuoy className="w-3.5 h-3.5 text-blue-600" />
            <span>Browse Help Center</span>
          </Link>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-token-6">
          {/* Left 2 Columns: Form */}
          <div className="lg:col-span-2 bg-surface-card rounded-md border border-border shadow-sm p-token-6 space-y-5">
            <div className="border-b border-border-subtle pb-token-3">
              <h2 className="text-token-base font-bold text-text-primary-alt m-0">
                Submit a Support Ticket
              </h2>
              <p className="text-token-xs text-text-secondary-alt m-0 mt-0.5">
                Our support engineering team typically responds within 15 minutes for enterprise priority issues.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Subject */}
              <div className="space-y-1">
                <label className="font-semibold text-text-primary-alt block">
                  Subject / Summary <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Orders Sync pipeline failing at Transformation stage with timeout"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-border bg-surface-page text-token-sm text-text-primary placeholder:text-text-primary/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Category & Priority Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-text-primary-alt block">
                    Issue Category <span className="text-danger">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-border bg-surface-page text-token-sm text-text-primary focus:outline-none focus:border-primary"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-text-primary-alt block">
                    Impact / Priority <span className="text-danger">*</span>
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-border bg-surface-page text-token-sm text-text-primary focus:outline-none focus:border-primary font-semibold"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label} — {p.desc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Related Resource ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-text-primary-alt block">
                    Related Resource ID <span className="text-text-faint font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. p1, pipe-004, worker-node-03"
                    value={resourceId}
                    onChange={(e) => setResourceId(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-border bg-surface-page font-mono text-token-sm text-text-primary placeholder:text-text-primary/50 focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-text-primary-alt block">
                    Contact Email <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-border bg-surface-page text-token-sm text-text-primary focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-semibold text-text-primary-alt block">
                  Detailed Description & Error Logs <span className="text-danger">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Describe what happened, expected behavior, stack traces, and steps to reproduce..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-border bg-surface-page text-token-sm text-text-primary placeholder:text-text-primary/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-mono text-xs"
                />
              </div>

              {/* File Attachment Hint */}
              <div className="p-3 bg-surface-muted rounded-md border border-border-subtle flex items-center justify-between text-token-xs text-text-secondary-alt">
                <div className="flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-text-faint" />
                  <span>Attach diagnostic logs, schema exports, or execution screenshots (max 25MB)</span>
                </div>
                <button
                  type="button"
                  onClick={() => showToast('Attachment browser opened')}
                  className="text-primary font-semibold hover:underline"
                >
                  Choose file
                </button>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary hover:opacity-90 text-white text-token-sm font-semibold shadow-xs transition disabled:opacity-60"
                >
                  <Send className={`w-4 h-4 ${isSubmitting ? 'animate-spin' : ''}`} />
                  <span>{isSubmitting ? 'Submitting Ticket…' : 'Submit Support Ticket'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Active Tickets & Channels */}
          <div className="space-y-token-4">
            {/* Live SLA Channels */}
            <div className="bg-surface-card rounded-md border border-border shadow-sm p-token-5 space-y-3">
              <h2 className="text-token-base font-bold text-text-primary-alt m-0 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Support Channels & SLAs</span>
              </h2>
              <div className="space-y-2 text-token-xs">
                <div className="flex items-center justify-between p-2.5 bg-surface-muted rounded-sm">
                  <div>
                    <div className="font-semibold text-text-primary-alt">Critical Incident SLA</div>
                    <div className="text-text-secondary-alt text-[11px]">Production downtime</div>
                  </div>
                  <span className="font-mono font-bold text-red-600">&lt; 15 mins</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-surface-muted rounded-sm">
                  <div>
                    <div className="font-semibold text-text-primary-alt">Standard Support Desk</div>
                    <div className="text-text-secondary-alt text-[11px]">Configuration & issues</div>
                  </div>
                  <span className="font-mono font-bold text-emerald-600">&lt; 1 hour</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-surface-muted rounded-sm">
                  <div>
                    <div className="font-semibold text-text-primary-alt">Dedicated Slack Bridge</div>
                    <div className="text-text-secondary-alt text-[11px]">#connectiq-acme-support</div>
                  </div>
                  <span className="font-mono font-bold text-blue-600">Online</span>
                </div>
              </div>
            </div>

            {/* Recent Submitted Tickets */}
            <div className="bg-surface-card rounded-md border border-border shadow-sm p-token-5 space-y-3">
              <h2 className="text-token-base font-bold text-text-primary-alt m-0 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-600" />
                <span>Your Recent Tickets</span>
              </h2>

              <div className="space-y-2.5 divide-y divide-border-subtle">
                {submittedTickets.map((t) => (
                  <div key={t.id} className="pt-2 first:pt-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold text-primary">{t.id}</span>
                      <span
                        className={`px-2 py-0.2 rounded-full font-mono text-[9px] font-bold uppercase tracking-wider ${
                          t.status === 'Resolved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>
                    <div className="font-semibold text-text-primary-alt text-token-xs leading-tight">
                      {t.subject}
                    </div>
                    <div className="flex justify-between text-[11px] text-text-faint pt-0.5">
                      <span>{t.category}</span>
                      <span>{t.created}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
