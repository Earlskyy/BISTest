'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { toast } from 'react-toastify';
import { jsPDF } from 'jspdf';

interface CertificateRequest {
  id: string;
  reference_number: string;
  full_name: string;
  address: string;
  certificate_type: string;
  birth_date: string | null;
  age: number | null;
  civil_status: string | null;
  purpose: string | null;
  contact_number: string | null;
  photo_url: string | null;
  profile_photo_url: string | null;
  template_id: string | null;
  status: string;
}

interface CertificateTemplate {
  id: string;
  name: string;
  certificate_type: string;
  html_template: string;
  logo_url: string | null;
  include_profile_photo: boolean;
}

export default function CertificateTemplatePage() {
  const params = useParams();
  const router = useRouter();
  const [request, setRequest] = useState<CertificateRequest | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const templateRef = useRef<HTMLDivElement>(null);
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
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

  useEffect(() => {
    fetchRequest();
  }, [params.id]);

  const fetchRequest = async () => {
    try {
      const res = await api.get(`/certificates/${params.id}`);
      setRequest(res.data);
      setFormData({
        full_name: res.data.full_name || '',
        address: res.data.address || '',
        certificate_type: res.data.certificate_type || '',
        birth_date: res.data.birth_date || '',
        age: res.data.age ? String(res.data.age) : '',
        civil_status: res.data.civil_status || '',
        purpose: res.data.purpose || '',
      });

      // Load templates for this certificate type
      const tRes = await api.get(`/certificate-templates?certificate_type=${encodeURIComponent(res.data.certificate_type)}`);
      setTemplates(tRes.data.templates || []);
      const existingTemplateId = res.data.template_id;
      const fallback = (tRes.data.templates?.[0]?.id as string) || '';
      setSelectedTemplateId(existingTemplateId || fallback);
    } catch (error) {
      toast.error('Failed to load certificate');
      router.push('/staff/certificates');
    } finally {
      setLoading(false);
    }
  };

  const selectedTemplate = useMemo(() => {
    return templates.find((t) => t.id === selectedTemplateId) || null;
  }, [templates, selectedTemplateId]);

  const renderedTemplateHtml = useMemo(() => {
    if (!request || !selectedTemplate) return '';
    const map: Record<string, string> = {
      logo_url: selectedTemplate.logo_url || '',
      reference_number: request.reference_number || '',
      certificate_type: formData.certificate_type || request.certificate_type || '',
      full_name: formData.full_name || request.full_name || '',
      address: formData.address || request.address || '',
      age: (formData.age || (request.age !== null && request.age !== undefined ? String(request.age) : '') || '').toString(),
      civil_status: formData.civil_status || request.civil_status || '',
      purpose: formData.purpose || request.purpose || '',
      profile_photo_url: request.profile_photo_url || '',
    };
    let html = selectedTemplate.html_template || '';
    for (const [k, v] of Object.entries(map)) {
      html = html.replaceAll(`{{${k}}}`, v || '');
    }
    return html;
  }, [request, selectedTemplate, formData]);

  const uploadImage = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append('image', file);
    const res = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    return res.data.url;
  };

  const saveTemplateSelection = async () => {
    if (!request) return;
    try {
      await api.put(`/certificates/${request.id}`, { template_id: selectedTemplateId || null });
      toast.success('Template selected');
      fetchRequest();
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Failed to save template');
    }
  };

  const onProfilePhotoFile = async (file: File) => {
    if (!request) return;
    setProfilePhotoUploading(true);
    try {
      const url = await uploadImage(file);
      await api.put(`/certificates/${request.id}`, { profile_photo_url: url });
      toast.success('Profile photo saved');
      fetchRequest();
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
    const file = new File([blob], `profile-${request?.reference_number || 'photo'}.jpg`, { type: 'image/jpeg' });
    await onProfilePhotoFile(file);
    closeCamera();
  };

  const handleSave = async () => {
    try {
      await api.put(`/certificates/${request!.id}`, {
        full_name: formData.full_name,
        address: formData.address,
        certificate_type: formData.certificate_type,
        birth_date: formData.birth_date || null,
        age: formData.age ? parseInt(formData.age) : null,
        civil_status: formData.civil_status || null,
        purpose: formData.purpose || null,
      });
      toast.success('Certificate details updated');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save');
    }
  };

  const handleApprove = async () => {
    try {
      await api.put(`/certificates/${request!.id}/status`, { status: 'approved' });
      toast.success('Certificate approved');
      fetchRequest();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to approve');
    }
  };

  const handleRelease = async () => {
    try {
      await api.put(`/certificates/${request!.id}/status`, { status: 'released' });
      toast.success('Certificate released');
      fetchRequest();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to release');
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(18);
    doc.text('BARANGAY CATARMAN', pageWidth / 2, 25, { align: 'center' });
    doc.setFontSize(12);
    doc.text('Republic of the Philippines', pageWidth / 2, 32, { align: 'center' });
    doc.text('Province of Northern Samar', pageWidth / 2, 38, { align: 'center' });

    doc.setFontSize(16);
    doc.text(formData.certificate_type || request?.certificate_type || 'CERTIFICATE', pageWidth / 2, 55, { align: 'center' });

    doc.setFontSize(11);
    const lineHeight = 8;
    let y = 75;
    doc.text(`TO WHOM IT MAY CONCERN:`, 20, y);
    y += lineHeight * 2;

    doc.text(`This is to certify that ${formData.full_name || '________________'}, ${formData.age ? formData.age + ' years old' : 'of legal age'}, ${formData.civil_status ? formData.civil_status : '________'}, is a resident of ${formData.address || '________________'}.`, 20, y, { maxWidth: pageWidth - 40 });
    y += lineHeight * 3;

    if (formData.purpose) {
      doc.text(`This certificate is being issued for ${formData.purpose}.`, 20, y, { maxWidth: pageWidth - 40 });
      y += lineHeight * 2;
    }

    doc.text(`Issued this ${new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })} at Barangay Catarman.`, 20, y, { maxWidth: pageWidth - 40 });
    y += lineHeight * 3;

    doc.setFontSize(10);
    doc.text('Reference No.: ' + (request?.reference_number || ''), 20, y);
    y += lineHeight;

    doc.setFontSize(11);
    doc.text('_________________________', pageWidth / 2, y + 15, { align: 'center' });
    doc.text('Punong Barangay', pageWidth / 2, y + 22, { align: 'center' });

    doc.save(`${formData.certificate_type?.replace(/\s/g, '-')}-${request?.reference_number || 'cert'}.pdf`);
    toast.success('PDF downloaded');
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading || !request) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6 no-print">
        <Link href="/staff/certificates" className="text-primary-600 hover:text-primary-700">← Back to Certificates</Link>
        <div className="flex gap-2">
          <button onClick={handleSave} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
            Save Changes
          </button>
          <button onClick={downloadPDF} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Download PDF
          </button>
          <button onClick={handlePrint} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 print:hidden">
            Print
          </button>
          {request.status === 'pending' && (
            <>
              <button onClick={handleApprove} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Approve
              </button>
              <button onClick={handleRelease} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                Approve & Release
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow no-print">
          <h3 className="text-lg font-semibold mb-4">Edit Certificate Information</h3>
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-[240px]">
                <label className="block text-sm font-medium text-gray-700">Template</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                >
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.certificate_type})
                    </option>
                  ))}
                  {templates.length === 0 && <option value="">No templates found for this type</option>}
                </select>
              </div>
              <button
                type="button"
                onClick={saveTemplateSelection}
                className="mt-6 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                disabled={!selectedTemplateId}
              >
                Use Template
              </button>
            </div>

            {selectedTemplate?.include_profile_photo && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo (for certificate)</label>
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
                      {request.profile_photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={request.profile_photo_url} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs text-gray-500">Drop photo here</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-[220px]">
                      <p className="text-sm text-gray-600">
                        Drag & drop an image here, or choose a file, or use the camera.
                      </p>
                      <div className="mt-3 flex gap-2 flex-wrap">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) onProfilePhotoFile(f);
                          }}
                        />
                        <button
                          type="button"
                          onClick={openCamera}
                          className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                        >
                          Use Camera
                        </button>
                        {profilePhotoUploading && (
                          <span className="text-sm text-gray-600">Uploading...</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {cameraOpen && (
                  <div className="mt-4 p-4 border rounded-lg bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">Camera Capture</h4>
                      <button type="button" onClick={closeCamera} className="text-sm text-red-600">
                        Close
                      </button>
                    </div>
                    <video ref={videoRef} className="w-full rounded border" playsInline />
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                      >
                        Capture & Save
                      </button>
                      <button
                        type="button"
                        onClick={closeCamera}
                        className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <textarea
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Certificate Type</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                value={formData.certificate_type}
                onChange={(e) => setFormData({ ...formData, certificate_type: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Age</label>
                <input
                  type="number"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Civil Status</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  value={formData.civil_status}
                  onChange={(e) => setFormData({ ...formData, civil_status: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Purpose</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div
          ref={templateRef}
          className="bg-white p-8 rounded-lg shadow border-2 print:border-0"
          style={{ minHeight: '297mm' }}
        >
          {selectedTemplate ? (
            <div dangerouslySetInnerHTML={{ __html: renderedTemplateHtml }} />
          ) : (
            <div className="text-gray-600">
              No template selected for this certificate type. Create one in{' '}
              <Link href="/staff/certificate-templates" className="text-primary-600 underline">
                Certificate Templates
              </Link>
              .
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
