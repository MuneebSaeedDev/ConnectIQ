import React from 'react';
import { TYPE_CATEGORIES } from '../../services/typeConversion.api';
import { TypeBadge } from './TypeBadge';

export const TypeConversionMatrix = () => {
  const categories = [
    { name: 'Text & String', types: TYPE_CATEGORIES.TEXT },
    { name: 'Numeric Formats', types: TYPE_CATEGORIES.NUMERIC },
    { name: 'Date & Time', types: TYPE_CATEGORIES.DATETIME },
    { name: 'Boolean Values', types: TYPE_CATEGORIES.BOOLEAN },
    { name: 'Structured Data', types: TYPE_CATEGORIES.STRUCTURED }
  ];

  const commonPairs = [
    { from: 'String', to: 'Integer', desc: 'Parses digit strings, removes commas/spaces' },
    { from: 'String', to: 'Decimal', desc: 'Precision casting with scale, currency cleanup' },
    { from: 'String', to: 'DateTime', desc: 'ISO-8601 parsing, timezone conversions' },
    { from: 'String', to: 'Boolean', desc: 'Truthy/falsy dictionary matching (yes/no, 1/0)' },
    { from: 'JSON/Text', to: 'JSON', desc: 'Safely parse raw payloads into JSON objects' },
    { from: 'Number', to: 'String', desc: 'Leading-zero padding, format masks' },
    { from: 'Date', to: 'String', desc: 'Custom date format serialization' },
    { from: 'Boolean', to: 'String', desc: 'Maps boolean flags to custom text outputs' }
  ];

  return (
    <div className="p-6 bg-white space-y-6">
      <div>
        <h3 className="text-sm font-bold text-[#0f172a] uppercase tracking-wider mb-2">
          Supported Type Categories
        </h3>
        <p className="text-xs text-[#64748b] mb-4">
          All data types supported by the ETL platform's conversion engine:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.name} className="p-3.5 border border-[#e2e8f0] rounded-lg bg-[#f8fafc]">
              <div className="text-xs font-semibold text-[#0f172a] mb-2">{cat.name}</div>
              <div className="flex flex-wrap gap-1.5">
                {cat.types.map((t) => (
                  <TypeBadge key={t} type={t} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-[#0f172a] uppercase tracking-wider mb-2">
          Standard Conversion Pathways
        </h3>
        <p className="text-xs text-[#64748b] mb-4">
          Pre-validated conversion routes with zero-loss fallback strategies:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {commonPairs.map((pair, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 border border-[#e2e8f0] rounded-md hover:border-[#cbd5e1] transition-colors">
              <div className="flex items-center gap-2">
                <TypeBadge type={pair.from} />
                <span className="text-[#94a3b8] text-xs">→</span>
                <TypeBadge type={pair.to} />
              </div>
              <span className="text-xs text-[#64748b]">{pair.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
