'use client';

import { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useSearchParams } from 'next/navigation';

interface ComplaintStatus {
  id: string;
  tracking_number: string;
  reporter_name: string;
  status: string;
  reason_for_update: string | null;
  created_at: string;
  updated_at: string;
}

export default function TrackComplaintPage() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get('ref') || '';

  const [trackingNumber, setTrackingNumber] = useState(initialRef);
  const [status, setStatus] = useState<ComplaintStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatus(null);
    setLoading(true);

    try {
      const response = await api.get(`/complaints/track/${trackingNumber}`);
      setStatus(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Complaint not found. Please check your tracking number.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (stat: string) => {
    switch (stat) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (stat: string) => {
    switch (stat) {
      case 'submitted':
        return 'Submitted';
      case 'under_review':
        return 'Under Review';
      case 'resolved':
        return 'Resolved';
      case 'closed':
        return 'Closed';
      default:
        return stat;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Report</h1>
          <p className="text-gray-600 mb-6">
            Enter your tracking number to check the status of your complaint or incident report.
          </p>

          <form onSubmit={handleSearch} className="space-y-4 mb-8">
            <div>
              <label htmlFor="tracking" className="block text-sm font-medium text-gray-700">
                Tracking Number
              </label>
              <input
                type="text"
                id="tracking"
                placeholder="e.g., BIS-20260501-XYZ789"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 font-mono"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Check Status'}
            </button>
          </form>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {status && !error && (
            <div className="space-y-6">
              <div className="p-6 bg-gray-50 rounded-lg border">
                <h2 className="text-lg font-semibold mb-4">Complaint Details</h2>
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600 font-medium">Tracking Number:</dt>
                    <dd className="font-mono font-medium">{status.tracking_number}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600 font-medium">Reporter:</dt>
                    <dd>{status.reporter_name}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600 font-medium">Status:</dt>
                    <dd>
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          status.status
                        )}`}
                      >
                        {getStatusLabel(status.status)}
                      </span>
                    </dd>
                  </div>
                  {status.reason_for_update && (
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600 font-medium">Update Details:</dt>
                      <dd className="text-right">{status.reason_for_update}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600 font-medium">Date Submitted:</dt>
                    <dd>{new Date(status.created_at).toLocaleDateString()}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600 font-medium">Last Updated:</dt>
                    <dd>{new Date(status.updated_at).toLocaleDateString()}</dd>
                  </div>
                </dl>
              </div>

              {status.status === 'resolved' && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium">
                    ✓ Your complaint has been resolved. Thank you for reporting.
                  </p>
                </div>
              )}

              {status.status === 'under_review' && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 font-medium">
                    Your complaint is currently being reviewed. We will update you soon.
                  </p>
                </div>
              )}

              {status.status === 'closed' && (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-gray-800 font-medium">
                    This complaint has been closed. If you have further concerns, please file a new report.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 text-center">
            <Link href="/track-status" className="text-primary-600 hover:text-primary-700 font-medium">
              ← Back to Tracking
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
