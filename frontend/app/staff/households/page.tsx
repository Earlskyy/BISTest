'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { toast } from 'react-toastify';
import Link from 'next/link';

interface Household {
  id: string;
  head_name: string;
  address: string;
  contact_number: string;
  civil_status: string;
  created_at: string;
}

export default function HouseholdsPage() {
  const [households, setHouseholds] = useState<Household[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchHouseholds();
  }, [search]);

  const fetchHouseholds = async () => {
    try {
      const response = await api.get(`/households?search=${encodeURIComponent(search)}`);
      setHouseholds(response.data.households);
    } catch (error) {
      toast.error('Failed to fetch households');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Households</h2>
        <Link
          href="/staff/households/new"
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
        >
          ➕ Add Household
        </Link>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search households..."
          className="w-full max-w-md px-4 py-2 border rounded-lg"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Head Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {households.map((household) => (
              <tr key={household.id}>
                <td className="px-6 py-4 whitespace-nowrap">{household.head_name}</td>
                <td className="px-6 py-4">{household.address}</td>
                <td className="px-6 py-4 whitespace-nowrap">{household.contact_number || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Link
                    href={`/staff/households/${household.id}`}
                    className="text-primary-600 hover:text-primary-900"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
