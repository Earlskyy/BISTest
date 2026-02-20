'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { toast } from 'react-toastify';

interface ComplaintDetail {
  id: string;
  reporter_name: string;
  reporter_photo_url: string | null;
  incident_photo_url: string | null;
  reported_person: string | null;
  complaint_details: string;
  status: string;
  created_at: string;
  updated_at: string | null;
  reviewed_by_name: string | null;
}

export default function ComplaintDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [complaint, setComplaint] = useState<ComplaintDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const res = await api.get(`/complaints/${params.id}`);
        setComplaint(res.data);
      } catch (error) {
        toast.error('Failed to load complaint');
        router.push('/staff/complaints');
      } finally {
        setLoading(false);
      }
    };

    fetchComplaint();
  }, [params.id, router]);

  if (loading || !complaint) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-4">
        <Link href="/staff/complaints" className="text-primary-600 hover:text-primary-700">
          ← Back to Complaints
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">Complaint Details</h2>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-gray-500">Reporter Name</dt>
            <dd className="font-medium">{complaint.reporter_name}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Reported Person</dt>
            <dd className="font-medium">{complaint.reported_person || 'N/A'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Status</dt>
            <dd>
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
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Date Filed</dt>
            <dd>{new Date(complaint.created_at).toLocaleString()}</dd>
          </div>
          {complaint.reviewed_by_name && (
            <div>
              <dt className="text-gray-500">Reviewed By</dt>
              <dd>{complaint.reviewed_by_name}</dd>
            </div>
          )}
        </dl>

        <div className="mt-6">
          <dt className="text-gray-500 mb-1">Complaint Details</dt>
          <dd className="whitespace-pre-wrap text-sm text-gray-800">
            {complaint.complaint_details}
          </dd>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {complaint.reporter_photo_url && (
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-2">Reporter Photo</h3>
            <img
              src={complaint.reporter_photo_url}
              alt="Reporter"
              className="w-full h-auto rounded border"
            />
          </div>
        )}

        {complaint.incident_photo_url && (
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-2">Incident Photo / Evidence</h3>
            <img
              src={complaint.incident_photo_url}
              alt="Incident"
              className="w-full h-auto rounded border"
            />
          </div>
        )}
      </div>
    </div>
  );
}

