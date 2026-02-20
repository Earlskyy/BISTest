'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/lib/auth';

interface SidebarProps {
  role: 'admin' | 'staff';
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const staffLinks = [
    { href: '/staff/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/staff/households', label: 'Households', icon: '🏠' },
    { href: '/staff/certificates', label: 'Certificates', icon: '📜' },
    { href: '/staff/certificate-templates', label: 'Certificate Templates', icon: '🧩' },
    { href: '/staff/blotter', label: 'Blotter', icon: '📋' },
    { href: '/staff/complaints', label: 'Complaints', icon: '⚠️' },
    { href: '/staff/tags', label: 'Tags', icon: '🏷️' },
    { href: '/staff/announcements', label: 'Announcements', icon: '📢' },
  ];

  const adminLinks = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/admin/staff', label: 'Staff Management', icon: '👥' },
    { href: '/admin/logs', label: 'System Logs', icon: '📝' },
    { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
  ];

  const links = role === 'admin' ? adminLinks : staffLinks;

  return (
    <div className="w-64 bg-gray-800 text-white min-h-screen flex flex-col no-print">
      <div className="p-4">
        <h2 className="text-xl font-bold">BIS</h2>
        <p className="text-sm text-gray-400">Barangay Catarman</p>
      </div>
      <nav className="mt-8 flex-1">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center px-4 py-3 hover:bg-gray-700 ${
                isActive ? 'bg-gray-700 border-l-4 border-primary-500' : ''
              }`}
            >
              <span className="mr-3">{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md"
        >
          <span className="mr-2">🚪</span>
          Logout
        </button>
      </div>
    </div>
  );
}
