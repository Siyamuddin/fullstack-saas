import { Link } from 'react-router-dom';

interface AppLogoProps {
  to?: string;
  title?: string;
}

export function AppLogo({ to = '/dashboard', title = 'SAAS Starter Kit' }: AppLogoProps) {
  return (
    <Link to={to} className="flex items-center space-x-2">
      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      </div>
      <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
        {title}
      </span>
    </Link>
  );
}
