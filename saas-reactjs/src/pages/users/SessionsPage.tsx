import { useSessions, useRevokeSession } from '@/hooks';

export type SessionsVariant = 'admin' | 'user';

interface SessionsPageProps {
  variant?: SessionsVariant;
}

export function SessionsPage({ variant = 'user' }: SessionsPageProps) {
  const isAdmin = variant === 'admin';
  const { data: sessions, isLoading } = useSessions();
  const revokeMutation = useRevokeSession();

  const handleRevoke = (sessionId: string) => {
    if (window.confirm('Are you sure you want to revoke this session?')) {
      revokeMutation.mutate(sessionId);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          {isAdmin ? 'Active Sessions' : 'Active Sessions'}
        </h1>
        <p className="mt-2 text-gray-300">
          {isAdmin ? 'Manage your active sessions' : 'Manage your active sessions'}
        </p>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm border border-blue-500/20 rounded-xl shadow-xl overflow-hidden">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        ) : sessions && sessions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-blue-500/20">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                    Session ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                    IP Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                    User Agent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                    Login Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                    Last Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-slate-800/30 divide-y divide-blue-500/20">
                {sessions.map((session) => (
                  <tr key={session.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {session.sessionId.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {session.ipAddress || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {session.userAgent ? (
                        <span className="truncate max-w-xs block">{session.userAgent}</span>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(session.loginTime).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {session.lastActivity
                        ? new Date(session.lastActivity).toLocaleString()
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleRevoke(session.sessionId)}
                        disabled={revokeMutation.isPending}
                        className="text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                      >
                        {revokeMutation.isPending ? 'Revoking...' : 'Revoke'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">No active sessions</div>
        )}
      </div>
    </div>
  );
}
