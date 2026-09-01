import React, { useState } from 'react';
import { X, Download } from 'lucide-react';
import api from '../services/api';

const UserListModal = ({ isOpen, onClose, users, loading }) => {
  const [exporting, setExporting] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState(new Set());

  if (!isOpen) return null;

  const handleSelectUser = (userId) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map(u => u.userId).filter(Boolean)));
    }
  };

  const handleExport = async () => {
    if (selectedUsers.size === 0) {
      alert('Please select at least one user to export');
      return;
    }

    setExporting(true);
    try {
      await api.exportUserDetails(Array.from(selectedUsers));
      alert('User details exported successfully!');
    } catch (err) {
      alert(`Export failed: ${err.message}`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[80vh] overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50 px-8 py-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Unique Users</h2>
            <p className="mt-1 text-sm text-gray-600">View all users with their page view statistics</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 transition hover:bg-gray-200 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-8">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-purple-200 border-r-purple-600" />
                <p className="text-gray-600">Loading users…</p>
              </div>
            </div>
          ) : users.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 px-8 py-12 text-center">
              <p className="text-lg text-gray-600">No users found matching your filters.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
              <table className="w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectedUsers.size === users.length && users.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded border-gray-300 text-purple-600 cursor-pointer"
                      />
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-900">User name</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-900">Email</th>
                    <th className="px-6 py-4 text-center font-semibold text-gray-900">Page views</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-900">Last seen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((user) => (
                    <tr
                      key={user.userId || user.email}
                      className="transition hover:bg-purple-50/50"
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.has(user.userId)}
                          onChange={() => handleSelectUser(user.userId)}
                          className="w-4 h-4 rounded border-gray-300 text-purple-600 cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-semibold text-sm">
                            {(user.name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900">{user.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{user.email || 'N/A'}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2 text-sm font-semibold text-purple-900">
                          <span className="inline-block h-2 w-2 rounded-full bg-purple-600" />
                          {user.pageViews || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {user.lastSeen
                          ? new Date(user.lastSeen).toLocaleString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {selectedUsers.size > 0 ? (
              <span className="font-semibold text-purple-600">
                {selectedUsers.size} user{selectedUsers.size !== 1 ? 's' : ''} selected
              </span>
            ) : (
              <span>Showing {users.length} user{users.length !== 1 ? 's' : ''}</span>
            )}
          </div>
          {selectedUsers.size > 0 && (
            <button
              onClick={handleExport}
              disabled={exporting}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              {exporting ? 'Exporting...' : 'Export Selected'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserListModal;
