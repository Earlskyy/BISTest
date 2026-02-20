'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { toast } from 'react-toastify';
import { RichTextEditor } from '@/components/RichTextEditor';

const TOKENS = [
  '{{logo_url}}',
  '{{reference_number}}',
  '{{certificate_type}}',
  '{{full_name}}',
  '{{address}}',
  '{{age}}',
  '{{civil_status}}',
  '{{purpose}}',
  '{{profile_photo_url}}',
];

const DEFAULT_HTML = `\n<div style="font-family: Arial, sans-serif; padding: 24px;">\n  <div style="text-align:center;">\n    <img src="{{logo_url}}" alt="Logo" style="height:80px;" />\n    <h2 style="margin:8px 0;">BARANGAY CATARMAN</h2>\n    <div>Republic of the Philippines</div>\n    <div>Province of Northern Samar</div>\n  </div>\n\n  <h3 style="text-align:center; margin-top:24px;">{{certificate_type}}</h3>\n\n  <p style="margin-top:24px;">TO WHOM IT MAY CONCERN:</p>\n\n  <p style="line-height:1.6;">\n    This is to certify that <strong>{{full_name}}</strong>, {{age}} years old, {{civil_status}}, is a resident of <strong>{{address}}</strong>.\n  </p>\n\n  <p style="line-height:1.6;">This certificate is being issued for <strong>{{purpose}}</strong>.</p>\n\n  <p style="margin-top:24px;">Reference No.: <strong>{{reference_number}}</strong></p>\n\n  <div style="margin-top:64px; text-align:center;">\n    <div style="width:240px; border-top:1px solid #000; margin:0 auto;"></div>\n    <div style="margin-top:6px;">Punong Barangay</div>\n  </div>\n</div>\n`;

export default function NewCertificateTemplatePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [certificateType, setCertificateType] = useState('Certificate of Residency');
  const [logoUrl, setLogoUrl] = useState('');
  const [includeProfilePhoto, setIncludeProfilePhoto] = useState(false);
  const [htmlTemplate, setHtmlTemplate] = useState(DEFAULT_HTML);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const insertTokenRef = useRef<(t: string) => void>(() => {});

  const previewHtml = useMemo(() => {
    const sample = {
      logo_url: logoUrl || 'https://placehold.co/160x80?text=LOGO',
      reference_number: 'BIS-20260219-ABC123',
      certificate_type: certificateType,
      full_name: 'Juan Dela Cruz',
      address: 'Brgy. Catarman, Northern Samar',
      age: '25',
      civil_status: 'Single',
      purpose: 'Employment',
      profile_photo_url: 'https://placehold.co/140x140?text=PHOTO',
    };

    return htmlTemplate
      .replaceAll('{{logo_url}}', sample.logo_url)
      .replaceAll('{{reference_number}}', sample.reference_number)
      .replaceAll('{{certificate_type}}', sample.certificate_type)
      .replaceAll('{{full_name}}', sample.full_name)
      .replaceAll('{{address}}', sample.address)
      .replaceAll('{{age}}', sample.age)
      .replaceAll('{{civil_status}}', sample.civil_status)
      .replaceAll('{{purpose}}', sample.purpose)
      .replaceAll('{{profile_photo_url}}', sample.profile_photo_url);
  }, [htmlTemplate, logoUrl, certificateType]);

  const uploadImage = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append('image', file);
    const res = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    return res.data.url;
  };

  const insertToken = (token: string) => {
    insertTokenRef.current?.(token);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let finalLogoUrl = logoUrl;
      if (logoFile) {
        finalLogoUrl = await uploadImage(logoFile);
        setLogoUrl(finalLogoUrl);
      }

      await api.post('/certificate-templates', {
        name,
        certificate_type: certificateType,
        html_template: htmlTemplate,
        logo_url: finalLogoUrl || null,
        include_profile_photo: includeProfilePhoto,
      });
      toast.success('Template created');
      router.push('/staff/certificate-templates');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create template');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Link href="/staff/certificate-templates" className="text-primary-600 hover:text-primary-700">
          ← Back to Templates
        </Link>
      </div>

      <form onSubmit={handleSave} className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-2xl font-bold">New Certificate Template</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700">Template Name *</label>
            <input className="mt-1 w-full border rounded-md px-3 py-2" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Certificate Type *</label>
            <input className="mt-1 w-full border rounded-md px-3 py-2" required value={certificateType} onChange={(e) => setCertificateType(e.target.value)} />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Logo URL (optional)</label>
              <input className="mt-1 w-full border rounded-md px-3 py-2" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Upload Logo (optional)</label>
              <input type="file" accept="image/*" className="mt-1 w-full" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
            </div>
          </div>

          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={includeProfilePhoto} onChange={(e) => setIncludeProfilePhoto(e.target.checked)} />
            Include Profile Photo placeholder in certificate workflow
          </label>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Template (Word-style) *</label>
              <div className="flex flex-wrap gap-2">
                {TOKENS.map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => insertToken(t)}
                    className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <RichTextEditor
              value={htmlTemplate}
              onChange={setHtmlTemplate}
              onInsertToken={(insert) => {
                insertTokenRef.current = insert;
              }}
            />
            <p className="text-xs text-gray-500 mt-2">
              Tip: use tokens like <span className="font-mono">{'{{full_name}}'}</span> and <span className="font-mono">{'{{reference_number}}'}</span>.
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Create Template'}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Live Preview (sample data)</h3>
          <div className="border rounded p-4 overflow-auto" dangerouslySetInnerHTML={{ __html: previewHtml }} />
        </div>
      </form>
    </div>
  );
}

