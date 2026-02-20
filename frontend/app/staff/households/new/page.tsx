'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { toast } from 'react-toastify';

export default function AddHouseholdPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    head_name: '',
    address: '',
    contact_number: '',
    civil_status: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/households', formData);
      toast.success('Household added successfully');
      router.push('/staff/households');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add household');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Link href="/staff/households" className="text-primary-600 hover:text-primary-700">← Back to Households</Link>
      </div>
      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
        <h2 className="text-2xl font-bold mb-6">Add Household</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Head of Household *</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              value={formData.head_name}
              onChange={(e) => setFormData({ ...formData, head_name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Address *</label>
            <textarea
              required
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Number</label>
              <input
                type="tel"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                value={formData.contact_number}
                onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Civil Status</label>
              <select
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
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Household'}
            </button>
            <Link href="/staff/households" className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
