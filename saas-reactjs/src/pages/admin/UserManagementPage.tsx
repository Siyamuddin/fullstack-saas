import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUsers, useUserSearch, useDeleteUser } from '@/hooks';

export function UserManagementPage() {
  const [pageNumber, setPageNumber] = useState(0);
  const [pageSize] = useState(10);
  const [sortBy, setSortBy] = useState('id');
  const [sortDirec, setSortDirec] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading, error } = useUsers(pageNumber, pageSize, sortBy, sortDirec);
  const { data: searchResults, isLoading: isSearching } = useUserSearch(searchTerm);
  const deleteMutation = useDeleteUser();

  const handleDelete = (userId: number, userName: string) => {
    if (window.confirm(`Are you sure you want to delete user "${userName}"?`)) {
      deleteMutation.mutate(userId);
    }
  };

  const users = searchTerm ? searchResults || [] : data?.content || [];
  const totalPages = data?.totalPages || 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">User Management</h1>
        <p className="mt-2 text-gray-300">Manage all users in the system</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search users by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/3 px-4 py-2 bg-slate-700/50 border border-blue-500/30 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
        />
      </div>

      {/* Users Table */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-blue-500/20 rounded-xl shadow-xl overflow-hidden">
        {isLoading || isSearching ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-400">Error loading users</div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No users found</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-blue-500/20">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      <button
                        onClick={() => {
                          setSortBy('id');
                          setSortDirec(sortDirec === 'asc' ? 'desc' : 'asc');
                        }}
                        className="hover:text-white transition-colors"
                      >
                        ID {sortBy === 'id' && (sortDirec === 'asc' ? '↑' : '↓')}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Roles
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-slate-800/30 divide-y divide-blue-500/20">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {user.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {user.profileImageUrl ? (
                            <img
                              src={user.profileImageUrl}
                              alt={user.name}
                              className="w-10 h-10 rounded-full mr-3 border border-blue-500/30"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mr-3">
                              <span className="text-white font-semibold">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <span className="text-sm font-medium text-white">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {user.roles?.map((role) => (
                            <span
                              key={role.id}
                              className="px-2 py-1 text-xs rounded-full bg-gradient-to-r from-blue-600/30 to-cyan-600/30 text-blue-300 border border-blue-500/30"
                            >
                              {role.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            to={`/admin/users/${user.id}`}
                            className="text-blue-400 hover:text-cyan-400 transition-colors"
                          >
                            View
                          </Link>
                          <Link
                            to={`/admin/users/${user.id}/edit`}
                            className="text-green-400 hover:text-emerald-400 transition-colors"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(user.id, user.name)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!searchTerm && totalPages > 1 && (
              <div className="bg-slate-700/50 px-6 py-4 flex items-center justify-between border-t border-blue-500/20">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-300">Page</span>
                  <select
                    value={pageNumber}
                    onChange={(e) => setPageNumber(Number(e.target.value))}
                    className="px-3 py-1 bg-slate-700/50 border border-blue-500/30 text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Array.from({ length: totalPages }, (_, i) => (
                      <option key={i} value={i}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                  <span className="text-sm text-gray-300">
                    of {totalPages} ({data?.totalElements} total)
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPageNumber(Math.max(0, pageNumber - 1))}
                    disabled={pageNumber === 0}
                    className="px-4 py-2 text-sm bg-slate-700/50 border border-blue-500/30 text-white rounded-md disabled:opacity-50 hover:bg-slate-700 transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPageNumber(Math.min(totalPages - 1, pageNumber + 1))}
                    disabled={pageNumber >= totalPages - 1}
                    className="px-4 py-2 text-sm bg-slate-700/50 border border-blue-500/30 text-white rounded-md disabled:opacity-50 hover:bg-slate-700 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
