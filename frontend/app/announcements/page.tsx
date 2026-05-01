'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

interface Announcement {
  id: string;
  title: string;
  content: string;
  image_url?: string | null;
  posted_by_name?: string;
  created_at: string;
}

export default function PublicAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/announcements?limit=50');
        setAnnouncements(res.data.announcements || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 py-8">
      <div className="mx-auto max-w-3xl px-4">
        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900">Barangay Announcements</h1>
            <Link href="/" className="text-sm font-medium text-primary-600 hover:text-primary-700">
              Back to Home
            </Link>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Stay informed with updates, advisories, and community notices.
          </p>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white p-8 text-center text-slate-500 shadow-sm">Loading announcements...</div>
        ) : announcements.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center text-slate-500 shadow-sm">No announcements yet.</div>
        ) : (
          <div className="space-y-5">
            {announcements.map((announcement) => (
              <article key={announcement.id} className="overflow-hidden rounded-2xl bg-white shadow-sm">
                <div className="px-5 pt-5">
                  <h2 className="text-xl font-semibold text-slate-900">{announcement.title}</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {announcement.posted_by_name ? `Posted by ${announcement.posted_by_name} • ` : ''}
                    {new Date(announcement.created_at).toLocaleString()}
                  </p>
                </div>
                {announcement.image_url && (
                  <img
                    src={announcement.image_url}
                    alt={announcement.title}
                    className="mt-4 h-auto max-h-[520px] w-full object-cover"
                  />
                )}
                <div className="px-5 py-5">
                  <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{announcement.content}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
