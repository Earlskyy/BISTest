'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { toast } from 'react-toastify';
import Link from 'next/link';

interface Announcement {
  id: string;
  title: string;
  content: string;
  posted_by_name: string;
  created_at: string;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await api.get('/announcements');
      setAnnouncements(response.data.announcements);
    } catch (error) {
      toast.error('Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;

    try {
      await api.delete(`/announcements/${id}`);
      toast.success('Announcement deleted');
      fetchAnnouncements();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Announcements</h2>
        <Link
          href="/staff/announcements/new"
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
        >
          ➕ New Announcement
        </Link>
      </div>

      <div className="space-y-4">
        {announcements.map((announcement) => (
          <div key={announcement.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-semibold">{announcement.title}</h3>
              <div className="flex gap-2">
                <Link href={`/staff/announcements/${announcement.id}/edit`} className="text-blue-600 hover:text-blue-900 text-sm">Edit</Link>
                <button
                  onClick={() => handleDelete(announcement.id)}
                  className="text-red-600 hover:text-red-900 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
            <p className="text-gray-600 mb-4 whitespace-pre-wrap">{announcement.content}</p>
            <div className="text-sm text-gray-500">
              Posted by {announcement.posted_by_name} on{' '}
              {new Date(announcement.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
