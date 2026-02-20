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
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Certificate Requests</h2>
        <Link
          href="/staff/certificates/new"
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
        >
          ➕ Walk-in Applicant
        </Link>
      </div>

      <div className="mb-4 flex gap-4 flex-wrap">
        <input
          type="text"
          placeholder="Search by name, address, or reference..."
          className="px-4 py-2 border rounded-lg max-w-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="px-4 py-2 border rounded-lg"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="released">Released</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ref #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {requests.map((request) => (
              <tr key={request.id}>
                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">{request.reference_number || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{request.full_name}</td>
                <td className="px-6 py-4">{request.certificate_type}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    request.status === 'approved' ? 'bg-blue-100 text-blue-800' :
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
                    {request.status === 'pending' ? 'Process Certificate' : 'View'}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
