/**
 * Centralized Export Utilities for ConnectIQ Enterprise ETL Platform.
 * Supports clean JSON, CSV, and Text report downloads with automatic timestamping.
 */

export function downloadFile(content, filename, mimeType) {
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch (err) {
    console.error('File export failed:', err);
    return false;
  }
}

export function downloadJson(data, filenamePrefix = 'connectiq-export') {
  const timestamp = new Date().toISOString().slice(0, 10);
  const jsonStr = JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      platform: 'ConnectIQ Enterprise ETL Platform',
      data,
    },
    null,
    2
  );
  return downloadFile(jsonStr, `${filenamePrefix}-${timestamp}.json`, 'application/json');
}

export function downloadCsv(headers, rows, filenamePrefix = 'connectiq-export') {
  const timestamp = new Date().toISOString().slice(0, 10);
  const headerLine = headers.map((h) => `"${String(h).replace(/"/g, '""')}"`).join(',');
  const dataLines = rows.map((row) =>
    row
      .map((val) => {
        if (val === null || val === undefined) return '""';
        return `"${String(val).replace(/"/g, '""')}"`;
      })
      .join(',')
  );
  const csvContent = [headerLine, ...dataLines].join('\n');
  return downloadFile(csvContent, `${filenamePrefix}-${timestamp}.csv`, 'text/csv;charset=utf-8;');
}

export function exportArrayAsCsv(items, filenamePrefix = 'connectiq-export', customKeys = null) {
  if (!items || !items.length) {
    return downloadJson(items, filenamePrefix);
  }
  const keys = customKeys || Object.keys(items[0]).filter((k) => typeof items[0][k] !== 'object');
  const headers = keys.map((k) => k.charAt(0).toUpperCase() + k.slice(1));
  const rows = items.map((item) => keys.map((k) => item[k]));
  return downloadCsv(headers, rows, filenamePrefix);
}
