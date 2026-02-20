'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { toast } from 'react-toastify';

interface StaffUser {
  id: string;
  full_name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

export default function StaffManagementPage() {
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<StaffUser | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'staff',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users?role=staff');
      setUsers(response.data.users);
    } catch (error) {
      toast.error('Failed to fetch staff');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingUser(null);
    setFormData({ full_name: '', email: '', password: '', role: 'staff' });
    setShowModal(true);
  };

  const handleEdit = (user: StaffUser) => {
    setEditingUser(user);
    setFormData({ full_name: user.full_name, email: user.email, password: '', role: user.role });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, {
          full_name: formData.full_name,
          email: formData.email,
          role: formData.role,
        });
        toast.success('Staff updated successfully');
      } else {
        await api.post('/users', formData);
        toast.success('Staff created successfully');
      }
      setShowModal(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Operation failed');
    }
  };

  const handleResetPassword = async (userId: string) => {
    const newPassword = prompt('Enter new password (min 6 characters):');
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      await api.post(`/users/${userId}/reset-password`, { new_password: newPassword });
      toast.success('Password reset successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to reset password');
    }
  };

  const handleToggleStatus = async (user: StaffUser) => {
    try {
      await api.put(`/users/${user.id}`, {
        status: user.status === 'active' ? 'disabled' : 'active',
      });
      toast.success(`Staff ${user.status === 'active' ? 'disabled' : 'enabled'}`);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return;

    try {
      await api.delete(`/users/${userId}`);
      toast.success('Staff deleted successfully');
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete staff');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Staff Management</h2>
        <button
          onClick={handleCreate}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
        >
          ➕ Add Staff
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">{user.full_name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap capitalize">{user.role}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      user.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(user)}
                    className="text-primary-600 hover:text-primary-900 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleResetPassword(user.id)}
                    className="text-yellow-600 hover:text-yellow-900 mr-3"
                  >
                    Reset Password
                  </button>
                  <button
                    onClick={() => handleToggleStatus(user)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    {user.status === 'active' ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">
              {editingUser ? 'Edit Staff' : 'Add Staff'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    required={!editingUser}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700"
                >
                  {editingUser ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
