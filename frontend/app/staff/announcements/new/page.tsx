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
    image_url: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const uploadImage = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append('image', file);
    const res = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    return res.data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrl = formData.image_url || '';
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }
      await api.post('/announcements', {
        ...formData,
        image_url: imageUrl || undefined,
      });
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
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Image URL (optional)</label>
              <input
                type="url"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Upload Image (optional)</label>
              <input
                type="file"
                accept="image/*"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
            </div>
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
