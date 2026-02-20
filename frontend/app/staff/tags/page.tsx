'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { toast } from 'react-toastify';
import Link from 'next/link';

interface Tag {
  id: string;
  name: string;
  description: string;
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await api.get('/tags');
      setTags(response.data);
    } catch (error) {
      toast.error('Failed to fetch tags');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Resident Tags</h2>

      <div className="grid md:grid-cols-3 gap-4">
        {tags.map((tag) => (
          <div key={tag.id} className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">{tag.name}</h3>
            <p className="text-gray-600 text-sm mb-4">{tag.description || 'No description'}</p>
            <Link
              href={`/staff/tags/${tag.id}`}
              className="text-primary-600 hover:text-primary-700 text-sm"
            >
              View Residents →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
