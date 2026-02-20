'use client';

export default function SettingsPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">System Settings</h2>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4">Barangay Information</h3>
        <p className="text-gray-600 mb-4">
          Configure barangay name, logo, and other system-wide settings.
        </p>
        <p className="text-sm text-gray-500">
          Settings management will be available in a future update.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h3 className="text-xl font-semibold mb-4">Database Backup</h3>
        <p className="text-gray-600 mb-4">
          Create and restore database backups.
        </p>
        <p className="text-sm text-gray-500">
          Backup functionality will be available in a future update.
        </p>
      </div>
    </div>
  );
}
