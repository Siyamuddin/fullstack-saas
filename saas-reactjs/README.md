# React Frontend Application

A modern, responsive React.js frontend application built with TypeScript, Tailwind CSS, and React Router v7. This application integrates with the Spring Boot backend and provides role-based dashboards for admin and general users.

## Features

- **Modern Landing Page** - Attractive landing page with login/register buttons
- **Role-Based Access Control** - Separate dashboards for Admin and General users
- **Admin Dashboard** - Complete user management and profile management
- **User Dashboard** - Profile management for general users
- **Authentication** - Login, registration, email verification, password reset
- **Session Management** - View and revoke active sessions
- **Profile Management** - Update profile, upload photos, change password
- **Responsive Design** - Mobile-first design with Tailwind CSS

## Technology Stack

- **React 19** with TypeScript
- **Vite** - Build tool
- **React Router v7** - Routing
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **Zod** - Validation
- **TanStack Query** - Data fetching and caching
- **React Hot Toast** - Notifications

## Getting Started

### Prerequisites

- Node.js 18+ (recommended 20+)
- npm or yarn
- Backend API running on `http://localhost:9090`

### Installation

1. Install dependencies:

```bash
npm install
```

2. Create `.env` file from `.env.example`:

```bash
cp .env.example .env
```

3. Update `.env` with your backend URL:

```
VITE_API_BASE_URL=http://localhost:9090
VITE_APP_NAME=SAAS Starter
```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Project Structure

```
src/
├── api/              # API client and endpoints
├── components/       # Reusable components
│   ├── common/      # Common UI components
│   └── layout/      # Layout components
├── contexts/         # React contexts (Auth)
├── pages/           # Page components
│   ├── auth/        # Authentication pages
│   ├── admin/       # Admin pages
│   └── users/       # User pages
├── types/           # TypeScript types
├── utils/           # Utility functions
└── App.tsx          # Main app component
```

## Routes

### Public Routes

- `/` - Landing page
- `/login` - Login page
- `/register` - Registration page
- `/forgot-password` - Forgot password
- `/reset-password` - Reset password (with token)
- `/verify-email` - Email verification (with token)

### Admin Routes (ROLE_ADMIN required)

- `/admin/dashboard` - Admin dashboard
- `/admin/users` - User management
- `/admin/users/:id` - User details
- `/admin/users/:id/edit` - Edit user
- `/admin/profile` - Admin profile
- `/admin/sessions` - Active sessions

### User Routes (Authenticated)

- `/dashboard` - User dashboard (redirects to profile)
- `/profile` - User profile
- `/change-password` - Change password
- `/sessions` - Active sessions

## Role-Based Access

The application supports two user roles:

- **ROLE_ADMIN** - Full access to admin dashboard and user management
- **ROLE_NORMAL** - Access to user profile and personal settings

After login, users are automatically redirected based on their role:

- Admins → `/admin/dashboard`
- Users → `/dashboard` (redirects to `/profile`)

## API Integration

All API endpoints from the Spring Boot backend are integrated:

- Authentication endpoints (`/api/v1/auth`)
- Admin user management endpoints (`/api/v1/admin`)
- User profile endpoints (`/api/v1/users/me`)

## Environment Variables

- `VITE_API_BASE_URL` - Backend API base URL (default: http://localhost:9090)
- `VITE_APP_NAME` - Application name
- `VITE_ENABLE_DARK_MODE` - Enable dark mode (optional)

## Development Notes

- JWT tokens are stored in localStorage
- Token refresh is handled automatically via Axios interceptors
- Form validation uses Zod schemas matching backend validation
- All API calls use React Query for caching and state management
- Error handling is centralized with toast notifications

## License

This project is part of the SAAS Starter Kit.
