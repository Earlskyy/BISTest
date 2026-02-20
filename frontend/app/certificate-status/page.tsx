'use client';

import { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { toast } from 'react-toastify';

export default function CertificateStatusPage() {
  const [referenceNumber, setReferenceNumber] = useState('');
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referenceNumber.trim()) {
      toast.error('Please enter your reference number');
      return;
    }
    setLoading(true);
    setError('');
    setStatus(null);
    try {
      const res = await api.get(`/certificates/status/${encodeURIComponent(referenceNumber.trim())}`);
      setStatus(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Certificate not found. Please check your reference number.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">View Certificate Status</h1>
          <p className="text-gray-600 mb-6">Enter your reference number to check the status of your certificate request.</p>

          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label htmlFor="ref" className="block text-sm font-medium text-gray-700">Reference Number</label>
              <input
                type="text"
                id="ref"
                placeholder="e.g., BIS-20240219-ABC123"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 font-mono"
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
            <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
          )}

          {status && !error && (
            <div className="mt-6 p-6 bg-gray-50 rounded-lg border">
              <h2 className="text-lg font-semibold mb-4">Certificate Details</h2>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm text-gray-500">Reference Number</dt>
                  <dd className="font-mono font-medium">{status.reference_number}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Name</dt>
                  <dd>{status.full_name}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Certificate Type</dt>
                  <dd>{status.certificate_type}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Status</dt>
                  <dd>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      status.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      status.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Date Submitted</dt>
                  <dd>{new Date(status.created_at).toLocaleDateString()}</dd>
                </div>
              </dl>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link href="/" className="text-primary-600 hover:text-primary-700">← Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
