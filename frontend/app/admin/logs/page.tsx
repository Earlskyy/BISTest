'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { format } from 'date-fns';

interface Log {
  id: string;
  user_name: string;
  user_email: string;
  action: string;
  details: any;
  ip_address: string;
  timestamp: string;
}

export default function SystemLogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const fetchLogs = async () => {
    try {
      const response = await api.get(`/system/logs?page=${page}&limit=50`);
      setLogs(response.data.logs);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading logs...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">System Logs</h2>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(new Date(log.timestamp), 'MMM d, yyyy HH:mm:ss')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {log.user_name || 'N/A'}
                    {log.user_email && (
                      <div className="text-xs text-gray-500">{log.user_email}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.action}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.ip_address || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-w-md">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex justify-between">
        <button
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
        >
          Previous
        </button>
        <span className="py-2">Page {page}</span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={logs.length < 50}
          className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
