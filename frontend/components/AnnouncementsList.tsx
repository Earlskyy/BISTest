'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { format } from 'date-fns';

interface Announcement {
  id: string;
  title: string;
  content: string;
  posted_by_name: string;
  created_at: string;
}

export function AnnouncementsList() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await api.get('/api/asannouncements?limit=5');
        setAnnouncements(response.data.announcements);
      } catch (error) {
        console.error('Failed to fetch announcements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading announcements...</div>;
  }

  if (announcements.length === 0) {
    return <div className="text-center py-8 text-gray-600">No announcements available</div>;
  }

  return (
    <div className="space-y-4">
      {announcements.map((announcement) => (
        <div key={announcement.id} className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-2">{announcement.title}</h3>
          <p className="text-gray-600 mb-4 whitespace-pre-wrap">{announcement.content}</p>
          <div className="text-sm text-gray-500">
            Posted by {announcement.posted_by_name} on{' '}
            {format(new Date(announcement.created_at), 'MMMM d, yyyy')}
          </div>
        </div>
      ))}
    </div>
  );
}
