import React, { useState } from 'react';
import { X, Plus, FolderTree, Trash2 } from 'lucide-react';

export default function ManageCategoriesModal({
  isOpen,
  onClose,
  categories = [],
}) {
  const [catList, setCatList] = useState(categories);
  const [newCatName, setNewCatName] = useState('');

  if (!isOpen) return null;

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const newCat = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      count: 0,
      icon: 'Layers',
      subcategories: [],
    };

    setCatList((prev) => [...prev, newCat]);
    setNewCatName('');
  };

  const handleDeleteCategory = (catId) => {
    setCatList((prev) => prev.filter((c) => c.id !== catId));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="manage-cat-title"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FolderTree className="w-4 h-4" />
            </div>
            <div>
              <h2 id="manage-cat-title" className="text-base font-bold text-slate-900">
                Manage Categories
              </h2>
              <p className="text-xs text-slate-500">
                Organize the node taxonomy and hierarchy.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Add Category Form */}
          <form onSubmit={handleAddCategory} className="flex gap-2">
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="New category name…"
              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!newCatName.trim()}
              className="inline-flex items-center gap-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-semibold text-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>

          {/* Category List */}
          <div className="space-y-1.5 pt-2">
            <span className="font-semibold text-slate-700">Existing Categories</span>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {catList.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-3 bg-white hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-800">{cat.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 font-semibold">
                      {cat.count} nodes
                    </span>
                  </div>
                  {cat.id !== 'all' && (
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete category"
                      aria-label={`Delete ${cat.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 bg-slate-50 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
