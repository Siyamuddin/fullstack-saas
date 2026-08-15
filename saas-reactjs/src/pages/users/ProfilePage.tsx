import { useState, useEffect, ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  useCurrentUser,
  useUpdateCurrentUser,
  useDeleteMyAccount,
  useChangePassword,
  useUploadProfilePhoto,
} from '@/hooks';
import { getErrorMessage } from '@/utils/errorHandler';
import { logger } from '@/utils/logger';
import { UserDto } from '@/types/user';

const profileSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  about: z.string().max(500, 'About must not exceed 500 characters').optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!?*~`_\-[\]{}|\\:;"'<>,./])(?=\S+$).{8,}$/,
        'Password must contain uppercase, lowercase, digit, and special character'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export type ProfileVariant = 'admin' | 'user';

interface ProfilePageProps {
  variant?: ProfileVariant;
}

export function ProfilePage({ variant = 'user' }: ProfilePageProps) {
  const isAdmin = variant === 'admin';
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const { data: currentUser } = useCurrentUser();
  const displayUser = currentUser ?? user ?? undefined;

  const updateMutation = useUpdateCurrentUser();
  const deleteAccountMutation = useDeleteMyAccount();
  const changePasswordMutation = useChangePassword();
  const uploadPhotoMutation = useUploadProfilePhoto();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: displayUser
      ? {
          name: displayUser.name,
          email: displayUser.email,
          about: displayUser.about,
        }
      : undefined,
  });

  useEffect(() => {
    if (displayUser) {
      reset({
        name: displayUser.name,
        email: displayUser.email,
        about: displayUser.about,
      });
    }
  }, [displayUser, reset]);

  const passwordForm = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = (data: ProfileFormData) => {
    updateMutation.mutate(data as Partial<UserDto>, {
      onSuccess: () => {
        refreshUser();
        setIsEditing(false);
        logger.userAction(isAdmin ? 'Admin profile updated' : 'Profile updated');
      },
    });
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    uploadPhotoMutation.mutate(file, {
      onSuccess: () => {
        refreshUser();
        logger.userAction(isAdmin ? 'Admin profile photo uploaded' : 'Profile photo uploaded', {
          fileType: file.type,
          fileSize: file.size,
        });
      },
    });
  };

  const handleDeleteAccount = () => {
    if (
      window.confirm(
        'Are you sure you want to delete your account? This action cannot be undone. All your data will be permanently deleted.'
      )
    ) {
      deleteAccountMutation.mutate(undefined, {
        onSuccess: async () => {
          logger.userAction(isAdmin ? 'Admin account deleted' : 'Account deleted');
          await logout();
          navigate('/');
        },
      });
    }
  };

  const onSubmitPassword = (data: ChangePasswordFormData) => {
    changePasswordMutation.mutate(
      {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      },
      {
        onSuccess: () => {
          logger.userAction(
            isAdmin ? 'Admin password changed via profile' : 'Password changed via profile'
          );
          setShowChangePassword(false);
          passwordForm.reset();
          setPasswordError(null);
        },
        onError: (error: unknown) => {
          const errorMessage = getErrorMessage(error);
          logger.error(isAdmin ? 'Admin password change failed' : 'Password change failed', error);
          setPasswordError(errorMessage);

          if (
            errorMessage.toLowerCase().includes('current password') ||
            (errorMessage.toLowerCase().includes('password') &&
              errorMessage.toLowerCase().includes('incorrect'))
          ) {
            passwordForm.setError('currentPassword', {
              type: 'manual',
              message: 'The current password is incorrect',
            });
          } else if (
            errorMessage.toLowerCase().includes('same as') ||
            errorMessage.toLowerCase().includes('cannot use the same')
          ) {
            passwordForm.setError('newPassword', {
              type: 'manual',
              message: 'New password must be different from current password',
            });
          }

          // Field-level errors set above; hook shows the toast
        },
      }
    );
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          {isAdmin ? 'Admin Profile' : 'My Profile'}
        </h1>
        <p className="mt-2 text-gray-300">
          {isAdmin ? 'Manage your admin profile' : 'Manage your profile information'}
        </p>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm border border-blue-500/20 rounded-xl shadow-xl p-6">
        <div className="flex items-start space-x-6">
          <div className="relative">
            {displayUser?.profileImageUrl ? (
              <img
                src={displayUser.profileImageUrl}
                alt={displayUser.name}
                className="w-32 h-32 rounded-full border-2 border-blue-500/30"
              />
            ) : (
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center border-2 border-blue-500/30">
                <span className="text-white text-4xl font-semibold">
                  {displayUser?.name?.charAt(0).toUpperCase() || (isAdmin ? 'A' : 'U')}
                </span>
              </div>
            )}
            <label className="absolute bottom-0 right-0 bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-2 rounded-full cursor-pointer hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploadPhotoMutation.isPending}
                className="hidden"
              />
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </label>
          </div>

          <div className="flex-1">
            {isEditing ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">Name</label>
                  <input
                    {...register('name')}
                    type="text"
                    className="mt-1 block w-full px-3 py-2 bg-slate-700/50 border border-blue-500/30 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300">Email</label>
                  <input
                    {...register('email')}
                    type="email"
                    className="mt-1 block w-full px-3 py-2 bg-slate-700/50 border border-blue-500/30 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300">About</label>
                  <textarea
                    {...register('about')}
                    rows={4}
                    className="mt-1 block w-full px-3 py-2 bg-slate-700/50 border border-blue-500/30 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.about && (
                    <p className="mt-1 text-sm text-red-400">{errors.about.message}</p>
                  )}
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg shadow-blue-500/50 disabled:opacity-50"
                  >
                    {updateMutation.isPending ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      if (displayUser) {
                        reset({
                          name: displayUser.name,
                          email: displayUser.email,
                          about: displayUser.about,
                        });
                      }
                    }}
                    className="px-4 py-2 bg-slate-700/50 text-gray-300 rounded-lg hover:bg-slate-700 transition-colors border border-blue-500/20"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <h2 className="text-2xl font-semibold text-white mb-2">{displayUser?.name}</h2>
                <p className="text-gray-300 mb-4">{displayUser?.email}</p>
                {displayUser?.about && <p className="text-gray-300 mb-4">{displayUser.about}</p>}
                {isAdmin && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {displayUser?.roles?.map((role) => (
                      <span
                        key={role.id}
                        className="px-3 py-1 text-sm rounded-full bg-gradient-to-r from-blue-600/30 to-cyan-600/30 text-blue-300 border border-blue-500/30"
                      >
                        {role.name}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg shadow-blue-500/50"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={() => setShowChangePassword(true)}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg shadow-purple-500/50"
                  >
                    Change Password
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteAccountMutation.isPending}
                    className="px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-all shadow-lg shadow-red-500/50 disabled:opacity-50"
                  >
                    {deleteAccountMutation.isPending ? 'Deleting...' : 'Delete My Account'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {showChangePassword && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800/95 backdrop-blur-sm border border-blue-500/20 rounded-xl shadow-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Change Password</h2>
              <button
                onClick={() => {
                  setShowChangePassword(false);
                  passwordForm.reset();
                  setPasswordError(null);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="space-y-4">
              {passwordError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-start space-x-2">
                  <svg
                    className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-sm text-red-400 flex-1">{passwordError}</p>
                </div>
              )}
              <div>
                <label
                  htmlFor="currentPassword"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Current Password
                </label>
                <input
                  {...passwordForm.register('currentPassword')}
                  type="password"
                  className={`w-full px-3 py-2 bg-slate-700/50 border ${
                    passwordForm.formState.errors.currentPassword || passwordError
                      ? 'border-red-500/50'
                      : 'border-blue-500/30'
                  } text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                />
                {passwordForm.formState.errors.currentPassword && (
                  <p className="mt-1 text-sm text-red-400 flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{passwordForm.formState.errors.currentPassword.message}</span>
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  New Password
                </label>
                <input
                  {...passwordForm.register('newPassword')}
                  type="password"
                  className="w-full px-3 py-2 bg-slate-700/50 border border-blue-500/30 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {passwordForm.formState.errors.newPassword && (
                  <p className="mt-1 text-sm text-red-400">
                    {passwordForm.formState.errors.newPassword.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Confirm New Password
                </label>
                <input
                  {...passwordForm.register('confirmPassword')}
                  type="password"
                  className="w-full px-3 py-2 bg-slate-700/50 border border-blue-500/30 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-400">
                    {passwordForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg shadow-blue-500/50 disabled:opacity-50"
                >
                  {changePasswordMutation.isPending ? 'Changing...' : 'Change Password'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowChangePassword(false);
                    passwordForm.reset();
                    setPasswordError(null);
                  }}
                  className="px-4 py-2 bg-slate-700/50 text-gray-300 rounded-lg hover:bg-slate-700 transition-colors border border-blue-500/20"
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
