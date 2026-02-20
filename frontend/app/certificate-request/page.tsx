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
    const response = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
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
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <div className="text-green-600 text-6xl mb-4">✓</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted Successfully</h1>
            <p className="text-gray-600 mb-6">Save your reference number to check the status of your certificate.</p>
            <div className="bg-gray-100 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-600 mb-1">Your Reference Number</p>
              <p className="text-xl font-mono font-bold text-gray-900">{referenceNumber}</p>
            </div>
            <div className="flex gap-4 justify-center">
              <button
                onClick={copyReference}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Copy Reference Number
              </button>
              <Link
                href="/certificate-status"
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Check Status
              </Link>
              <Link
                href="/"
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Request Certificate</h1>
          <p className="text-gray-600 mb-6">Fill in your personal information. You will receive a reference number to track your request.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">Full Name *</label>
              <input
                type="text"
                id="full_name"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address *</label>
              <textarea
                id="address"
                required
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700">Birth Date</label>
                <input
                  type="date"
                  id="birth_date"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  value={formData.birth_date}
                  onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700">Age</label>
                <input
                  type="number"
                  id="age"
                  min={1}
                  max={120}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="civil_status" className="block text-sm font-medium text-gray-700">Civil Status</label>
                <select
                  id="civil_status"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  value={formData.civil_status}
                  onChange={(e) => setFormData({ ...formData, civil_status: e.target.value })}
                >
                  <option value="">Select</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Separated">Separated</option>
                  <option value="Divorced">Divorced</option>
                </select>
              </div>
              <div>
                <label htmlFor="contact_number" className="block text-sm font-medium text-gray-700">Contact Number</label>
                <input
                  type="tel"
                  id="contact_number"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  value={formData.contact_number}
                  onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label htmlFor="certificate_type" className="block text-sm font-medium text-gray-700">Certificate Type *</label>
              <select
                id="certificate_type"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                value={formData.certificate_type}
                onChange={(e) => setFormData({ ...formData, certificate_type: e.target.value })}
              >
                <option value="">Select certificate type</option>
                <option value="Barangay Clearance">Barangay Clearance</option>
                <option value="Certificate of Residency">Certificate of Residency</option>
                <option value="Certificate of Indigency">Certificate of Indigency</option>
                <option value="Certificate of Good Moral Character">Certificate of Good Moral Character</option>
              </select>
            </div>

            <div>
              <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">Purpose</label>
              <textarea
                id="purpose"
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                placeholder="e.g., Employment, Business Permit, Scholarship"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="photo" className="block text-sm font-medium text-gray-700">Photo (Optional)</label>
              <input
                type="file"
                id="photo"
                accept="image/*"
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700"
                onChange={handleFileChange}
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading || uploading}
                className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : loading ? 'Submitting...' : 'Submit Request'}
              </button>
              <Link
                href="/"
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 text-center"
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
