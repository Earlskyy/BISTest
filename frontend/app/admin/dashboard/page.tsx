'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    households: 0,
    family_members: 0,
    certificate_requests: 0,
    blotter_records: 0,
    complaints: 0,
    announcements: 0,
    staff_users: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/system/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading dashboard...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">System Overview</h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Households</p>
              <p className="text-3xl font-bold text-gray-900">{stats.households}</p>
            </div>
            <div className="text-4xl">🏠</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Family Members</p>
              <p className="text-3xl font-bold text-gray-900">{stats.family_members}</p>
            </div>
            <div className="text-4xl">👨‍👩‍👧‍👦</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Certificate Requests</p>
              <p className="text-3xl font-bold text-gray-900">{stats.certificate_requests}</p>
            </div>
            <div className="text-4xl">📜</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Blotter Records</p>
              <p className="text-3xl font-bold text-gray-900">{stats.blotter_records}</p>
            </div>
            <div className="text-4xl">📋</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Complaints</p>
              <p className="text-3xl font-bold text-gray-900">{stats.complaints}</p>
            </div>
            <div className="text-4xl">⚠️</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Announcements</p>
              <p className="text-3xl font-bold text-gray-900">{stats.announcements}</p>
            </div>
            <div className="text-4xl">📢</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Staff Users</p>
              <p className="text-3xl font-bold text-gray-900">{stats.staff_users}</p>
            </div>
            <div className="text-4xl">👥</div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">System Management</h3>
        <p className="text-gray-600">
          Use the navigation menu to manage staff accounts, view system logs, and configure system settings.
        </p>
      </div>
    </div>
  );
}
