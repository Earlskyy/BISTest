'use client';

import { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { toast } from 'react-toastify';

export default function CertificateRequestPage() {
  const [formData, setFormData] = useState({
    full_name: '',
    address: '',
    certificate_type: '',
    birth_date: '',
    age: '',
    civil_status: '',
    purpose: '',
    contact_number: '',
    photo: null as File | null,
  });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, photo: e.target.files[0] });
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append('image', file);
    const response = await api.post('/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let photoUrl = '';
      if (formData.photo) {
        setUploading(true);
        photoUrl = await uploadImage(formData.photo);
        setUploading(false);
      }

      const res = await api.post('/certificates/request', {
        full_name: formData.full_name,
        address: formData.address,
        certificate_type: formData.certificate_type,
        birth_date: formData.birth_date || undefined,
        age: formData.age ? parseInt(formData.age) : undefined,
        civil_status: formData.civil_status || undefined,
        purpose: formData.purpose || undefined,
        contact_number: formData.contact_number || undefined,
        photo_url: photoUrl || undefined,
      });

      setReferenceNumber(res.data.reference_number);
      toast.success('Request submitted! Save your reference number.');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to submit request');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const copyReference = () => {
    if (referenceNumber) {
      navigator.clipboard.writeText(referenceNumber);
      toast.success('Reference number copied!');
    }
  };

  if (referenceNumber) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
        <div className="max-w-xl mx-auto">
          <div className="bg-white shadow-xl border border-gray-100 rounded-2xl p-8 text-center">
            <div className="text-green-600 text-5xl mb-4">✓</div>
            <h1 className="text-2xl font-bold text-gray-900">Request Submitted</h1>
            <p className="text-gray-500 mt-2 mb-6">
              Save your reference number to track your certificate.
            </p>

            <div className="bg-gray-50 border rounded-xl p-4 mb-6">
              <p className="text-xs text-gray-500 mb-1">REFERENCE NUMBER</p>
              <p className="text-xl font-mono font-bold text-gray-900">
                {referenceNumber}
              </p>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={copyReference}
                className="px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition shadow-sm"
              >
                Copy
              </button>

              <Link
                href="/certificate-status"
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
              >
                Check Status
              </Link>

              <Link
                href="/"
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
              >
                Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">

        <div className="bg-white shadow-xl border border-gray-100 rounded-2xl p-8 space-y-8">

          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Request Certificate
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Provide your details to request an official barangay certificate.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* PERSONAL INFO */}
            <div className="space-y-4">
              <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Personal Information
              </h2>

              <input
                placeholder="Full Name"
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />

              <textarea
                placeholder="Address"
                required
                rows={2}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition resize-none"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="date"
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm shadow-sm"
                  value={formData.birth_date}
                  onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Age"
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm shadow-sm"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <select
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm shadow-sm"
                  value={formData.civil_status}
                  onChange={(e) => setFormData({ ...formData, civil_status: e.target.value })}
                >
                  <option value="">Civil Status</option>
                  <option>Single</option>
                  <option>Married</option>
                  <option>Widowed</option>
                  <option>Separated</option>
                  <option>Divorced</option>
                </select>

                <input
                  type="tel"
                  placeholder="Contact Number"
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm shadow-sm"
                  value={formData.contact_number}
                  onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                />
              </div>
            </div>

            {/* CERTIFICATE DETAILS */}
            <div className="space-y-4 pt-4 border-t">
              <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Certificate Details
              </h2>

              <select
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm shadow-sm"
                value={formData.certificate_type}
                onChange={(e) => setFormData({ ...formData, certificate_type: e.target.value })}
              >
                <option value="">Certificate Type</option>
                <option>Barangay Clearance</option>
                <option>Certificate of Residency</option>
                <option>Certificate of Indigency</option>
                <option>Certificate of Good Moral Character</option>
              </select>

              <textarea
                placeholder="Purpose"
                rows={2}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm shadow-sm resize-none"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              />

              <input
                type="file"
                accept="image/*"
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-100 file:text-primary-700 hover:file:bg-primary-200 transition"
                onChange={handleFileChange}
              />
            </div>

            {/* ACTIONS */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading || uploading}
                className="flex-1 bg-primary-600 text-white py-2.5 rounded-xl hover:bg-primary-700 transition shadow-sm"
              >
                {uploading ? 'Uploading...' : loading ? 'Submitting...' : 'Submit Request'}
              </button>

              <Link
                href="/"
                className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl hover:bg-gray-200 transition text-center"
              >
                Cancel
              </Link>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}