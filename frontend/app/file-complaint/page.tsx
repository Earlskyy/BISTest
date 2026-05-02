'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { toast } from 'react-toastify';

// Extend Window interface for reCAPTCHA
declare global {
  interface Window {
    grecaptcha?: any;
    onCaptchaChange?: (token: string) => void;
    captchaVerified?: boolean;
  }
}

function FileComplaintForm() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recaptchaRef = useRef<HTMLDivElement>(null);

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
  const [videoReady, setVideoReady] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

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
      setVideoReady(false);
      setCameraOpen(true); // Show modal immediately
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          facingMode: 'user',
        },
        audio: false,
      });

      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().then(() => {
            setVideoReady(true);
          }).catch((err) => {
            console.error('Play error:', err);
            setVideoReady(true);
          });
        };
      }

      // Fallback: Set videoReady after 2 seconds if not already set
      setTimeout(() => {
        setVideoReady((prev) => prev ? prev : true);
      }, 2000);
    } catch (error: any) {
      console.error('Camera error:', error);
      setCameraOpen(false);
      toast.error('Camera access denied or unavailable: ' + error.message);
    }
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
    setVideoReady(false);
    setCameraOpen(false);
  };

  const capturePhoto = async () => {
    if (!videoRef.current) return;

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      
      // Use actual video dimensions
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(video, 0, 0);
      
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/jpeg', 0.85);
      });

      if (!blob) {
        toast.error('Failed to capture photo');
        return;
      }

      const file = new File([blob], `reporter-photo-${Date.now()}.jpg`, {
        type: 'image/jpeg',
      });

      setFormData({ ...formData, reporter_photo: file });
      toast.success('Photo captured successfully');
      closeCamera();
    } catch (error) {
      console.error('Capture error:', error);
      toast.error('Failed to capture photo');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.reporter_photo) {
      toast.error('Your photo is required');
      return;
    }

    if (!captchaVerified) {
      toast.error('Please verify that you are not a robot');
      return;
    }

    setProcessing(true);
    setLoading(true);

    try {
      // Parallelize image uploads
      const uploadPromises: Promise<string>[] = [];
      uploadPromises.push(uploadImage(formData.reporter_photo));

      if (formData.incident_photo) {
        uploadPromises.push(uploadImage(formData.incident_photo));
      }

      const [reporterPhotoUrl, incidentPhotoUrl] = await Promise.all(uploadPromises);

      const res = await api.post('/complaints', {
        reporter_name: formData.reporter_name,
        reporter_email: formData.reporter_email,
        reported_person: formData.reported_person,
        complaint_details: formData.complaint_details,
        reporter_photo_url: reporterPhotoUrl,
        incident_photo_url: incidentPhotoUrl || undefined,
        recaptcha_token: captchaToken || undefined,
        recaptcha_verified: true,
      });

      setTrackingNumber(res.data.tracking_number);
      toast.success('Complaint filed successfully! Check your email for confirmation.');
    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error(error.response?.data?.error || 'Failed to file complaint');
    } finally {
      setProcessing(false);
      setLoading(false);
    }
  };

  const copyTrackingNumber = () => {
    if (trackingNumber) {
      navigator.clipboard.writeText(trackingNumber);
      toast.success('Tracking number copied!');
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
            <p className="text-gray-600 mb-4">Please wait while we submit your complaint...</p>
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
                disabled={processing}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 disabled:opacity-50"
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
                disabled={processing}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 disabled:opacity-50"
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
                    disabled={processing}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    📸 Take Photo
                  </button>
                ) : (
                  <div className="flex-1 flex items-center gap-3 bg-green-50 border border-green-300 rounded-md px-4 py-2">
                    <p className="text-sm text-green-700">✓ Photo captured</p>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, reporter_photo: null })}
                      disabled={processing}
                      className="text-sm text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                    >
                      Retake
                    </button>
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
                disabled={processing}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 disabled:opacity-50"
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
                disabled={processing}
                rows={6}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 disabled:opacity-50"
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
                disabled={processing}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 disabled:opacity-50"
                onChange={(e) => handleFileChange('incident_photo', e)}
              />
              {formData.incident_photo && (
                <p className="text-xs text-green-600 mt-1">✓ File selected: {formData.incident_photo.name}</p>
              )}
            </div>

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
                className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? 'Processing...' : loading ? 'Submitting...' : 'Submit Complaint'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/')}
                disabled={processing}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 disabled:opacity-50"
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

      {/* Camera Modal */}
      {cameraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-5 shadow-2xl">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Take Your Photo</h3>
            
            {!videoReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                <div className="text-center">
                  <div className="inline-block">
                    <div className="relative w-12 h-12">
                      <div className="absolute inset-0 rounded-full border-4 border-gray-300"></div>
                      <div
                        className="absolute inset-0 rounded-full border-4 border-transparent border-t-white border-r-white"
                        style={{
                          animation: 'spin 1s linear infinite',
                        }}
                      ></div>
                    </div>
                  </div>
                  <p className="text-white text-sm mt-2">Loading camera...</p>
                </div>
              </div>
            )}

            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="mb-4 w-full rounded-lg bg-black"
              style={{
                maxHeight: '480px',
                minHeight: '360px',
                objectFit: 'cover',
              }}
            />

            <div className="flex gap-3">
              <button
                type="button"
                onClick={capturePhoto}
                disabled={!videoReady}
                className="flex-1 rounded-md bg-blue-600 py-2 px-4 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                📸 Capture Photo
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

          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}

export default function FileComplaintPage() {
  return <FileComplaintForm />;
}
