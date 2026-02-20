'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

export default function StaffDashboard() {
  const [stats, setStats] = useState({
    households: 0,
    pending_certificates: 0,
    open_blotter: 0,
    pending_complaints: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [households, certificates, blotter, complaints] = await Promise.all([
          api.get('/households?limit=1'),
          api.get('/certificates?status=pending&limit=1'),
          api.get('/blotter?limit=1'),
          api.get('/complaints?status=pending&limit=1'),
        ]);

        setStats({
          households: households.data.pagination.total,
          pending_certificates: certificates.data.pagination.total,
          open_blotter: blotter.data.pagination.total,
          pending_complaints: complaints.data.pagination.total,
        });
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
      <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Households</p>
              <p className="text-3xl font-bold text-gray-900">{stats.households}</p>
            </div>
            <div className="text-4xl">🏠</div>
          </div>
          <Link href="/staff/households" className="text-primary-600 text-sm mt-2 inline-block">
            View All →
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pending Certificates</p>
              <p className="text-3xl font-bold text-gray-900">{stats.pending_certificates}</p>
            </div>
            <div className="text-4xl">📜</div>
          </div>
          <Link href="/staff/certificates" className="text-primary-600 text-sm mt-2 inline-block">
            View All →
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Blotter Records</p>
              <p className="text-3xl font-bold text-gray-900">{stats.open_blotter}</p>
            </div>
            <div className="text-4xl">📋</div>
          </div>
          <Link href="/staff/blotter" className="text-primary-600 text-sm mt-2 inline-block">
            View All →
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pending Complaints</p>
              <p className="text-3xl font-bold text-gray-900">{stats.pending_complaints}</p>
            </div>
            <div className="text-4xl">⚠️</div>
          </div>
          <Link href="/staff/complaints" className="text-primary-600 text-sm mt-2 inline-block">
            View All →
          </Link>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <Link
            href="/staff/households?action=add"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 text-center"
          >
            ➕ Add Household
          </Link>
          <Link
            href="/staff/certificates?status=pending"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 text-center"
          >
            📜 Process Certificates
          </Link>
          <Link
            href="/staff/announcements?action=add"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 text-center"
          >
            📢 Post Announcement
          </Link>
        </div>
      </div>
    </div>
  );
}
