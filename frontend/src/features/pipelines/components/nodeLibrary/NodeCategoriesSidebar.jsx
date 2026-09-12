import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronDown,
  ChevronRight,
  Database,
  Workflow,
  ShieldCheck,
  Warehouse,
  Code,
  Layers,
  Star,
  Clock,
  TrendingUp,
  Shield,
  FileCode,
} from 'lucide-react';

const CATEGORY_ICON_MAP = {
  all: Layers,
  sources: Database,
  transformations: Workflow,
  validation: ShieldCheck,
  destinations: Warehouse,
  utilities: Code,
};

export default function NodeCategoriesSidebar({
  categories = [],
  selectedCategory = 'all',
  onSelectCategory,
  selectedSubcategory = null,
  onSelectSubcategory,
  quickFilter = null,
  onToggleQuickFilter,
}) {
  const [categorySearch, setCategorySearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({
    sources: true,
    transformations: false,
    validation: false,
    destinations: false,
    utilities: false,
  });

  const toggleExpand = (catId, e) => {
    e.stopPropagation();
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  // Filtered categories based on category search
  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return categories;
    const q = categorySearch.toLowerCase();
    return categories
      .map((cat) => {
        const catMatch = cat.name.toLowerCase().includes(q);
        const matchingSub = (cat.subcategories || []).filter((sub) =>
          sub.name.toLowerCase().includes(q)
        );
        if (catMatch || matchingSub.length > 0) {
          return {
            ...cat,
            subcategories: matchingSub.length > 0 ? matchingSub : cat.subcategories,
          };
        }
        return null;
      })
      .filter(Boolean);
  }, [categories, categorySearch]);

  return (
    <aside className="w-56 lg:w-60 bg-white border-r border-slate-200 flex flex-col shrink-0 select-none overflow-hidden h-full z-10 text-xs">
      {/* Search Categories Input */}
      <div className="p-3 border-b border-slate-100 flex flex-col gap-2 shrink-0 bg-slate-50/50">
        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
          Categories
        </span>
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={categorySearch}
            onChange={(e) => setCategorySearch(e.target.value)}
            placeholder="Search categories…"
            className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Main Categories Scroll Area */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredCategories.map((cat) => {
          const IconComp = CATEGORY_ICON_MAP[cat.id] || Layers;
          const isSelected = selectedCategory === cat.id && !selectedSubcategory;
          const isExpanded = expandedCategories[cat.id] || categorySearch.length > 0;
          const hasSub = cat.subcategories && cat.subcategories.length > 0;

          return (
            <div key={cat.id} className="space-y-0.5">
              <button
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md transition-colors text-left group ${
                  isSelected
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <IconComp
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isSelected ? 'text-indigo-600' : 'text-slate-500 group-hover:text-slate-700'
                    }`}
                  />
                  <span className="truncate text-xs">{cat.name}</span>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-1">
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isSelected ? 'bg-indigo-200/60 text-indigo-800 font-bold' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {cat.count}
                  </span>
                  {hasSub && (
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={(e) => toggleExpand(cat.id, e)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') toggleExpand(cat.id, e);
                      }}
                      className="p-0.5 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-3 h-3" />
                      ) : (
                        <ChevronRight className="w-3 h-3" />
                      )}
                    </div>
                  )}
                </div>
              </button>

              {/* Subcategories list */}
              {hasSub && isExpanded && (
                <div className="pl-6 pr-1 py-0.5 space-y-0.5 border-l border-slate-100 ml-3.5">
                  {cat.subcategories.map((sub) => {
                    const isSubSelected =
                      selectedCategory === cat.id && selectedSubcategory === sub.id;

                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => {
                          onSelectCategory(cat.id);
                          onSelectSubcategory(sub.id);
                        }}
                        className={`w-full flex items-center justify-between px-2 py-1 rounded text-[11px] transition-colors text-left ${
                          isSubSelected
                            ? 'bg-indigo-100/70 text-indigo-900 font-semibold'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <span className="truncate">{sub.name}</span>
                        <span className="text-[9px] text-slate-400 font-mono ml-1">{sub.count}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Quick Filters Section */}
        <div className="pt-4 pb-1">
          <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Quick Filters
          </div>

          <div className="space-y-0.5 mt-1">
            {/* Favorites */}
            <button
              type="button"
              onClick={() => onToggleQuickFilter('favorites')}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors text-left text-xs ${
                quickFilter === 'favorites'
                  ? 'bg-amber-50 text-amber-900 font-semibold'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Star
                className={`w-3.5 h-3.5 shrink-0 ${
                  quickFilter === 'favorites' ? 'fill-amber-400 text-amber-500' : 'text-slate-400'
                }`}
              />
              <span>Favorites</span>
            </button>

            {/* Recently Used */}
            <button
              type="button"
              onClick={() => onToggleQuickFilter('recently_used')}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors text-left text-xs ${
                quickFilter === 'recently_used'
                  ? 'bg-blue-50 text-blue-900 font-semibold'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Clock
                className={`w-3.5 h-3.5 shrink-0 ${
                  quickFilter === 'recently_used' ? 'text-blue-600' : 'text-slate-400'
                }`}
              />
              <span>Recently Used</span>
            </button>

            {/* Custom Nodes */}
            <button
              type="button"
              onClick={() => onToggleQuickFilter('custom')}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors text-left text-xs ${
                quickFilter === 'custom'
                  ? 'bg-purple-50 text-purple-900 font-semibold'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <FileCode
                className={`w-3.5 h-3.5 shrink-0 ${
                  quickFilter === 'custom' ? 'text-purple-600' : 'text-slate-400'
                }`}
              />
              <span>Custom Nodes</span>
            </button>

            {/* Enterprise Nodes */}
            <button
              type="button"
              onClick={() => onToggleQuickFilter('enterprise')}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors text-left text-xs ${
                quickFilter === 'enterprise'
                  ? 'bg-emerald-50 text-emerald-900 font-semibold'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Shield
                className={`w-3.5 h-3.5 shrink-0 ${
                  quickFilter === 'enterprise' ? 'text-emerald-600' : 'text-slate-400'
                }`}
              />
              <span>Enterprise Nodes</span>
            </button>

            {/* Most Used */}
            <button
              type="button"
              onClick={() => onToggleQuickFilter('most_used')}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors text-left text-xs ${
                quickFilter === 'most_used'
                  ? 'bg-indigo-50 text-indigo-900 font-semibold'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <TrendingUp
                className={`w-3.5 h-3.5 shrink-0 ${
                  quickFilter === 'most_used' ? 'text-indigo-600' : 'text-slate-400'
                }`}
              />
              <span>Most Used</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
