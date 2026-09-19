import React from 'react';
import {
  Type,
  HelpCircle,
  Copy,
  Calendar,
  Binary,
  ShieldAlert,
  Code,
  Tag,
} from 'lucide-react';

export default function CleaningRuleTypeBadge({ category, subType }) {
  const getCategoryConfig = (cat) => {
    switch (cat) {
      case 'Text Cleaning':
        return {
          icon: Type,
          bg: 'bg-sky-50 text-sky-700 border-sky-200',
          label: 'Text Cleaning',
        };
      case 'Null / Missing Data':
        return {
          icon: HelpCircle,
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          label: 'Null / Missing',
        };
      case 'Duplicate Handling':
        return {
          icon: Copy,
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          label: 'Duplicate Removal',
        };
      case 'Formatting':
        return {
          icon: Calendar,
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          label: 'Formatting',
        };
      case 'Data Type Cleaning':
        return {
          icon: Binary,
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
          label: 'Type Cleaning',
        };
      case 'Validation-Assisted Cleaning':
        return {
          icon: ShieldAlert,
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          label: 'Validation Assisted',
        };
      case 'Custom Rules':
        return {
          icon: Code,
          bg: 'bg-slate-100 text-slate-700 border-slate-300',
          label: 'Custom Rule',
        };
      default:
        return {
          icon: Tag,
          bg: 'bg-slate-50 text-slate-600 border-slate-200',
          label: cat || 'General',
        };
    }
  };

  const config = getCategoryConfig(category);
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border ${config.bg}`}
      title={`Category: ${category}${subType ? ` (${subType})` : ''}`}
    >
      <Icon className="w-3 h-3 shrink-0 opacity-80" />
      <span className="truncate">{config.label}</span>
    </span>
  );
}
