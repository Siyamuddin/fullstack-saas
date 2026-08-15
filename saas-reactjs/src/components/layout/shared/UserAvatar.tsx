interface UserAvatarProps {
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  email?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
};

export function UserAvatar({
  name = 'User',
  size = 'sm',
  showName = false,
  email,
}: UserAvatarProps) {
  const initial = name?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="flex items-center space-x-3">
      <div
        className={`${sizeClasses[size]} bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center`}
      >
        <span className="text-white font-semibold">{initial}</span>
      </div>
      {showName && (
        <div className="hidden md:block">
          <p className="text-sm font-medium text-white">{name}</p>
          {email && <p className="text-xs text-gray-400">{email}</p>}
        </div>
      )}
    </div>
  );
}
