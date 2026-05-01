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
  rejection_reason?: string | null;
  flagged_reason?: string | null;
  package_name?: string | null;
  package_item_name?: string | null;
  purok_cert_url?: string | null;
  sanitary_card_url?: string | null;
  created_at?: string;
}

interface CertificateTemplate {
  id: string;
  name: string;
  certificate_type: string;
  html_template: string;
  logo_url: string | null;
  include_profile_photo: boolean;
  paper_size?: 'A4' | 'LEGAL';
  orientation?: 'portrait' | 'landscape';
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
  const [reasonMode, setReasonMode] = useState<'reject' | 'flag' | null>(null);
  const [predefinedReasons, setPredefinedReasons] = useState<Array<{ id: string; label: string }>>([]);
  const [reasonPredefined, setReasonPredefined] = useState('');
  const [reasonCustom, setReasonCustom] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isApprovedFlow = request?.status === 'approved' || request?.status === 'released';

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
      const reasonRes = await api.get('/certificates/predefined-reasons');
      setPredefinedReasons(reasonRes.data.reasons || []);
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
      name: formData.full_name || request.full_name || '',
      date: new Date().toLocaleDateString(),
    };
    let html = selectedTemplate.html_template || '';
    for (const [k, v] of Object.entries(map)) {
      html = html.replaceAll(`{{${k}}}`, v || '');
    }
    return html;
  }, [request, selectedTemplate, formData]);

  const printSize = selectedTemplate?.paper_size === 'LEGAL' ? '8.5in 13in' : 'A4';
  const pdfFormat = selectedTemplate?.paper_size === 'LEGAL' ? [216, 330] : 'a4';
  const pdfOrientation = selectedTemplate?.orientation === 'landscape' ? 'landscape' : 'portrait';

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
      await api.put(`/certificates/${request!.id}/approve`);
      toast.success('Certificate approved');
      fetchRequest();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to approve');
    }
  };

  const handleRelease = async () => {
    try {
      await api.put(`/certificates/${request!.id}/release`);
      toast.success('Certificate released');
      fetchRequest();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to release');
    }
  };

  const submitReasonAction = async () => {
    if (!request || !reasonMode) return;
    if (!reasonPredefined && !reasonCustom.trim()) {
      toast.error('Please select a predefined reason or provide a custom reason');
      return;
    }
    try {
      await api.put(`/certificates/${request.id}/${reasonMode}`, {
        reason_predefined: reasonPredefined || undefined,
        reason_custom: reasonCustom.trim() || undefined
      });
      toast.success(`Certificate ${reasonMode === 'reject' ? 'rejected' : 'flagged'} successfully`);
      setReasonMode(null);
      setReasonPredefined('');
      setReasonCustom('');
      fetchRequest();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update certificate status');
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF(pdfOrientation === 'landscape' ? 'l' : 'p', 'mm', pdfFormat as any);
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
    <div className="space-y-6">
      <style>{`@media print { @page { size: ${printSize}; margin: 10mm; } }`}</style>
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm no-print sm:flex-row sm:items-center sm:justify-between">
        <Link href="/staff/certificates" className="text-primary-600 hover:text-primary-700">← Back to Certificates</Link>
        <div className="flex flex-wrap gap-2">
          <button onClick={handleSave} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
            Save Changes
          </button>
          {isApprovedFlow && (
            <>
              <button onClick={downloadPDF} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Download PDF
              </button>
              <button onClick={handlePrint} className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 print:hidden">
                Print
              </button>
            </>
          )}
          {request.status === 'pending' && (
            <>
              <button onClick={handleApprove} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Approve
              </button>
              <button
                onClick={() => setReasonMode('flag')}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                Flag
              </button>
              <button
                onClick={() => setReasonMode('reject')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Reject
              </button>
            </>
          )}
          {request.status === 'approved' && (
            <button onClick={handleRelease} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              Release Document
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm no-print">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Request Review</h3>
          <div className="mb-4 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
            <p><span className="font-semibold">Reference:</span> {request.reference_number}</p>
            <p><span className="font-semibold">Status:</span> {request.status}</p>
            <p><span className="font-semibold">Submitted:</span> {new Date(request.created_at || Date.now()).toLocaleString()}</p>
          </div>
          {(request.package_name || request.package_item_name) && (
            <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900">
              Package: <strong>{request.package_name || 'Custom package'}</strong>
              {request.package_item_name ? ` • Document: ${request.package_item_name}` : ''}
            </div>
          )}
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
            {selectedTemplate && (
              <p className="mt-3 text-xs text-gray-600">
                Paper: <strong>{selectedTemplate.paper_size || 'A4'}</strong> • Orientation:{' '}
                <strong>{selectedTemplate.orientation || 'portrait'}</strong>
              </p>
            )}

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

              </div>
            )}
          </div>
          <div className="mb-6 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm">
            <h4 className="font-semibold text-slate-800">Requirements</h4>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="rounded-lg border p-2">
                <p className="mb-1 text-xs font-semibold text-slate-600">Purok Certification</p>
                {request.purok_cert_url ? (
                  <img src={request.purok_cert_url} alt="Purok Certification" className="h-40 w-full rounded object-cover" />
                ) : (
                  <p className="text-xs text-slate-500">No uploaded file.</p>
                )}
              </div>
              <div className="rounded-lg border p-2">
                <p className="mb-1 text-xs font-semibold text-slate-600">Sanitary Card</p>
                {request.sanitary_card_url ? (
                  <img src={request.sanitary_card_url} alt="Sanitary Card" className="h-40 w-full rounded object-cover" />
                ) : (
                  <p className="text-xs text-slate-500">No uploaded file.</p>
                )}
              </div>
            </div>
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
          style={{
            minHeight: selectedTemplate?.paper_size === 'LEGAL' ? '330mm' : '297mm',
            maxWidth: selectedTemplate?.paper_size === 'LEGAL' ? '216mm' : '210mm',
            margin: '0 auto'
          }}
        >
          {isApprovedFlow && selectedTemplate ? (
            <div dangerouslySetInnerHTML={{ __html: renderedTemplateHtml }} />
          ) : request.status === 'pending' ? (
            <div className="text-gray-600">
              Review and decide first. Certificate rendering is unlocked only after approval.
            </div>
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

      {reasonMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-xl rounded-lg bg-white p-6">
            <h3 className="text-lg font-semibold mb-4">
              {reasonMode === 'reject' ? 'Reject Request' : 'Flag Request'}
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Select a predefined reason and/or add a custom explanation.
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Predefined Reason</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  value={reasonPredefined}
                  onChange={(e) => setReasonPredefined(e.target.value)}
                >
                  <option value="">Select reason</option>
                  {predefinedReasons.map((reason) => (
                    <option key={reason.id} value={reason.label}>
                      {reason.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Custom Reason</label>
                <textarea
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  placeholder="Add detailed reason if needed..."
                  value={reasonCustom}
                  onChange={(e) => setReasonCustom(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => {
                  setReasonMode(null);
                  setReasonPredefined('');
                  setReasonCustom('');
                }}
                className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={submitReasonAction}
                className={`px-4 py-2 rounded-md text-white ${reasonMode === 'reject' ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-500 hover:bg-orange-600'}`}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {cameraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-5 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
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
        </div>
      )}
    </div>
  );
}
