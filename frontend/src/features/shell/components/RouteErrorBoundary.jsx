import React from 'react';
import { useRouteError, Link } from 'react-router-dom';
import AppShell from './AppShell';
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react';

export default function RouteErrorBoundary() {
  const error = useRouteError();
  console.error('Application Route Error:', error);

  const is404 = error?.status === 404 || error?.statusText === 'Not Found';

  return (
    <AppShell breadcrumb={['ConnectIQ', is404 ? 'Page Not Found' : 'Application Error']}>
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="p-4 bg-slate-100 rounded-full text-slate-600 mb-4">
          <AlertTriangle className="w-10 h-10 text-amber-500" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">
          {is404 ? '404 - Page Not Found' : 'Something went wrong'}
        </h1>
        <p className="text-sm text-slate-500 max-w-md mb-6">
          {is404
            ? "The page you are looking for doesn't exist, was moved, or requires specific route parameters."
            : error?.message || 'An unexpected error occurred while loading this view.'}
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Go Back
          </button>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors shadow-xs"
          >
            <Home className="w-3.5 h-3.5" />
            Return to Dashboard
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
