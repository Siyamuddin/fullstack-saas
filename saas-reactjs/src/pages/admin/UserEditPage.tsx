import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUser, useUpdateUser } from '@/hooks';
import { UserDto } from '@/types/user';

type EditUserFormData = {
  name: string;
  email: string;
  about?: string;
};

const editUserSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  about: z.string().max(500, 'About must not exceed 500 characters').optional(),
});

export function UserEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const userId = id ? parseInt(id) : 0;

  const { data: user, isLoading } = useUser(userId);
  const updateMutation = useUpdateUser();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
    defaultValues: user
      ? {
          name: user.name || '',
          email: user.email || '',
          about: user.about,
        }
      : undefined,
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        email: user.email || '',
        about: user.about,
      });
    }
  }, [user, reset]);

  const onSubmit = (data: EditUserFormData) => {
    updateMutation.mutate(
      { userId, userDto: data as Partial<UserDto> },
      {
        onSuccess: () => {
          navigate(`/admin/users/${userId}`);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => navigate(`/admin/users/${userId}`)}
          className="text-blue-600 hover:text-blue-700 mb-4"
        >
          ← Back to User Details
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Edit User</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              {...register('name')}
              type="text"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              {...register('email')}
              type="email"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="about" className="block text-sm font-medium text-gray-700">
              About
            </label>
            <textarea
              {...register('about')}
              rows={4}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.about && <p className="mt-1 text-sm text-red-600">{errors.about.message}</p>}
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/admin/users/${userId}`)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
