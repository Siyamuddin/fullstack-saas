import { Link } from 'react-router-dom';
import { useUsers } from '@/hooks';

export function AdminDashboard() {
  const { data: usersData, isLoading } = useUsers(0, 10, 'id', 'asc');

  const stats = [
    {
      name: 'Total Users',
      value: usersData?.totalElements || 0,
      icon: '👥',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      name: 'Active Sessions',
      value: 'N/A',
      icon: '🔐',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      name: 'Recent Registrations',
      value: usersData?.content?.length || 0,
      icon: '📈',
      gradient: 'from-purple-500 to-pink-500',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="mt-2 text-gray-300">Welcome to the administration panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-slate-800/50 backdrop-blur-sm border border-blue-500/20 rounded-xl shadow-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">{stat.name}</p>
                <p className="mt-2 text-3xl font-bold text-white">{stat.value}</p>
              </div>
              <div
                className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-lg flex items-center justify-center text-2xl`}
              >
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-blue-500/20 rounded-xl shadow-xl p-6 mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/admin/users"
            className="p-4 border-2 border-blue-500/30 rounded-lg hover:border-blue-500/50 hover:bg-blue-500/10 transition-all bg-slate-700/30"
          >
            <h3 className="font-semibold text-white">Manage Users</h3>
            <p className="text-sm text-gray-300 mt-1">View and manage all users</p>
          </Link>
          <Link
            to="/admin/profile"
            className="p-4 border-2 border-blue-500/30 rounded-lg hover:border-blue-500/50 hover:bg-blue-500/10 transition-all bg-slate-700/30"
          >
            <h3 className="font-semibold text-white">Edit Profile</h3>
            <p className="text-sm text-gray-300 mt-1">Update your admin profile</p>
          </Link>
        </div>
      </div>

      {/* Recent Users */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-blue-500/20 rounded-xl shadow-xl">
        <div className="p-6 border-b border-blue-500/20">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Recent Users</h2>
            <Link
              to="/admin/users"
              className="text-sm text-blue-400 hover:text-cyan-400 transition-colors"
            >
              View all
            </Link>
          </div>
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            </div>
          ) : usersData?.content && usersData.content.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-blue-500/20">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-slate-800/30 divide-y divide-blue-500/20">
                  {usersData.content.slice(0, 5).map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          to={`/admin/users/${user.id}`}
                          className="text-blue-400 hover:text-cyan-400 transition-colors"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-400 py-8">No users found</p>
          )}
        </div>
      </div>
    </div>
  );
}
