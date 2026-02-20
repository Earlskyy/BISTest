'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { toast } from 'react-toastify';

interface BlotterRecord {
  id: string;
  complainant_name: string;
  respondent_name: string;
  incident_details: string;
  status: string;
  created_at: string;
}

export default function BlotterPage() {
  const [records, setRecords] = useState<BlotterRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    complainant_name: '',
    respondent_name: '',
    incident_details: '',
    status: 'open',
  });

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await api.get('/blotter?limit=50');
      setRecords(response.data.records);
    } catch (error) {
      toast.error('Failed to fetch blotter records');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/blotter', formData);
      toast.success('Blotter record added');
      setShowForm(false);
      setFormData({ complainant_name: '', respondent_name: '', incident_details: '', status: 'open' });
      fetchRecords();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add record');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Blotter Records</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
        >
          ➕ Add Record
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Add Blotter Record</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Complainant Name *</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  value={formData.complainant_name}
                  onChange={(e) => setFormData({ ...formData, complainant_name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Respondent Name</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  value={formData.respondent_name}
                  onChange={(e) => setFormData({ ...formData, respondent_name: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Incident Details *</label>
              <textarea
                required
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                value={formData.incident_details}
                onChange={(e) => setFormData({ ...formData, incident_details: e.target.value })}
              />
            </div>
            <div className="flex gap-4">
              <button type="submit" className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                Add Record
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Complainant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Respondent</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {records.map((record) => (
              <tr key={record.id}>
                <td className="px-6 py-4 whitespace-nowrap">{record.complainant_name}</td>
                <td className="px-6 py-4">{record.respondent_name || 'N/A'}</td>
                <td className="px-6 py-4 max-w-md truncate">{record.incident_details}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                    {record.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(record.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
