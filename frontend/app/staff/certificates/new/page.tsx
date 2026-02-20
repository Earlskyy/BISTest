'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { toast } from 'react-toastify';

interface CertificateTemplate {
  id: string;
  name: string;
  certificate_type: string;
  logo_url: string | null;
  include_profile_photo: boolean;
}

export default function WalkInCertificatePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    address: '',
    certificate_type: 'Certificate of Residency',
    birth_date: '',
    age: '',
    civil_status: '',
    purpose: '',
    contact_number: '',
    template_id: '',
    profile_photo_url: '',
  });

  const [profilePhotoUploading, setProfilePhotoUploading] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === formData.template_id) || null,
    [templates, formData.template_id]
  );

  const uploadImage = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append('image', file);
    const res = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    return res.data.url;
  };

  const loadTemplates = async (type: string) => {
    setLoadingTemplates(true);
    try {
      const res = await api.get(`/certificate-templates?certificate_type=${encodeURIComponent(type)}`);
      const list = res.data.templates || [];
      setTemplates(list);
      setFormData((p) => ({ ...p, template_id: list[0]?.id || '' }));
    } catch {
      setTemplates([]);
      setFormData((p) => ({ ...p, template_id: '' }));
    } finally {
      setLoadingTemplates(false);
    }
  };

  useEffect(() => {
    loadTemplates(formData.certificate_type);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onProfilePhotoFile = async (file: File) => {
    setProfilePhotoUploading(true);
    try {
      const url = await uploadImage(file);
      setFormData((p) => ({ ...p, profile_photo_url: url }));
      toast.success('Profile photo uploaded');
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Failed to upload photo');
    } finally {
      setProfilePhotoUploading(false);
    }
  };

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
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
    const file = new File([blob], `walkin-profile.jpg`, { type: 'image/jpeg' });
    await onProfilePhotoFile(file);
    closeCamera();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post('/certificates/walkin', {
        full_name: formData.full_name,
        address: formData.address,
        certificate_type: formData.certificate_type,
        birth_date: formData.birth_date || undefined,
        age: formData.age ? parseInt(formData.age) : undefined,
        civil_status: formData.civil_status || undefined,
        purpose: formData.purpose || undefined,
        contact_number: formData.contact_number || undefined,
        template_id: formData.template_id || undefined,
        profile_photo_url: formData.profile_photo_url || undefined,
      });

      toast.success(`Walk-in created. Ref: ${res.data.reference_number}`);
      router.push(`/staff/certificates/${res.data.id}`);
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Failed to create walk-in certificate');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Link href="/staff/certificates" className="text-primary-600 hover:text-primary-700">
          ← Back to Certificates
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6 max-w-3xl">
        <h2 className="text-2xl font-bold mb-2">Walk-in Applicant</h2>
        <p className="text-gray-600 mb-6">
          Create a certificate request for applicants without an online submission, then process/print it immediately.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name *</label>
              <input
                required
                className="mt-1 w-full border rounded-md px-3 py-2"
                value={formData.full_name}
                onChange={(e) => setFormData((p) => ({ ...p, full_name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Number</label>
              <input
                className="mt-1 w-full border rounded-md px-3 py-2"
                value={formData.contact_number}
                onChange={(e) => setFormData((p) => ({ ...p, contact_number: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Address *</label>
            <textarea
              required
              rows={2}
              className="mt-1 w-full border rounded-md px-3 py-2"
              value={formData.address}
              onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Certificate Type *</label>
              <input
                required
                className="mt-1 w-full border rounded-md px-3 py-2"
                value={formData.certificate_type}
                onChange={async (e) => {
                  const v = e.target.value;
                  setFormData((p) => ({ ...p, certificate_type: v }));
                  await loadTemplates(v);
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Template</label>
              <select
                className="mt-1 w-full border rounded-md px-3 py-2"
                value={formData.template_id}
                onChange={(e) => setFormData((p) => ({ ...p, template_id: e.target.value }))}
                disabled={loadingTemplates}
              >
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
                {templates.length === 0 && <option value="">No templates for this type</option>}
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Birth Date</label>
              <input
                type="date"
                className="mt-1 w-full border rounded-md px-3 py-2"
                value={formData.birth_date}
                onChange={(e) => setFormData((p) => ({ ...p, birth_date: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Age</label>
              <input
                type="number"
                className="mt-1 w-full border rounded-md px-3 py-2"
                value={formData.age}
                onChange={(e) => setFormData((p) => ({ ...p, age: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Civil Status</label>
              <input
                className="mt-1 w-full border rounded-md px-3 py-2"
                value={formData.civil_status}
                onChange={(e) => setFormData((p) => ({ ...p, civil_status: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Purpose</label>
            <input
              className="mt-1 w-full border rounded-md px-3 py-2"
              value={formData.purpose}
              onChange={(e) => setFormData((p) => ({ ...p, purpose: e.target.value }))}
            />
          </div>

          {selectedTemplate?.include_profile_photo && (
            <div className="p-4 bg-gray-50 border rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo (optional)</label>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const f = e.dataTransfer.files?.[0];
                  if (f) onProfilePhotoFile(f);
                }}
                className="border-2 border-dashed rounded-lg p-4 bg-white"
              >
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="w-28 h-28 border rounded overflow-hidden bg-gray-50 flex items-center justify-center">
                    {formData.profile_photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={formData.profile_photo_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-gray-500">Drop photo here</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-[220px]">
                    <p className="text-sm text-gray-600">Drag & drop, choose a file, or use the camera.</p>
                    <div className="mt-3 flex gap-2 flex-wrap">
                      <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && onProfilePhotoFile(e.target.files[0])} />
                      <button type="button" onClick={openCamera} className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                        Use Camera
                      </button>
                      {profilePhotoUploading && <span className="text-sm text-gray-600">Uploading…</span>}
                    </div>
                  </div>
                </div>
              </div>

              {cameraOpen && (
                <div className="mt-4 p-4 border rounded-lg bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">Camera Capture</h4>
                    <button type="button" onClick={closeCamera} className="text-sm text-red-600">Close</button>
                  </div>
                  <video ref={videoRef} className="w-full rounded border" playsInline />
                  <div className="mt-3 flex gap-2">
                    <button type="button" onClick={capturePhoto} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                      Capture & Use
                    </button>
                    <button type="button" onClick={closeCamera} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {saving ? 'Creating…' : 'Create & Process'}
            </button>
            <Link href="/staff/certificates" className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

