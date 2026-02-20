'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { toast } from 'react-toastify';

interface Complaint {
  id: string;
  reporter_name: string;
  reported_person: string;
  complaint_details: string;
  status: string;
  created_at: string;
}

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter]);

  const fetchComplaints = async () => {
    try {
      const url = statusFilter ? `/complaints?status=${statusFilter}` : '/complaints';
      const response = await api.get(url);
      setComplaints(response.data.complaints);
    } catch (error) {
      toast.error('Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/complaints/${id}/status`, { status });
      toast.success('Status updated');
      fetchComplaints();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update status');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Complaints</h2>

      <div className="mb-4">
        <select
          className="px-4 py-2 border rounded-lg"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="validated">Validated</option>
          <option value="resolved">Resolved</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reported Person</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {complaints.map((complaint) => (
              <tr key={complaint.id}>
                <td className="px-6 py-4 whitespace-nowrap">{complaint.reported_person || 'N/A'}</td>
                <td className="px-6 py-4 max-w-md truncate">{complaint.complaint_details}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      complaint.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : complaint.status === 'validated'
                        ? 'bg-blue-100 text-blue-800'
                        : complaint.status === 'resolved'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {complaint.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {new Date(complaint.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center gap-2">
                    <select
                      value={complaint.status}
                      onChange={(e) => updateStatus(complaint.id, e.target.value)}
                      className="text-sm border rounded px-2 py-1"
                    >
                      <option value="pending">Pending</option>
                      <option value="validated">Validated</option>
                      <option value="resolved">Resolved</option>
                      <option value="archived">Archived</option>
                    </select>
                    <Link
                      href={`/staff/complaints/${complaint.id}`}
                      className="text-primary-600 hover:text-primary-900 text-xs font-medium"
                    >
                      View
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
