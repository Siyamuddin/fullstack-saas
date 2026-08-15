import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface LogoutButtonProps {
  variant?: 'text' | 'button';
  className?: string;
}

export function LogoutButton({ variant = 'text', className = '' }: LogoutButtonProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const baseClasses =
    variant === 'button'
      ? 'px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors font-medium'
      : 'px-4 py-2 text-sm text-red-400 hover:text-red-300 transition-colors font-medium';

  return (
    <button onClick={handleLogout} className={`${baseClasses} ${className}`}>
      Logout
    </button>
  );
}
