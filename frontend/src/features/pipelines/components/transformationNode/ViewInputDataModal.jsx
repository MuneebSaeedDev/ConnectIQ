import React from 'react';
import { Eye, X, Table } from 'lucide-react';

export default function ViewInputDataModal({
  isOpen,
  dataset = {},
  onClose,
}) {
  if (!isOpen) return null;

  const sampleRows = [
    {
      customer_id: 'CUS-00482910',
      order_date: '2024-01-15T08:32:00Z',
      email: '[EMAIL_REDACTED]',
      total_amount: '"1499.99"',
      status: 'COMPLETED',
    },
    {
      customer_id: 'CUS-00482911',
      order_date: '2024-01-15T08:35:12Z',
      email: '[EMAIL_REDACTED]',
      total_amount: '"850.50"',
      status: 'PENDING',
    },
    {
      customer_id: 'CUS-00482912',
      order_date: '2024-01-15T09:12:44Z',
      email: '[EMAIL_REDACTED]',
      total_amount: '"249.00"',
      status: 'COMPLETED',
    },
    {
      customer_id: 'CUS-00482913',
      order_date: '2024-01-15T09:44:02Z',
      email: 'NULL',
      total_amount: '"3200.00"',
      status: 'PROCESSING',
    },
    {
      customer_id: 'CUS-00482914',
      order_date: '2024-01-15T10:15:30Z',
      email: '[EMAIL_REDACTED]',
      total_amount: '"129.99"',
      status: 'INVALID_CODE',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <Eye className="size-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Input Dataset Preview: {dataset.dataset || 'orders_filtered'}
              </h3>
              <p className="text-xs text-slate-500">
                Upstream schema inherited from {dataset.previousNode || 'Filter Node'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="border border-slate-200 rounded-lg overflow-x-auto max-h-80">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-sans font-semibold sticky top-0">
                <tr>
                  <th scope="col" className="px-4 py-2.5">customer_id</th>
                  <th scope="col" className="px-4 py-2.5">order_date</th>
                  <th scope="col" className="px-4 py-2.5">email</th>
                  <th scope="col" className="px-4 py-2.5">total_amount</th>
                  <th scope="col" className="px-4 py-2.5">status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
                {sampleRows.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50/70">
                    <td className="px-4 py-2.5 text-slate-900 font-medium">{r.customer_id}</td>
                    <td className="px-4 py-2.5">{r.order_date}</td>
                    <td className="px-4 py-2.5">{r.email}</td>
                    <td className="px-4 py-2.5">{r.total_amount}</td>
                    <td className="px-4 py-2.5">{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Showing top 5 sample records from upstream buffer</span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
