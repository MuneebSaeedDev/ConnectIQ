import React from 'react';
import {
    Sparkles, User, Layers, Clock, ArrowRight,
    Play, CheckCircle2, Copy, FileText, Database, Webhook, Box, Cloud, Settings, Map, Code, CodeSquare, CheckSquare, Globe
} from 'lucide-react';

const TYPE_ICONS = {
  'Database': Database,
  'API': Globe,
  'File': FileText,
  'Cloud Storage': Cloud,
  'Warehouse': Box,
  'Webhook': Webhook
};

export default function TemplateCard({ template, onClickDetails, onUseTemplate, isInstantiating }) {

    const renderNodeSummary = () => {
        const hasSource = template.sourceTypes?.length > 0;
        const hasDest = template.destinationTypes?.length > 0;

        return (
            <div className="flex items-center gap-2 mb-4">
                {hasSource && (
                     <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-1 rounded text-[10px] uppercase font-bold text-slate-600">
                        {template.sourceTypes.map((type, i) => {
                            const Icon = TYPE_ICONS[type] || Box;
                            return <Icon key={i} className="size-3" title={type} />;
                        })}
                        <span className="ml-1">Source</span>
                    </div>
                )}

                {(hasSource || hasDest) && <ArrowRight className="size-3 text-slate-300 mx-1" />}

                {hasDest && (
                    <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-1 rounded text-[10px] uppercase font-bold text-slate-600">
                         {template.destinationTypes.map((type, i) => {
                             const Icon = TYPE_ICONS[type] || Box;
                             return <Icon key={i} className="size-3" title={type} />;
                         })}
                         <span className="ml-1">Destination</span>
                     </div>
                )}
            </div>
        );
    };

    return (
        <div className="group bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col h-full relative cursor-default">

            {/* Header / Badges */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex flex-wrap gap-2">
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 shadow-sm">
                        {template.category}
                    </span>
                    {template.featured && (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 shadow-sm">
                            <Sparkles className="size-3" /> Featured
                        </span>
                    )}
                </div>

                {/* Ownership Badge */}
                {template.ownership === 'system' && (
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider border border-blue-200 flex items-center gap-1">
                        <CheckCircle2 className="size-3" /> System
                    </span>
                )}
                 {template.ownership === 'organization' && (
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-wider border border-indigo-200 flex items-center gap-1">
                        <User className="size-3" /> Org
                    </span>
                )}
                {template.ownership === 'personal' && (
                     <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider border border-slate-300 flex items-center gap-1">
                         <User className="size-3" /> Personal
                     </span>
                 )}
            </div>

            {/* Content Body */}
            <div className="mb-4 flex-1 cursor-pointer" onClick={() => onClickDetails(template)}>
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
                        {template.title}
                    </h3>
                </div>

                <p className="text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                    {template.description}
                </p>

                {renderNodeSummary()}
            </div>

             {/* Tags */}
             <div className="flex flex-wrap gap-1.5 mb-5 pb-5 border-b border-slate-200">
                {template.tags.slice(0, 4).map((t) => (
                <span key={t} className="text-xs font-mono text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                    {t}
                </span>
                ))}
                {template.tags.length > 4 && (
                    <span className="text-xs font-mono text-slate-400 border border-transparent px-1 py-0.5">
                        +{template.tags.length - 4}
                    </span>
                )}
            </div>

            {/* Actions & Meta */}
            <div className="flex flex-col gap-4 mt-auto">
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1.5" title="Nodes in pipeline">
                        <Layers className="size-4 text-slate-400" /> {template.nodesCount} Nodes
                    </span>
                    <span className="flex items-center gap-1.5" title="Estimated setup time">
                        <Clock className="size-4 text-slate-400" /> ~{template.estimatedSetupTime}
                    </span>
                    <span className={`font-mono px-2 py-0.5 rounded text-[10px] uppercase font-bold border shadow-xs
                        ${template.complexity === 'Beginner' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                            template.complexity === 'Intermediate' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                            'bg-rose-50 border-rose-200 text-rose-800'}`
                    }>
                        {template.complexity}
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-1">
                    <button
                        type="button"
                        onClick={() => onClickDetails(template)}
                        className="flex items-center justify-center gap-2 py-2 px-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-sm font-semibold rounded-md shadow-sm transition-colors"
                    >
                        Preview
                    </button>
                    <button
                        type="button"
                        onClick={() => onUseTemplate(template)}
                        disabled={isInstantiating}
                        className="flex items-center justify-center gap-2 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-md shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Play className="size-4" fill="currentColor" /> {isInstantiating ? 'Creating...' : 'Use'}
                    </button>
                </div>
            </div>
        </div>
    );
}
