import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Settings,
  ExternalLink,
} from 'lucide-react';

export default function NodeConfigPanel({
  selectedNode,
  onUpdateConfig,
  onClose,
}) {
  // Local form state initialized from selected node
  const [form, setForm] = useState(selectedNode?.config || {});
  const [tagInput, setTagInput] = useState('');
  const [saveFeedback, setSaveFeedback] = useState('');

  // Accordion section collapse state
  const [openSections, setOpenSections] = useState({
    general: true,
    connection: true,
    processing: true,
    validation: true,
    monitoring: true,
    advanced: false,
  });

  useEffect(() => {
    if (selectedNode) {
      setForm(selectedNode.config || {});
    }
    setSaveFeedback('');
  }, [selectedNode]);

  if (!selectedNode) {
    return (
      <aside className="w-68 bg-white border-l border-slate-200 flex flex-col items-center justify-center p-6 text-center text-slate-400 select-none h-full shrink-0">
        <Settings className="size-8 text-slate-300 mb-2 stroke-1" />
        <p className="text-xs font-medium text-slate-600">No node selected</p>
        <p className="text-[11px] text-slate-400 mt-1">
          Click any node on the canvas to inspect and edit its configuration.
        </p>
      </aside>
    );
  }

  const toggleSection = (sectionKey) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
      if (val && !(form.tags || []).includes(val)) {
        updateField('tags', [...(form.tags || []), val]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    updateField(
      'tags',
      (form.tags || []).filter((t) => t !== tagToRemove)
    );
  };

  const handleSave = () => {
    onUpdateConfig(selectedNode.id, form);
    setSaveFeedback('Node configuration saved.');
    setTimeout(() => setSaveFeedback(''), 2500);
  };

  return (
    <aside className="w-68 bg-white border-l border-slate-200 flex flex-col justify-between select-none h-full shrink-0 z-10 overflow-hidden">
      {/* Top Header matching Figma node 150:8990 */}
      <div className="p-3 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
        <div>
          <h3 className="text-xs font-semibold text-slate-900 leading-4">
            Node Configuration
          </h3>
          <p className="text-[10px] text-slate-500 leading-3 truncate max-w-[150px]">
            {selectedNode.title} · {selectedNode.category}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 transition"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x size-4"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
          {selectedNode.category === 'sources' && (
            <Link
              to="/pipelines/new/source"
              className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-1.5 py-0.5 rounded border border-blue-200 transition"
              title="Open full Source Node configuration screen (SCR-067)"
            >
              <ExternalLink className="size-2.5" /> Full Setup
            </Link>
          )}
          {(selectedNode.type === 'filter' || selectedNode.id?.includes('filter') || selectedNode.title?.toLowerCase().includes('filter')) && (
            <Link
              to="/pipelines/new/filter"
              className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-1.5 py-0.5 rounded border border-purple-200 transition"
              title="Open full Filter Node configuration screen (SCR-068)"
            >
              <ExternalLink className="size-2.5" /> Full Setup
            </Link>
          )}
          {(selectedNode.type === 'mapping' || selectedNode.id?.includes('map') || selectedNode.title?.toLowerCase().includes('map')) && (
            <Link
              to="/pipelines/new/mapping"
              className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-1.5 py-0.5 rounded border border-indigo-200 transition"
              title="Open full Mapping Node configuration screen (SCR-069)"
            >
              <ExternalLink className="size-2.5" /> Full Setup
            </Link>
          )}
          {(selectedNode.category === 'transformations' || selectedNode.type === 'transformation' || selectedNode.id?.includes('trans') || selectedNode.title?.toLowerCase().includes('clean') || selectedNode.title?.toLowerCase().includes('transform')) && (
            <Link
              to="/pipelines/new/transformation"
              className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200 transition"
              title="Open full Transformation Node configuration screen (SCR-070)"
            >
              <ExternalLink className="size-2.5" /> Full Setup
            </Link>
          )}
          {(selectedNode.type === 'transformation' || selectedNode.type === 'transform' || selectedNode.category === 'transformations' || selectedNode.id?.includes('trans') || selectedNode.title?.toLowerCase().includes('trans')) && (
            <Link
              to="/pipelines/new/transformations"
              className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200 transition"
              title="Open full Transformation Node configuration screen (SCR-070)"
            >
              <ExternalLink className="size-2.5" /> Full Setup
            </Link>
          )}
          <div className="flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-medium text-emerald-600 capitalize">
              {selectedNode.status === 'valid' ? 'Connected' : selectedNode.status}
            </span>
          </div>
        </div>
      </div>

      {/* Scrollable Form Sections matching Figma 150:9000 */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* 1. GENERAL Section */}
        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
          <button
            type="button"
            aria-expanded={openSections.general}
            onClick={() => toggleSection('general')}
            className="w-full flex items-center justify-between p-2.5 bg-slate-50/70 hover:bg-slate-100 transition text-left"
          >
            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
              General
            </span>
            {openSections.general ? (
              <ChevronDown className="size-3 text-slate-400" />
            ) : (
              <ChevronRight className="size-3 text-slate-400" />
            )}
          </button>

          {openSections.general && (
            <div className="p-2.5 space-y-2.5 border-t border-slate-100 text-xs">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Node Name
                </label>
                <input
                  type="text"
                  value={form.name || ''}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={form.description || ''}
                  onChange={(e) => updateField('description', e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Tags
                </label>
                <div className="flex flex-wrap gap-1 mb-1">
                  {(form.tags || []).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px]"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-blue-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Type tag & Enter..."
                  className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-[11px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* 2. CONNECTION Section */}
        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
          <button
            type="button"
            aria-expanded={openSections.connection}
            onClick={() => toggleSection('connection')}
            className="w-full flex items-center justify-between p-2.5 bg-slate-50/70 hover:bg-slate-100 transition text-left"
          >
            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
              Connection
            </span>
            {openSections.connection ? (
              <ChevronDown className="size-3 text-slate-400" />
            ) : (
              <ChevronRight className="size-3 text-slate-400" />
            )}
          </button>

          {openSections.connection && (
            <div className="p-2.5 space-y-2.5 border-t border-slate-100 text-xs">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Connection
                </label>
                <select
                  value={form.connection || ''}
                  onChange={(e) => updateField('connection', e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="PostgreSQL Production">PostgreSQL Production</option>
                  <option value="Snowflake Production">Snowflake Production</option>
                  <option value="Orders API Service">Orders API Service</option>
                  <option value="Kafka Cluster Prod">Kafka Cluster Prod</option>
                  <option value="AWS S3 Production Analytics">AWS S3 Production Analytics</option>
                  <option value="Default Connection">Default Connection</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Database / Source Name
                </label>
                <input
                  type="text"
                  value={form.database || ''}
                  onChange={(e) => updateField('database', e.target.value)}
                  placeholder="orders_db"
                  className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Schema / Path
                </label>
                <input
                  type="text"
                  value={form.schema || ''}
                  onChange={(e) => updateField('schema', e.target.value)}
                  placeholder="public"
                  className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Table / Query
                </label>
                <select
                  value={form.tableOrQuery || 'Table'}
                  onChange={(e) => updateField('tableOrQuery', e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Table">Table</option>
                  <option value="Query">Query</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  {form.tableOrQuery === 'Query' ? 'SQL Query Expression' : 'Table Name'}
                </label>
                {form.tableOrQuery === 'Query' ? (
                  <textarea
                    rows={2}
                    value={form.sqlQuery || ''}
                    onChange={(e) => updateField('sqlQuery', e.target.value)}
                    placeholder="SELECT * FROM stream WHERE ..."
                    className="w-full bg-white border border-slate-200 rounded px-2 py-1 font-mono text-[11px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                  />
                ) : (
                  <input
                    type="text"
                    value={form.table || ''}
                    onChange={(e) => updateField('table', e.target.value)}
                    placeholder="orders"
                    className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* 3. PROCESSING Section */}
        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
          <button
            type="button"
            aria-expanded={openSections.processing}
            onClick={() => toggleSection('processing')}
            className="w-full flex items-center justify-between p-2.5 bg-slate-50/70 hover:bg-slate-100 transition text-left"
          >
            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
              Processing
            </span>
            {openSections.processing ? (
              <ChevronDown className="size-3 text-slate-400" />
            ) : (
              <ChevronRight className="size-3 text-slate-400" />
            )}
          </button>

          {openSections.processing && (
            <div className="p-2.5 space-y-2.5 border-t border-slate-100 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9.5px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Batch Size
                  </label>
                  <input
                    type="number"
                    value={form.batchSize || '5000'}
                    onChange={(e) => updateField('batchSize', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[9.5px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Parallelism
                  </label>
                  <input
                    type="number"
                    value={form.parallelism || '4'}
                    onChange={(e) => updateField('parallelism', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[9.5px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Timeout (s)
                  </label>
                  <input
                    type="number"
                    value={form.timeoutSeconds || '30'}
                    onChange={(e) => updateField('timeoutSeconds', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[9.5px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Retries
                  </label>
                  <input
                    type="number"
                    value={form.retries || '3'}
                    onChange={(e) => updateField('retries', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Retry Policy
                </label>
                <select
                  value={form.retryPolicy || 'Exponential Backoff'}
                  onChange={(e) => updateField('retryPolicy', e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Exponential Backoff">Exponential Backoff</option>
                  <option value="Fixed Interval">Fixed Interval</option>
                  <option value="Immediate">Immediate Retry</option>
                  <option value="None">None</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* 4. VALIDATION Section (Toggles) */}
        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
          <button
            type="button"
            aria-expanded={openSections.validation}
            onClick={() => toggleSection('validation')}
            className="w-full flex items-center justify-between p-2.5 bg-slate-50/70 hover:bg-slate-100 transition text-left"
          >
            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
              Validation
            </span>
            {openSections.validation ? (
              <ChevronDown className="size-3 text-slate-400" />
            ) : (
              <ChevronRight className="size-3 text-slate-400" />
            )}
          </button>

          {openSections.validation && (
            <div className="p-2.5 space-y-2 border-t border-slate-100 text-xs">
              {[
                { key: 'schemaValidation', label: 'Schema Validation' },
                { key: 'requiredFields', label: 'Required Fields' },
                { key: 'nullHandling', label: 'Null Handling' },
                { key: 'duplicateCheck', label: 'Duplicate Check' },
              ].map(({ key, label }) => {
                const checked = Boolean(form[key]);
                return (
                  <div key={key} className="flex items-center justify-between py-1 border-b border-slate-50 last:border-b-0">
                    <span className="text-[11px] text-slate-700">{label}</span>
                    <button
                      type="button"
                      role="switch"
                      aria-label={label}
                      aria-checked={checked}
                      onClick={() => updateField(key, !checked)}
                      className={`w-7 h-4 flex items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                        checked ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'
                      }`}
                    >
                      <span className="size-3 rounded-full bg-white shadow-xs" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 5. MONITORING Section */}
        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
          <button
            type="button"
            aria-expanded={openSections.monitoring}
            onClick={() => toggleSection('monitoring')}
            className="w-full flex items-center justify-between p-2.5 bg-slate-50/70 hover:bg-slate-100 transition text-left"
          >
            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
              Monitoring
            </span>
            {openSections.monitoring ? (
              <ChevronDown className="size-3 text-slate-400" />
            ) : (
              <ChevronRight className="size-3 text-slate-400" />
            )}
          </button>

          {openSections.monitoring && (
            <div className="p-2.5 flex flex-wrap gap-3 border-t border-slate-100 text-[11px]">
              {[
                { key: 'enableMetrics', label: 'Enable Metrics' },
                { key: 'enableLogs', label: 'Enable Logs' },
                { key: 'alerts', label: 'Alerts' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(form[key])}
                    onChange={(e) => updateField(key, e.target.checked)}
                    className="size-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-slate-700">{label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* 6. ADVANCED Section */}
        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
          <button
            type="button"
            aria-expanded={openSections.advanced}
            onClick={() => toggleSection('advanced')}
            className="w-full flex items-center justify-between p-2.5 bg-slate-50/70 hover:bg-slate-100 transition text-left"
          >
            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
              Advanced
            </span>
            {openSections.advanced ? (
              <ChevronDown className="size-3 text-slate-400" />
            ) : (
              <ChevronRight className="size-3 text-slate-400" />
            )}
          </button>

          {openSections.advanced && (
            <div className="p-2.5 space-y-2 border-t border-slate-100 text-xs">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Partition Key
                </label>
                <input
                  type="text"
                  defaultValue="date"
                  className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Buffer Memory (MB)
                </label>
                <input
                  type="number"
                  defaultValue="256"
                  className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* 7. Validation Passed Box matching Figma node 150:9157 */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-emerald-800 text-[11px] mb-1">
            <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
            <span>Validation Passed</span>
          </div>
          <p className="text-[10.5px] text-emerald-700 leading-4">
            All required fields configured. Connection verified.
          </p>
        </div>

        {saveFeedback && (
          <div className="text-center text-xs text-emerald-600 font-medium py-1 animate-pulse">
            ✓ {saveFeedback}
          </div>
        )}
      </div>

      {/* Sticky Footer Actions matching Figma node 150:9162 */}
      <div className="p-3 border-t border-slate-200 bg-white grid grid-cols-2 gap-2 shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition shadow-xs"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition shadow-xs"
        >
          Save Node
        </button>
      </div>
    </aside>
  );
}
