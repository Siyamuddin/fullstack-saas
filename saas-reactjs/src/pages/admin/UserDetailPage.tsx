import { useParams, Link, useNavigate } from 'react-router-dom';
import { useUser } from '@/hooks';

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const userId = id ? parseInt(id) : 0;

  const { data: user, isLoading, error } = useUser(userId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">User not found</p>
        <Link to="/admin/users" className="text-blue-600 hover:text-blue-700">
          Back to Users
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/users')}
          className="text-blue-600 hover:text-blue-700 mb-4"
        >
          ← Back to Users
        </button>
        <h1 className="text-3xl font-bold text-gray-900">User Details</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start space-x-6">
          {user.profileImageUrl ? (
            <img src={user.profileImageUrl} alt={user.name} className="w-24 h-24 rounded-full" />
          ) : (
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-3xl font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">{user.name}</h2>
            <p className="text-gray-600 mb-4">{user.email}</p>
            {user.about && <p className="text-gray-700 mb-4">{user.about}</p>}
            <div className="flex flex-wrap gap-2 mb-4">
              {user.roles?.map((role) => (
                <span
                  key={role.id}
                  className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800"
                >
                  {role.name}
                </span>
              ))}
            </div>
            <div className="flex space-x-4">
              <Link
                to={`/admin/users/${user.id}/edit`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Edit User
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
