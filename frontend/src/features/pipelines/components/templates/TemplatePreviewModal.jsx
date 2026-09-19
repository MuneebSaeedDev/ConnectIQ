import React from 'react';
import {
  Sparkles, CheckCircle2, User, Clock, Copy, Play, ArrowRight,
  FolderOpen, Layers, Map, Warehouse, Database, Code, Shield, Cloud, FileText, Globe, Box, Lock, CheckSquare, Webhook
} from 'lucide-react';

const ICONS = {
    'Database': Database,
    'FolderOpen': FolderOpen,
    'Map': Map,
    'Warehouse': Warehouse,
    'Code': Code,
    'Shield': Shield,
    'Cloud': Cloud,
    'FileText': FileText,
    'Globe': Globe,
    'Box': Box,
    'Lock': Lock,
    'CheckSquare': CheckSquare,
    'Webhook': Webhook
};

export default function TemplatePreviewModal({ template, onClose, onUseTemplate, isInstantiating }) {
    if (!template) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pb-20 sm:pb-6" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} aria-hidden="true" />

            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200">

                {/* Modal Header */}
                <div className="px-6 py-5 border-b border-slate-200 flex items-start justify-between bg-slate-50/80">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 shadow-sm uppercase tracking-wider">
                                {template.category}
                            </span>
                            {template.featured && (
                                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1 shadow-sm uppercase tracking-wider">
                                    <Sparkles className="size-3" /> Featured
                                </span>
                            )}
                            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-sm uppercase tracking-wider flex items-center gap-1
                                ${template.ownership === 'system' ? 'bg-slate-200 text-slate-800' : 'bg-indigo-100 text-indigo-800'}`}>
                                {template.ownership === 'system' ? <CheckCircle2 className="size-3" /> : <User className="size-3" />}
                                {template.ownership}
                            </span>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{template.title}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <span className="sr-only">Close display</span>
                        <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto bg-white">
                    <div className="p-6 md:p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">

                            {/* Left Column: Description & Visual Preview */}
                            <div className="lg:col-span-8 space-y-8">
                                <section>
                                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-3">About Template</h3>
                                    <p className="text-[15px] text-slate-700 leading-relaxed max-w-3xl">
                                        {template.description}
                                    </p>
                                </section>

                                <section>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Pipeline Architecture</h3>
                                        <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 shadow-sm flex items-center gap-1.5">
                                            <Layers className="size-3.5" /> {template.nodesCount} Nodes Total
                                        </span>
                                    </div>

                                    {/* Visual Preview */}
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 flex items-center justify-center min-h-[300px] relative overflow-x-auto shadow-inner">
                                        {/* Grid Background */}
                                        <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#94A3B8 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

                                        <div className="relative flex items-center gap-6 z-10 min-w-max p-4">
                                            {template.pipelinePreview?.map((node, i) => {
                                                const Icon = ICONS[node.icon] || Box;
                                                const isFirst = i === 0;
                                                const isLast = i === template.pipelinePreview.length - 1;

                                                // Colorize based on node type
                                                let themeColor = 'blue';
                                                if (node.type === 'destination') themeColor = 'emerald';
                                                else if (node.type === 'transformation' || node.type === 'mapping') themeColor = 'amber';
                                                else if (node.type === 'validation') themeColor = 'rose';

                                                return (
                                                    <React.Fragment key={node.id}>
                                                        <div className={`bg-white px-5 py-4 rounded-xl border-2 border-${themeColor}-200 shadow-sm flex flex-col items-center justify-center min-w-[140px] relative hover:border-${themeColor}-400 transition-colors`}>
                                                            <div className={`size-10 rounded-lg bg-${themeColor}-50 text-${themeColor}-600 flex items-center justify-center mb-3 shadow-xs`}>
                                                                <Icon className="size-5" />
                                                            </div>
                                                            <div className={`text-[10px] font-bold text-${themeColor}-600 uppercase tracking-wider mb-1`}>
                                                                {node.type}
                                                            </div>
                                                            <div className="text-sm font-semibold text-slate-800 text-center leading-tight">
                                                                {node.label}
                                                            </div>
                                                        </div>
                                                        {!isLast && (
                                                            <div className="flex bg-slate-200 h-[2px] w-12 items-center justify-end relative shadow-sm">
                                                                <ArrowRight className="size-4 text-slate-400 absolute -right-2" />
                                                            </div>
                                                        )}
                                                    </React.Fragment>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-3 text-center">
                                        This is a conceptual preview. Configuration and mapping details are accessed in the Pipeline Builder.
                                    </p>
                                </section>
                            </div>

                            {/* Right Column: Metadata */}
                            <div className="lg:col-span-4 space-y-6">
                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm">
                                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4 border-b border-slate-200 pb-2">Properties</h3>

                                    <dl className="space-y-4">
                                        <div>
                                            <dt className="text-[11px] font-semibold text-slate-500 uppercase mb-1">Author</dt>
                                            <dd className="text-sm font-medium text-slate-900 flex items-center gap-1.5">
                                                {template.author === 'ConnectIQ Official' ? (
                                                    <><CheckCircle2 className="size-4 text-blue-600" /> {template.author}</>
                                                ) : (
                                                    <><User className="size-4 text-slate-400" /> {template.author}</>
                                                )}
                                            </dd>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <dt className="text-[11px] font-semibold text-slate-500 uppercase mb-1">Version</dt>
                                                <dd className="text-sm font-mono font-medium text-slate-900 bg-slate-200/50 inline-block px-1.5 py-0.5 rounded shadow-xs">{template.version}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-[11px] font-semibold text-slate-500 uppercase mb-1">Last Updated</dt>
                                                <dd className="text-sm font-medium text-slate-900">{new Date(template.lastUpdated).toLocaleDateString()}</dd>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <dt className="text-[11px] font-semibold text-slate-500 uppercase mb-1">Complexity</dt>
                                                <dd className={`text-sm font-bold w-fit px-2 py-0.5 rounded border shadow-xs
                                                    ${template.complexity === 'Beginner' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                                                    template.complexity === 'Intermediate' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                                                    'bg-rose-50 border-rose-200 text-rose-700'}`
                                                }>
                                                    {template.complexity}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-[11px] font-semibold text-slate-500 uppercase mb-1">Est. Setup</dt>
                                                <dd className="text-sm font-medium text-slate-900 flex items-center gap-1.5">
                                                    <Clock className="size-4 text-slate-400" /> {template.estimatedSetupTime}
                                                </dd>
                                            </div>
                                        </div>
                                        <div>
                                            <dt className="text-[11px] font-semibold text-slate-500 uppercase mb-1">Usage Activity</dt>
                                            <dd className="text-sm font-medium text-slate-900 flex items-center gap-2">
                                                <div className="w-full bg-slate-200 rounded-full h-1.5 max-w-[120px]">
                                                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${Math.min((template.usageCount / 1000) * 100, 100)}%` }}></div>
                                                </div>
                                                <span className="text-xs text-slate-500">{template.usageCount.toLocaleString()} deploys</span>
                                            </dd>
                                        </div>
                                    </dl>
                                </div>

                                <div>
                                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-3">Tags</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {template.tags.map((t) => (
                                            <span key={t} className="text-xs font-mono font-medium text-slate-700 bg-white border border-slate-300 px-2.5 py-1 rounded shadow-sm hover:border-slate-400 cursor-default transition-colors">
                                                #{t}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="px-6 py-5 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
                    <div className="w-full sm:w-auto">
                        {template.status === 'archived' && (
                            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-md border border-rose-200">
                                This template is archived and cannot be used directly.
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 flex-1 sm:flex-none text-sm font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-900 shadow-sm transition-colors focus:ring-2 focus:ring-slate-200 focus:outline-none"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => onUseTemplate(template)}
                            disabled={isInstantiating || template.status === 'archived'}
                            className="px-6 py-2.5 flex-1 sm:flex-none flex items-center justify-center gap-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:outline-none"
                        >
                            <Play className="size-4" fill="currentColor" />
                            {isInstantiating ? 'Building Pipeline...' : 'Use This Template'}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
