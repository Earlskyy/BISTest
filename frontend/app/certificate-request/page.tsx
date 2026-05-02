'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { toast } from 'react-toastify';

declare global {
  interface Window {
    grecaptcha?: any;
    onCaptchaChange?: (token: string) => void;
  }
}

function CertificateRequestForm() {
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    address: '',
    certificate_type: '',
    birth_date: '',
    age: '',
    civil_status: '',
    purpose: '',
    contact_number: '',
    reporter_email: '',
    photo: null as File | null,
    purok_cert: null as File | null,
    sanitary_card: null as File | null,
  });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'photo' | 'purok_cert' | 'sanitary_card'
  ) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, [field]: e.target.files[0] });
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

    // Validate required attachments
    if (!formData.purok_cert) {
      toast.error('Purok Certification is required');
      return;
    }
    if (!formData.sanitary_card) {
      toast.error('Sanitary Card is required');
      return;
    }

    if (!captchaVerified) {
      toast.error('Please verify that you are not a robot');
      return;
    }

    setProcessing(true);
    setLoading(true);

    try {
      // Parallelize file uploads
      const uploadPromises: Promise<string>[] = [];

      if (formData.photo) {
        uploadPromises.push(uploadImage(formData.photo));
      } else {
        uploadPromises.push(Promise.resolve(''));
      }

      uploadPromises.push(uploadImage(formData.purok_cert));
      uploadPromises.push(uploadImage(formData.sanitary_card));

      const [photoUrl, purokCertUrl, sanitaryCardUrl] = await Promise.all(uploadPromises);

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
        purok_cert_url: purokCertUrl,
        sanitary_card_url: sanitaryCardUrl,
        reporter_email: formData.reporter_email || undefined,
        recaptcha_token: captchaToken || undefined,
        recaptcha_verified: true,
      });

      setReferenceNumber(res.data.reference_number);
      toast.success('Request submitted! Check your email for confirmation.');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to submit request');
    } finally {
      setProcessing(false);
      setLoading(false);
    }
  };

  const copyReference = () => {
    if (referenceNumber) {
      navigator.clipboard.writeText(referenceNumber);
      toast.success('Reference number copied!');
    }
  };

  // Load reCAPTCHA script and set up callback
  useEffect(() => {
    // Define callback function that will be called by reCAPTCHA
    window.onCaptchaChange = function (token: string) {
      setCaptchaToken(token);
      setCaptchaVerified(true);
    };

    // Load reCAPTCHA script if not already loaded
    if (typeof window !== 'undefined' && !window.grecaptcha) {
      const script = document.createElement('script');
      script.src = 'https://www.google.com/recaptcha/api.js';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }

    return () => {
      delete window.onCaptchaChange;
    };
  }, []);

  if (referenceNumber) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
        <div className="max-w-xl mx-auto">
          <div className="bg-white shadow-xl border border-gray-100 rounded-2xl p-8 text-center">
            <div className="text-green-600 text-5xl mb-4">✓</div>
            <h1 className="text-2xl font-bold text-gray-900">Request Submitted</h1>
            <p className="text-gray-500 mt-2 mb-6">
              A confirmation email has been sent. Save your reference number to track your document.
            </p>

            <div className="bg-gray-50 border rounded-xl p-4 mb-6">
              <p className="text-xs text-gray-500 mb-1">REFERENCE NUMBER</p>
              <p className="text-xl font-mono font-bold text-gray-900">
                {referenceNumber}
              </p>
            </div>

            <div className="flex gap-3 justify-center flex-wrap">
              <button
                onClick={copyReference}
                className="px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition shadow-sm"
              >
                Copy
              </button>

              <Link
                href="/track-document"
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
              >
                Track Document
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
      {/* Processing Modal */}
      {processing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
            <div className="mb-4">
              <div className="inline-block">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                  <div
                    className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-600 border-r-primary-600"
                    style={{
                      animation: 'spin 1s linear infinite',
                    }}
                  ></div>
                </div>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Processing Your Request</h3>
            <p className="text-gray-600 mb-4">Please wait while we process your request...</p>
            <p className="text-sm text-red-600 font-medium">⚠️ Do not close this page or refresh</p>
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-xl border border-gray-100 rounded-2xl p-8 space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Request Document
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Provide your details and required attachments to request an official barangay document.
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
                disabled={processing}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition disabled:opacity-50"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />

              <textarea
                placeholder="Address"
                required
                disabled={processing}
                rows={2}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition resize-none disabled:opacity-50"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="date"
                  disabled={processing}
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm shadow-sm disabled:opacity-50"
                  value={formData.birth_date}
                  onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Age"
                  disabled={processing}
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm shadow-sm disabled:opacity-50"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <select
                  disabled={processing}
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm shadow-sm disabled:opacity-50"
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
                  disabled={processing}
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm shadow-sm disabled:opacity-50"
                  value={formData.contact_number}
                  onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                />
              </div>

              <input
                type="email"
                placeholder="Email (for notifications)"
                disabled={processing}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition disabled:opacity-50"
                value={formData.reporter_email}
                onChange={(e) => setFormData({ ...formData, reporter_email: e.target.value })}
              />
            </div>

            {/* DOCUMENT DETAILS */}
            <div className="space-y-4 pt-4 border-t">
              <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Document Details
              </h2>

              <select
                required
                disabled={processing}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm shadow-sm disabled:opacity-50"
                value={formData.certificate_type}
                onChange={(e) => setFormData({ ...formData, certificate_type: e.target.value })}
              >
                <option value="">Document Type</option>
                <option>Barangay Clearance</option>
                <option>Certificate of Residency</option>
                <option>Certificate of Indigency</option>
                <option>Certificate of Good Moral Character</option>
              </select>

              <textarea
                placeholder="Purpose"
                rows={2}
                disabled={processing}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm shadow-sm resize-none disabled:opacity-50"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              />

              <input
                type="file"
                accept="image/*"
                disabled={processing}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-100 file:text-primary-700 hover:file:bg-primary-200 transition disabled:opacity-50"
                onChange={(e) => handleFileChange(e, 'photo')}
              />
              <p className="text-xs text-gray-500">Optional: Your photo for the document</p>
            </div>

            {/* REQUIRED ATTACHMENTS */}
            <div className="space-y-4 pt-4 border-t">
              <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                📄 Required Attachments
              </h2>
              <p className="text-xs text-gray-600">
                The following documents are required for your request to be processed.
              </p>

              <div>
                <div className="flex items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Purok Certification <span className="text-red-500">*</span>
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  required
                  disabled={processing}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 transition disabled:opacity-50"
                  onChange={(e) => handleFileChange(e, 'purok_cert')}
                />
                {formData.purok_cert && (
                  <p className="text-xs text-green-600 mt-1">✓ File selected: {formData.purok_cert.name}</p>
                )}
              </div>

              <div>
                <div className="flex items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Sanitary Card <span className="text-red-500">*</span>
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  required
                  disabled={processing}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 transition disabled:opacity-50"
                  onChange={(e) => handleFileChange(e, 'sanitary_card')}
                />
                {formData.sanitary_card && (
                  <p className="text-xs text-green-600 mt-1">✓ File selected: {formData.sanitary_card.name}</p>
                )}
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex flex-col gap-4 pt-4 border-t">
              {/* reCAPTCHA v2 */}
              <div className="flex justify-center">
                <div
                  ref={recaptchaRef}
                  className="g-recaptcha"
                  data-sitekey={process.env.NEXT_PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY}
                  data-callback="onCaptchaChange"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading || processing || !captchaVerified}
                  className="flex-1 bg-primary-600 text-white py-2.5 rounded-xl hover:bg-primary-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? 'Processing...' : loading ? 'Submitting...' : 'Submit Request'}
                </button>

                <Link
                  href="/"
                  className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl hover:bg-gray-200 transition text-center disabled:opacity-50"
                >
                  Cancel
                </Link>
              </div>
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

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function CertificateRequestPage() {
  return <CertificateRequestForm />;
}