'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { toast } from 'react-toastify';

interface CertificateRequest {
  id: string;
  reference_number: string;
  full_name: string;
  address: string;
  certificate_type: string;
  status: string;
  created_at: string;
}

export default function CertificatesPage() {
  const [requests, setRequests] = useState<CertificateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | 'flagged' | 'released' | ''>('pending');
  const [search, setSearch] = useState('');
  const statusButtons: Array<{
    value: '' | 'pending' | 'approved' | 'rejected' | 'flagged' | 'released';
    label: string;
    className: string;
  }> = [
    { value: 'pending', label: 'Pending', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    { value: 'approved', label: 'Approved', className: 'bg-blue-100 text-blue-800 border-blue-300' },
    { value: 'rejected', label: 'Rejected', className: 'bg-red-100 text-red-800 border-red-300' },
    { value: 'flagged', label: 'Flagged', className: 'bg-orange-100 text-orange-800 border-orange-300' },
    { value: 'released', label: 'Released', className: 'bg-green-100 text-green-800 border-green-300' },
    { value: '', label: 'All', className: 'bg-gray-100 text-gray-800 border-gray-300' },
  ];

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, search]);

  const fetchRequests = async () => {
    try {
      let url = '/certificates?limit=50';
      if (statusFilter) url += `&status=${statusFilter}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      const response = await api.get(url);
      setRequests(response.data.requests);
    } catch (error) {
      toast.error('Failed to fetch certificate requests');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Document Processing</h2>
        <Link
          href="/staff/certificates/new"
          className="inline-flex items-center justify-center rounded-xl bg-primary-600 px-4 py-2 font-medium text-white transition hover:bg-primary-700"
        >
          + Walk-in Applicant
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="mb-3 text-sm font-medium text-slate-700">Filter by Status</p>
        <div className="flex flex-wrap gap-2">
          {statusButtons.map((btn) => (
            <button
              key={btn.label}
              onClick={() => setStatusFilter(btn.value)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                statusFilter === btn.value ? `${btn.className} shadow-sm` : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-4 flex-wrap">
        <input
          type="text"
          placeholder="Search by name, address, or reference..."
          className="w-full max-w-md rounded-xl border border-slate-300 px-4 py-2.5 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ref #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {requests.map((request) => (
              <tr key={request.id}>
                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">{request.reference_number || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{request.full_name}</td>
                <td className="px-6 py-4">{request.certificate_type}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    request.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                    request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    request.status === 'flagged' ? 'bg-orange-100 text-orange-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {request.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(request.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Link
                    href={`/staff/certificates/${request.id}`}
                    className="text-primary-600 hover:text-primary-900 font-medium"
                  >
                    {request.status === 'pending' ? 'Review Request' : 'Open'}
                  </Link>
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td className="px-6 py-10 text-center text-sm text-slate-500" colSpan={6}>
                  No document requests found for the selected category.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
