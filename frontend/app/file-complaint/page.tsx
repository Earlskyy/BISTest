'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { toast } from 'react-toastify';

export default function FileComplaintPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    reporter_name: '',
    reported_person: '',
    complaint_details: '',
    reporter_photo: null as File | null,
    incident_photo: null as File | null,
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (field: 'reporter_photo' | 'incident_photo', e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, [field]: e.target.files[0] });
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let reporterPhotoUrl = '';
      let incidentPhotoUrl = '';

      if (formData.reporter_photo) {
        setUploading(true);
        reporterPhotoUrl = await uploadImage(formData.reporter_photo);
        setUploading(false);
      }

      if (formData.incident_photo) {
        setUploading(true);
        incidentPhotoUrl = await uploadImage(formData.incident_photo);
        setUploading(false);
      }

      await api.post('/complaints', {
        reporter_name: formData.reporter_name,
        reported_person: formData.reported_person,
        complaint_details: formData.complaint_details,
        reporter_photo_url: reporterPhotoUrl,
        incident_photo_url: incidentPhotoUrl,
      });

      toast.success('Complaint filed successfully! Your report will be reviewed.');
      router.push('/');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to file complaint');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">File a Complaint</h1>
          <p className="text-gray-600 mb-6">
            Your identity will be kept confidential. Only authorized staff can view your information.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="reporter_name" className="block text-sm font-medium text-gray-700">
                Your Name *
              </label>
              <input
                type="text"
                id="reporter_name"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                value={formData.reporter_name}
                onChange={(e) => setFormData({ ...formData, reporter_name: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="reported_person" className="block text-sm font-medium text-gray-700">
                Reported Person/Entity (Optional)
              </label>
              <input
                type="text"
                id="reported_person"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                value={formData.reported_person}
                onChange={(e) => setFormData({ ...formData, reported_person: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="complaint_details" className="block text-sm font-medium text-gray-700">
                Complaint Details *
              </label>
              <textarea
                id="complaint_details"
                required
                rows={6}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                value={formData.complaint_details}
                onChange={(e) => setFormData({ ...formData, complaint_details: e.target.value })}
                placeholder="Please provide detailed information about the incident..."
              />
            </div>

            <div>
              <label htmlFor="reporter_photo" className="block text-sm font-medium text-gray-700">
                Your Photo (Optional)
              </label>
              <input
                type="file"
                id="reporter_photo"
                accept="image/*"
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                onChange={(e) => handleFileChange('reporter_photo', e)}
              />
            </div>

            <div>
              <label htmlFor="incident_photo" className="block text-sm font-medium text-gray-700">
                Incident Photo/Evidence (Optional)
              </label>
              <input
                type="file"
                id="incident_photo"
                accept="image/*"
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                onChange={(e) => handleFileChange('incident_photo', e)}
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading || uploading}
                className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : loading ? 'Submitting...' : 'Submit Complaint'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/')}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
