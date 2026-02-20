'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { toast } from 'react-toastify';

export default function NewAnnouncementPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/announcements', formData);
      toast.success('Announcement posted successfully');
      router.push('/staff/announcements');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to post announcement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Link href="/staff/announcements" className="text-primary-600 hover:text-primary-700">← Back to Announcements</Link>
      </div>
      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
        <h2 className="text-2xl font-bold mb-6">New Announcement</h2>
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
              placeholder="Announcement title"
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
              placeholder="Enter announcement content..."
            />
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Posting...' : 'Post Announcement'}
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
