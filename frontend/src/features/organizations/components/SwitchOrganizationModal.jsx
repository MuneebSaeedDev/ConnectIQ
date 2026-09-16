import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  X,
  Building2,
  Check,
  Search,
  Plus,
  ArrowRight,
  ExternalLink,
  AlertTriangle,
  ArrowLeft,
  Shield,
  Layers,
} from 'lucide-react';
import { organizationChanged } from '../../shell/state/sessionSlice';

const ORGANIZATIONS = [
  {
    id: 'org-001',
    name: 'Acme Corp',
    fullName: 'Acme Corporation',
    initials: 'AC',
    plan: 'Enterprise',
    region: 'US East',
    pipelines: 42,
    role: 'Super Admin',
  },
  {
    id: 'org-002',
    name: 'Globex Logistics',
    fullName: 'Globex Logistics Global',
    initials: 'GL',
    plan: 'Pro',
    region: 'EU Central',
    pipelines: 18,
    role: 'Organization Admin',
  },
  {
    id: 'org-003',
    name: 'Initech Data',
    fullName: 'Initech Data Systems',
    initials: 'ID',
    plan: 'Team',
    region: 'US West',
    pipelines: 8,
    role: 'Data Engineer',
  },
  {
    id: 'org-004',
    name: 'Nova Retail',
    fullName: 'Nova Retail Analytics',
    initials: 'NR',
    plan: 'Enterprise',
    region: 'AP South',
    pipelines: 29,
    role: 'Data Analyst',
  },
];

export default function SwitchOrganizationModal({
  isOpen,
  onClose,
  onSwitchSuccess,
}) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentOrg = useSelector((state) => state.session.currentOrganization) || ORGANIZATIONS[0];

  const [search, setSearch] = useState('');
  const [pendingOrg, setPendingOrg] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        if (pendingOrg) {
          setPendingOrg(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, pendingOrg]);

  if (!isOpen) return null;

  const filteredOrgs = ORGANIZATIONS.filter((org) =>
    org.name.toLowerCase().includes(search.toLowerCase()) ||
    org.fullName.toLowerCase().includes(search.toLowerCase()) ||
    org.plan.toLowerCase().includes(search.toLowerCase()) ||
    org.role.toLowerCase().includes(search.toLowerCase())
  );

  const handleOrgClick = (org) => {
    if (org.id === currentOrg.id) {
      if (onSwitchSuccess) {
        onSwitchSuccess(`Already active in ${org.fullName}`);
      }
      onClose();
      return;
    }
    // Open confirmation popup step
    setPendingOrg(org);
  };

  const handleConfirmSwitch = () => {
    if (!pendingOrg) return;
    dispatch(organizationChanged(pendingOrg));
    if (onSwitchSuccess) {
      onSwitchSuccess(`Switched workspace to ${pendingOrg.fullName} (${pendingOrg.role})`);
    }
    setPendingOrg(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="switch-org-modal-title"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* If Confirmation Popup Step is Active */}
        {pendingOrg ? (
          <div className="flex flex-col">
            {/* Confirmation Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-amber-50/60">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h2 id="switch-org-modal-title" className="text-base font-bold text-slate-900">
                    Switch Workspace Confirmation
                  </h2>
                  <p className="text-xs text-slate-500">
                    Please confirm before switching organization context.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPendingOrg(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                aria-label="Back to organization list"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Confirmation Body */}
            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <p className="text-sm font-semibold text-slate-900 m-0">
                  Are you sure you want to switch to <span className="text-blue-600">{pendingOrg.fullName}</span>?
                </p>
                <p className="text-slate-600 leading-relaxed m-0">
                  Switching workspace context will reload your active dashboard metrics, pipeline lists, data connectors, and authorization privileges for the selected organization.
                </p>

                <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-[11px]">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Shield className="w-3.5 h-3.5 text-slate-400" />
                    <span>Role: <strong className="text-slate-800">{pendingOrg.role}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    <span>Plan: <strong className="text-slate-800">{pendingOrg.plan} ({pendingOrg.region})</strong></span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-100 text-[11px] text-blue-700">
                You will be working in the <strong>{pendingOrg.fullName}</strong> data ecosystem.
              </div>
            </div>

            {/* Confirmation Actions */}
            <div className="flex items-center justify-end gap-2 px-6 py-4 bg-slate-50 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setPendingOrg(null)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition shadow-2xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
              <button
                type="button"
                onClick={handleConfirmSwitch}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirm & Switch</span>
              </button>
            </div>
          </div>
        ) : (
          /* Normal List View */
          <div className="flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/75">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 id="switch-org-modal-title" className="text-base font-bold text-slate-900">
                    Switch Organization
                  </h2>
                  <p className="text-xs text-slate-500">
                    Select an organization workspace to switch context.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b border-slate-100 bg-white">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search organizations by name, plan, or role…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Organizations List */}
            <div className="max-h-72 overflow-y-auto p-4 space-y-2">
              {filteredOrgs.map((org) => {
                const isSelected = org.id === currentOrg.id;
                return (
                  <button
                    key={org.id}
                    type="button"
                    onClick={() => handleOrgClick(org)}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between gap-3 transition ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/50 shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {org.initials}
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 truncate">
                            {org.fullName}
                          </span>
                          {isSelected && (
                            <span className="px-1.5 py-0.2 rounded font-mono text-[9px] font-bold bg-blue-600 text-white uppercase tracking-wider">
                              Current
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <span>{org.plan}</span>
                          <span>•</span>
                          <span>{org.region}</span>
                          <span>•</span>
                          <span>{org.pipelines} pipelines</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        {org.role}
                      </span>
                      {isSelected ? (
                        <Check className="w-4 h-4 text-blue-600" />
                      ) : (
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/organizations');
                }}
                className="font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>Manage Organizations</span>
                <ExternalLink className="w-3 h-3" />
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/organizations/new');
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Organization</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
