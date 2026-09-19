import React from 'react';
import { Bell, AlertCircle, X, Plus } from 'lucide-react';

export default function NotificationsSection({
  form,
  updateNestedField,
  validation,
  addEmailRecipient,
  removeEmailRecipient,
  addSlackChannel,
  removeSlackChannel
}) {
  const [emailInput, setEmailInput] = React.useState('');
  const [slackInput, setSlackInput] = React.useState('');

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (emailInput.trim()) {
      addEmailRecipient(emailInput.trim());
      setEmailInput('');
    }
  };

  const handleSlackSubmit = (e) => {
    e.preventDefault();
    if (slackInput.trim()) {
      addSlackChannel(slackInput.trim());
      setSlackInput('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
          <Bell className="size-4 text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-900">Alert Triggers & Channels</h2>
        </div>

        <div className="p-5 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-xs font-semibold text-slate-900 mb-3">Trigger Events</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.notifications?.alertOnFailure ?? true}
                    onChange={(e) => updateNestedField('notifications', 'alertOnFailure', e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  Pipeline Failure (DLQ or Crash)
                </label>

                <label className="flex items-center justify-between text-xs font-semibold text-slate-700 cursor-pointer group">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.notifications?.alertOnStalled ?? true}
                      onChange={(e) => updateNestedField('notifications', 'alertOnStalled', e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    Stalled Execution
                  </div>
                  {form.notifications?.alertOnStalled && (
                    <div className="flex items-center gap-1.5 opacity-100 transition-opacity">
                      <span className="text-[10px] text-slate-400 font-medium">After:</span>
                      <input
                        type="number"
                        min="5"
                        value={form.notifications?.stalledThresholdMinutes || 30}
                        onChange={(e) => updateNestedField('notifications', 'stalledThresholdMinutes', parseInt(e.target.value, 10))}
                        className="w-16 px-1.5 py-0.5 text-[11px] border border-slate-300 rounded text-slate-700 focus:ring-1 focus:ring-blue-500"
                        onClick={(e) => e.preventDefault()}
                      />
                      <span className="text-[10px] text-slate-400 font-medium">min</span>
                    </div>
                  )}
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.notifications?.alertOnSchemaDrift ?? true}
                    onChange={(e) => updateNestedField('notifications', 'alertOnSchemaDrift', e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  Unresolved Schema Drift
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.notifications?.alertOnSuccess ?? false}
                    onChange={(e) => updateNestedField('notifications', 'alertOnSuccess', e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  Successful Completion
                </label>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-slate-900 mb-3">Delivery Mediums</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.notifications?.channels?.email ?? true}
                    onChange={(e) => updateNestedField('channels', 'email', e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  Email Delivery
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.notifications?.channels?.slack ?? true}
                    onChange={(e) => updateNestedField('channels', 'slack', e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  Slack Messages
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.notifications?.channels?.inApp ?? true}
                    onChange={(e) => updateNestedField('channels', 'inApp', e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  ConnectIQ In-App Center
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.notifications?.channels?.webhook ?? true}
                    onChange={(e) => updateNestedField('channels', 'webhook', e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  Outbound Webhooks
                </label>
              </div>
            </div>
          </div>

          <div className="pt-5 border-t border-slate-100 space-y-5">
            {/* Email Recipients */}
            {form.notifications?.channels?.email && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Alert Recipients</label>
                <div className="flex flex-wrap items-center gap-2 p-2 border border-slate-200 rounded-md bg-slate-50 min-h-[46px]">
                  {(form.notifications.emailRecipients || []).map((email) => (
                    <span
                      key={email}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-slate-200 bg-white text-[11px] font-medium text-slate-700 shadow-2xs group"
                    >
                      {email}
                      <button
                        type="button"
                        onClick={() => removeEmailRecipient(email)}
                        className="text-slate-400 hover:text-rose-600 focus:outline-none transition"
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}
                  <form onSubmit={handleEmailSubmit} className="flex-1 min-w-[200px]">
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="+ Add email (Enter)"
                      className="w-full px-2 py-1 text-xs bg-transparent border-none focus:outline-none focus:ring-0 text-slate-700 placeholder:text-slate-400"
                    />
                  </form>
                </div>
              </div>
            )}

            {/* Slack Channels */}
            {form.notifications?.channels?.slack && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Slack Channel Routing</label>
                <div className="flex flex-wrap items-center gap-2 p-2 border border-slate-200 rounded-md bg-slate-50 min-h-[46px]">
                  {(form.notifications.slackChannels || []).map((channel) => (
                    <span
                      key={channel}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-indigo-200 bg-indigo-50 text-[11px] font-medium text-indigo-700 shadow-2xs group"
                    >
                      {channel}
                      <button
                        type="button"
                        onClick={() => removeSlackChannel(channel)}
                        className="text-indigo-400 hover:text-rose-600 focus:outline-none transition"
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}
                  <form onSubmit={handleSlackSubmit} className="flex-1 min-w-[200px]">
                    <input
                      type="text"
                      value={slackInput}
                      onChange={(e) => setSlackInput(e.target.value)}
                      placeholder="#channel-name (Enter)"
                      className="w-full px-2 py-1 text-xs bg-transparent border-none focus:outline-none focus:ring-0 text-slate-700 placeholder:text-slate-400"
                    />
                  </form>
                </div>
              </div>
            )}

            {/* Webhook Endpoint */}
            {form.notifications?.channels?.webhook && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Webhook Post URL</label>
                <div className="relative">
                  <input
                    type="url"
                    value={form.notifications.webhookEndpoint || ''}
                    onChange={(e) => updateNestedField('notifications', 'webhookEndpoint', e.target.value)}
                    placeholder="https://pagerduty.acme.com/api/v1/incidents"
                    className="w-full px-3 py-2 text-xs font-mono rounded-md border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50"
                  />
                </div>
                {validation?.warnings?.map((warn, i) => (
                  <p key={`warn-${i}`} className="mt-1 flex items-center gap-1 text-[11px] text-amber-600 font-medium">
                    <AlertCircle className="size-3" /> {warn}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
