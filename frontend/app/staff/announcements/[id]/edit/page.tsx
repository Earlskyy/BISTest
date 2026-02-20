'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { toast } from 'react-toastify';

export default function EditAnnouncementPage() {
  const params = useParams();
  const router = useRouter();
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAnnouncement();
  }, [params.id]);

  const fetchAnnouncement = async () => {
    try {
      const res = await api.get(`/announcements/${params.id}`);
      setFormData({ title: res.data.title, content: res.data.content });
    } catch (error) {
      toast.error('Failed to load announcement');
      router.push('/staff/announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/announcements/${params.id}`, formData);
      toast.success('Announcement updated');
      router.push('/staff/announcements');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div>
      <div className="mb-6">
        <Link href="/staff/announcements" className="text-primary-600 hover:text-primary-700">← Back to Announcements</Link>
      </div>
      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
        <h2 className="text-2xl font-bold mb-6">Edit Announcement</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title *</label>
            <input
              type="text"
              required
              minLength={5}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Content *</label>
            <textarea
              required
              minLength={10}
              rows={8}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <Link href="/staff/announcements" className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
