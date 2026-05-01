'use client';

import { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useSearchParams } from 'next/navigation';

interface DocumentStatus {
  id: string;
  reference_number: string;
  full_name: string;
  address: string;
  certificate_type: string;
  status: string;
  rejection_reason?: string | null;
  flagged_reason?: string | null;
  created_at: string;
  updated_at: string;
}

export default function TrackDocumentPage() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get('ref') || '';

  const [referenceNumber, setReferenceNumber] = useState(initialRef);
  const [status, setStatus] = useState<DocumentStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatus(null);
    setLoading(true);

    try {
      const response = await api.get(`/certificates/status/${referenceNumber}`);
      setStatus(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Document not found. Please check your reference number.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (stat: string) => {
    switch (stat) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'flagged':
        return 'bg-orange-100 text-orange-800';
      case 'released':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (stat: string) => {
    switch (stat) {
      case 'pending':
        return 'Pending Review';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'flagged':
        return 'Flagged for Review';
      case 'released':
        return 'Released';
      default:
        return stat;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Document Request</h1>
          <p className="text-gray-600 mb-6">
            Enter your reference number to check the status of your document request.
          </p>

          <form onSubmit={handleSearch} className="space-y-4 mb-8">
            <div>
              <label htmlFor="ref" className="block text-sm font-medium text-gray-700">
                Reference Number
              </label>
              <input
                type="text"
                id="ref"
                placeholder="e.g., BIS-20260501-ABC123"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 font-mono"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
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
                <h2 className="text-lg font-semibold mb-4">Document Details</h2>
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600 font-medium">Reference Number:</dt>
                    <dd className="font-mono font-medium">{status.reference_number}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600 font-medium">Applicant Name:</dt>
                    <dd>{status.full_name}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600 font-medium">Document Type:</dt>
                    <dd>{status.certificate_type}</dd>
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

              {status.status === 'released' && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium">
                    ✓ Your document is ready for pickup at the Barangay office. Please bring your reference
                    number.
                  </p>
                </div>
              )}

              {status.status === 'approved' && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 font-medium">
                    Your request has been approved! Please proceed to the Barangay office for physical
                    verification and document release.
                  </p>
                </div>
              )}

              {status.status === 'rejected' && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 font-medium">
                    Your request was rejected. Please contact the Barangay office for more information or file a
                    new request.
                  </p>
                  {status.rejection_reason && (
                    <p className="mt-2 text-sm text-red-700">
                      Reason: {status.rejection_reason}
                    </p>
                  )}
                </div>
              )}

              {status.status === 'flagged' && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-orange-800 font-medium">
                    Your request has been flagged for review. Please contact the Barangay office for details or
                    resubmit if necessary.
                  </p>
                  {status.flagged_reason && (
                    <p className="mt-2 text-sm text-orange-700">
                      Required Action: {status.flagged_reason}
                    </p>
                  )}
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
