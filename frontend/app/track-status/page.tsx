'use client';

import Link from 'next/link';

export default function TrackStatusPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Track Your Request</h1>
          <p className="text-gray-600 text-lg">
            Choose what you want to track using your reference or tracking number.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Document Tracking */}
          <Link href="/track-document">
            <div className="bg-white shadow-lg rounded-2xl p-8 hover:shadow-xl transition cursor-pointer border border-gray-100">
              <div className="text-5xl mb-4">📄</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Track Document Request</h2>
              <p className="text-gray-600 mb-6">
                Track the status of your Barangay Clearance, Certificate of Residency, or other official documents.
              </p>
              <div className="flex items-center text-primary-600 font-semibold">
                View Status <span className="ml-2">→</span>
              </div>
            </div>
          </Link>

          {/* Report Tracking */}
          <Link href="/track-report">
            <div className="bg-white shadow-lg rounded-2xl p-8 hover:shadow-xl transition cursor-pointer border border-gray-100">
              <div className="text-5xl mb-4">📋</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Track Report</h2>
              <p className="text-gray-600 mb-6">
                Track the status of your complaint or incident report filed with the Barangay.
              </p>
              <div className="flex items-center text-primary-600 font-semibold">
                View Status <span className="ml-2">→</span>
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-12 text-center">
          <Link href="/" className="text-primary-600 hover:text-primary-700 font-medium">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
