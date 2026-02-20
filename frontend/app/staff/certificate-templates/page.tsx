'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { toast } from 'react-toastify';

interface Template {
  id: string;
  name: string;
  certificate_type: string;
  include_profile_photo: boolean;
  created_at: string;
}

export default function CertificateTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTemplates = async () => {
    try {
      const res = await api.get('/certificate-templates');
      setTemplates(res.data.templates);
    } catch {
      toast.error('Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this template?')) return;
    try {
      await api.delete(`/certificate-templates/${id}`);
      toast.success('Template deleted');
      fetchTemplates();
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Failed to delete');
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Certificate Templates</h2>
        <Link
          href="/staff/certificate-templates/new"
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
        >
          ➕ New Template
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Certificate Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profile Photo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {templates.map((t) => (
              <tr key={t.id}>
                <td className="px-6 py-4">{t.name}</td>
                <td className="px-6 py-4">{t.certificate_type}</td>
                <td className="px-6 py-4">{t.include_profile_photo ? 'Enabled' : 'Disabled'}</td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex gap-3">
                    <Link
                      href={`/staff/certificate-templates/${t.id}/edit`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {templates.length === 0 && (
              <tr>
                <td className="px-6 py-8 text-center text-gray-500" colSpan={4}>
                  No templates yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

