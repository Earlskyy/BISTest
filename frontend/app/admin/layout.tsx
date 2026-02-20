'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { getCurrentUser, isAuthenticated } from '@/lib/auth';
import { User } from '@/lib/auth';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated()) {
        router.push('/login');
        return;
      }

      const currentUser = await getCurrentUser();
      if (!currentUser || currentUser.role !== 'admin') {
        router.push('/staff/dashboard');
        return;
      }

      setUser(currentUser);
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex">
      <Sidebar role="admin" />
      <div className="flex-1">
        <header className="bg-white shadow-sm p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="text-sm text-gray-600">
              Welcome, <span className="font-semibold">{user.full_name}</span>
            </div>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
