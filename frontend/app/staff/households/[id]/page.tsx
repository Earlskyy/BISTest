'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { toast } from 'react-toastify';

interface Household {
  id: string;
  head_name: string;
  address: string;
  contact_number: string;
  civil_status: string;
  family_members: Array<{
    id: string;
    full_name: string;
    age: number | null;
    gender: string | null;
    relationship: string | null;
  }>;
}

export default function HouseholdDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [household, setHousehold] = useState<Household | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberForm, setMemberForm] = useState({
    full_name: '',
    age: '',
    gender: '',
    relationship: '',
  });

  useEffect(() => {
    fetchHousehold();
  }, [params.id]);

  const fetchHousehold = async () => {
    try {
      const res = await api.get(`/households/${params.id}`);
      setHousehold(res.data);
    } catch (error) {
      toast.error('Failed to load household');
      router.push('/staff/households');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/households/${params.id}/members`, {
        ...memberForm,
        age: memberForm.age ? parseInt(memberForm.age) : undefined,
      });
      toast.success('Family member added');
      setShowAddMember(false);
      setMemberForm({ full_name: '', age: '', gender: '', relationship: '' });
      fetchHousehold();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add member');
    }
  };

  if (loading || !household) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/staff/households" className="text-primary-600 hover:text-primary-700">← Back to Households</Link>
      </div>
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">{household.head_name}</h2>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <dt className="text-gray-500">Address</dt>
          <dd>{household.address}</dd>
          <dt className="text-gray-500">Contact</dt>
          <dd>{household.contact_number || 'N/A'}</dd>
          <dt className="text-gray-500">Civil Status</dt>
          <dd>{household.civil_status || 'N/A'}</dd>
        </dl>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Family Members</h3>
          <button
            onClick={() => setShowAddMember(!showAddMember)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
          >
            + Add Member
          </button>
        </div>
        {showAddMember && (
          <form onSubmit={handleAddMember} className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
            <input
              type="text"
              required
              placeholder="Full Name"
              className="block w-full rounded-md border-gray-300 shadow-sm"
              value={memberForm.full_name}
              onChange={(e) => setMemberForm({ ...memberForm, full_name: e.target.value })}
            />
            <div className="grid grid-cols-3 gap-4">
              <input
                type="number"
                placeholder="Age"
                className="block w-full rounded-md border-gray-300 shadow-sm"
                value={memberForm.age}
                onChange={(e) => setMemberForm({ ...memberForm, age: e.target.value })}
              />
              <input
                type="text"
                placeholder="Gender"
                className="block w-full rounded-md border-gray-300 shadow-sm"
                value={memberForm.gender}
                onChange={(e) => setMemberForm({ ...memberForm, gender: e.target.value })}
              />
              <input
                type="text"
                placeholder="Relationship"
                className="block w-full rounded-md border-gray-300 shadow-sm"
                value={memberForm.relationship}
                onChange={(e) => setMemberForm({ ...memberForm, relationship: e.target.value })}
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm">
              Add
            </button>
          </form>
        )}
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Age</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Gender</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Relationship</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {household.family_members?.map((m) => (
              <tr key={m.id}>
                <td className="px-4 py-2">{m.full_name}</td>
                <td className="px-4 py-2">{m.age ?? '-'}</td>
                <td className="px-4 py-2">{m.gender ?? '-'}</td>
                <td className="px-4 py-2">{m.relationship ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
