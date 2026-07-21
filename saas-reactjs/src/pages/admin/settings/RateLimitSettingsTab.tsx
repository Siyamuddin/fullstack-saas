import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { RateLimitSettings } from '../../../api/settings';
import { useUpdateRateLimitSettings } from '../../../hooks';
import { FormInput, FormButton } from '../../../components/forms';

const rateLimitSchema = z.object({
  loginRequests: z.number().min(1).max(10000),
  loginDuration: z.number().min(1).max(24),
  registrationRequests: z.number().min(1).max(10000),
  registrationDuration: z.number().min(1).max(24),
  passwordChangeRequests: z.number().min(1).max(10000),
  passwordChangeDuration: z.number().min(1).max(24),
  generalRequests: z.number().min(100).max(100000),
  generalDuration: z.number().min(1).max(24),
});

interface RateLimitSettingsTabProps {
  settings: RateLimitSettings;
  onUnsavedChanges: (hasChanges: boolean) => void;
}

export function RateLimitSettingsTab({ settings, onUnsavedChanges }: RateLimitSettingsTabProps) {
  const { register, handleSubmit, formState: { errors, isDirty }, reset } = useForm<RateLimitSettings>({
    resolver: zodResolver(rateLimitSchema),
    defaultValues: settings,
  });

  const { mutate: updateSettings, isPending: isUpdating } = useUpdateRateLimitSettings();

  useEffect(() => {
    onUnsavedChanges(isDirty);
  }, [isDirty, onUnsavedChanges]);

  const onSubmit = (data: RateLimitSettings) => {
    updateSettings(data, {
      onSuccess: () => {
        reset(data);
        onUnsavedChanges(false);
      },
    });
  };

  const rateLimitSections = [
    {
      title: 'Login Rate Limits',
      description: 'Limit login attempts to prevent brute force attacks',
      requestsField: 'loginRequests',
      durationField: 'loginDuration',
    },
    {
      title: 'Registration Rate Limits',
      description: 'Limit new account registrations',
      requestsField: 'registrationRequests',
      durationField: 'registrationDuration',
    },
    {
      title: 'Password Change Rate Limits',
      description: 'Limit password change requests',
      requestsField: 'passwordChangeRequests',
      durationField: 'passwordChangeDuration',
    },
    {
      title: 'General API Rate Limits',
      description: 'Overall API request limits for authenticated users',
      requestsField: 'generalRequests',
      durationField: 'generalDuration',
    },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-300">
          💡 Rate limits help protect your application from abuse. Lower values provide more protection but may impact legitimate users.
        </p>
      </div>

      {rateLimitSections.map((section, index) => (
        <div key={section.requestsField} className={index > 0 ? 'border-t border-blue-500/20 pt-6' : ''}>
          <h3 className="text-lg font-semibold text-white mb-2">{section.title}</h3>
          <p className="text-sm text-gray-400 mb-4">{section.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="Maximum Requests"
              type="number"
              error={errors[section.requestsField as keyof typeof errors]?.message}
              helperText="Number of requests allowed"
              required
              {...register(section.requestsField as any, { valueAsNumber: true })}
            />

            <FormInput
              label="Duration (hours)"
              type="number"
              error={errors[section.durationField as keyof typeof errors]?.message}
              helperText="Time window for rate limit"
              required
              {...register(section.durationField as any, { valueAsNumber: true })}
            />
          </div>
        </div>
      ))}

      <div className="flex gap-4 pt-6 border-t border-blue-500/20">
        <FormButton
          type="submit"
          variant="primary"
          isLoading={isUpdating}
          loadingText="Saving..."
          disabled={!isDirty}
        >
          Save Changes
        </FormButton>

        <FormButton
          type="button"
          variant="ghost"
          onClick={() => {
            reset(settings);
            onUnsavedChanges(false);
          }}
          disabled={!isDirty}
        >
          Reset
        </FormButton>
      </div>
    </form>
  );
}
