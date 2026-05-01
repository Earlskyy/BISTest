'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { toast } from 'react-toastify';
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';

function FileComplaintForm() {
  const router = useRouter();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [formData, setFormData] = useState({
    reporter_name: '',
    reporter_email: '',
    reported_person: '',
    complaint_details: '',
    reporter_photo: null as File | null,
    incident_photo: null as File | null,
  });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState<string | null>(null);

  const handleFileChange = (field: 'incident_photo', e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, [field]: e.target.files[0] });
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formDataObj = new FormData();
    formDataObj.append('image', file);

    const response = await api.post('/upload', formDataObj, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.url;
  };

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOpen(true);
    } catch {
      toast.error('Camera access denied or unavailable');
    }
  };

  const closeCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOpen(false);
  };

  const capturePhoto = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9));
    if (!blob) return;
    const file = new File([blob], `reporter-photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
    setFormData({ ...formData, reporter_photo: file });
    toast.success('Photo captured successfully');
    closeCamera();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.reporter_photo) {
      toast.error('Your photo is required');
      return;
    }

    setLoading(true);

    try {
      // Get reCAPTCHA token
      if (!executeRecaptcha) {
        throw new Error('reCAPTCHA not available');
      }

      const recaptchaToken = await executeRecaptcha('submit_complaint');

      // Upload files
      let reporterPhotoUrl = '';
      let incidentPhotoUrl = '';

      setUploading(true);

      reporterPhotoUrl = await uploadImage(formData.reporter_photo);

      if (formData.incident_photo) {
        incidentPhotoUrl = await uploadImage(formData.incident_photo);
      }

      setUploading(false);

      const res = await api.post('/complaints', {
        reporter_name: formData.reporter_name,
        reporter_email: formData.reporter_email,
        reported_person: formData.reported_person,
        complaint_details: formData.complaint_details,
        reporter_photo_url: reporterPhotoUrl,
        incident_photo_url: incidentPhotoUrl || undefined,
        recaptcha_token: recaptchaToken,
      });

      setTrackingNumber(res.data.tracking_number);
      toast.success('Complaint filed successfully! Check your email for confirmation.');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to file complaint');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const copyTrackingNumber = () => {
    if (trackingNumber) {
      navigator.clipboard.writeText(trackingNumber);
      toast.success('Tracking number copied!');
    }
  };

  if (trackingNumber) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
        <div className="max-w-xl mx-auto">
          <div className="bg-white shadow-xl border border-gray-100 rounded-2xl p-8 text-center">
            <div className="text-green-600 text-5xl mb-4">✓</div>
            <h1 className="text-2xl font-bold text-gray-900">Complaint Submitted</h1>
            <p className="text-gray-500 mt-2 mb-6">
              A confirmation email has been sent. Save your tracking number to check your complaint status.
            </p>

            <div className="bg-gray-50 border rounded-xl p-4 mb-6">
              <p className="text-xs text-gray-500 mb-1">TRACKING NUMBER</p>
              <p className="text-xl font-mono font-bold text-gray-900">
                {trackingNumber}
              </p>
            </div>

            <div className="flex gap-3 justify-center flex-wrap">
              <button
                onClick={copyTrackingNumber}
                className="px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition shadow-sm"
              >
                Copy
              </button>

              <a
                href="/track-report"
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition text-center"
              >
                Track Report
              </a>

              <a
                href="/"
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition text-center"
              >
                Home
              </a>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">File a Complaint</h1>
          <p className="text-gray-600 mb-6">
            Your identity and information are confidential. Only authorized staff can view your report.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="reporter_name" className="block text-sm font-medium text-gray-700">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="reporter_name"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                value={formData.reporter_name}
                onChange={(e) => setFormData({ ...formData, reporter_name: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="reporter_email" className="block text-sm font-medium text-gray-700">
                Your Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="reporter_email"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                value={formData.reporter_email}
                onChange={(e) => setFormData({ ...formData, reporter_email: e.target.value })}
                placeholder="For status notifications"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Photo <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2 mb-3">
                {!formData.reporter_photo ? (
                  <button
                    type="button"
                    onClick={openCamera}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                  >
                    📸 Take Photo
                  </button>
                ) : (
                  <div className="flex-1 bg-green-50 border border-green-300 rounded-md px-4 py-2">
                    <p className="text-sm text-green-700">✓ Photo captured</p>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Your photo must be taken using your camera (not a file upload) for verification purposes.
              </p>
            </div>

            <div>
              <label htmlFor="reported_person" className="block text-sm font-medium text-gray-700">
                Person/Entity Being Reported (Optional)
              </label>
              <input
                type="text"
                id="reported_person"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                value={formData.reported_person}
                onChange={(e) => setFormData({ ...formData, reported_person: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="complaint_details" className="block text-sm font-medium text-gray-700">
                Complaint Details <span className="text-red-500">*</span>
              </label>
              <textarea
                id="complaint_details"
                required
                rows={6}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                value={formData.complaint_details}
                onChange={(e) => setFormData({ ...formData, complaint_details: e.target.value })}
                placeholder="Please provide detailed information about the incident including date, time, location, and what happened..."
              />
            </div>

            <div>
              <label htmlFor="incident_photo" className="block text-sm font-medium text-gray-700">
                Photo/Evidence of Incident (Optional)
              </label>
              <input
                type="file"
                id="incident_photo"
                accept="image/*"
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                onChange={(e) => handleFileChange('incident_photo', e)}
              />
              {formData.incident_photo && (
                <p className="text-xs text-green-600 mt-1">✓ File selected: {formData.incident_photo.name}</p>
              )}
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

            <p className="text-xs text-gray-500 text-center">
              Protected by reCAPTCHA. This site is protected by reCAPTCHA and the Google{' '}
              <a href="https://policies.google.com/privacy" className="underline">
                Privacy Policy
              </a>{' '}
              and{' '}
              <a href="https://policies.google.com/terms" className="underline">
                Terms of Service
              </a>{' '}
              apply.
            </p>
          </form>
        </div>
      </div>

      {cameraOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-5 shadow-2xl">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Take Your Photo</h3>
            <video
              ref={videoRef}
              className="mb-4 w-full rounded-lg bg-black"
              style={{ maxHeight: '420px' }}
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={capturePhoto}
                className="flex-1 rounded-md bg-blue-600 py-2 px-4 text-white hover:bg-blue-700"
              >
                Capture Photo
              </button>
              <button
                type="button"
                onClick={closeCamera}
                className="flex-1 rounded-md bg-gray-200 py-2 px-4 text-gray-700 hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function FileComplaintPage() {
  const recaptchaKey = process.env.NEXT_PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY;

  if (!recaptchaKey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl p-8">
          <p className="text-red-600 text-center">
            reCAPTCHA is not configured. Please contact the administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <GoogleReCaptchaProvider reCaptchaKey={recaptchaKey}>
      <FileComplaintForm />
    </GoogleReCaptchaProvider>
  );
}
