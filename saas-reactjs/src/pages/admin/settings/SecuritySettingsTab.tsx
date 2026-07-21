import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SecuritySettings } from '../../../api/settings';
import { useUpdateSecuritySettings } from '../../../hooks';
import { FormInput, FormCheckbox, FormButton } from '../../../components/forms';

const securitySchema = z.object({
  maxFailedLoginAttempts: z.number().min(3).max(10),
  accountLockoutDuration: z.number().min(5).max(1440),
  passwordMinLength: z.number().min(8).max(32),
  passwordMaxLength: z.number().min(16).max(256),
  passwordRequireUppercase: z.boolean(),
  passwordRequireLowercase: z.boolean(),
  passwordRequireDigit: z.boolean(),
  passwordRequireSpecialChar: z.boolean(),
  sessionTimeout: z.number().min(5).max(1440),
  requireEmailVerification: z.boolean(),
  emailVerificationTokenExpiry: z.number().min(1).max(72),
  passwordResetTokenExpiry: z.number().min(1).max(24),
});

interface SecuritySettingsTabProps {
  settings: SecuritySettings;
  onUnsavedChanges: (hasChanges: boolean) => void;
}

export function SecuritySettingsTab({ settings, onUnsavedChanges }: SecuritySettingsTabProps) {
  const { register, handleSubmit, formState: { errors, isDirty }, reset } = useForm<SecuritySettings>({
    resolver: zodResolver(securitySchema),
    defaultValues: settings,
  });

  const { mutate: updateSettings, isPending: isUpdating } = useUpdateSecuritySettings();

  useEffect(() => {
    onUnsavedChanges(isDirty);
  }, [isDirty, onUnsavedChanges]);

  const onSubmit = (data: SecuritySettings) => {
    updateSettings(data, {
      onSuccess: () => {
        reset(data);
        onUnsavedChanges(false);
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Account Security */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Account Security</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            label="Max Failed Login Attempts"
            type="number"
            error={errors.maxFailedLoginAttempts?.message}
            helperText="Number of failed attempts before account lockout (3-10)"
            required
            {...register('maxFailedLoginAttempts', { valueAsNumber: true })}
          />

          <FormInput
            label="Account Lockout Duration (minutes)"
            type="number"
            error={errors.accountLockoutDuration?.message}
            helperText="How long account stays locked (5-1440 minutes)"
            required
            {...register('accountLockoutDuration', { valueAsNumber: true })}
          />

          <FormInput
            label="Session Timeout (minutes)"
            type="number"
            error={errors.sessionTimeout?.message}
            helperText="User session timeout duration (5-1440 minutes)"
            required
            {...register('sessionTimeout', { valueAsNumber: true })}
          />

          <div className="flex items-center h-full">
            <FormCheckbox
              label="Require Email Verification"
              helperText="Users must verify email before login"
              {...register('requireEmailVerification')}
            />
          </div>
        </div>
      </div>

      {/* Password Requirements */}
      <div className="border-t border-blue-500/20 pt-6">
        <h3 className="text-lg font-semibold text-white mb-4">Password Requirements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            label="Minimum Length"
            type="number"
            error={errors.passwordMinLength?.message}
            helperText="Minimum password length (8-32)"
            required
            {...register('passwordMinLength', { valueAsNumber: true })}
          />

          <FormInput
            label="Maximum Length"
            type="number"
            error={errors.passwordMaxLength?.message}
            helperText="Maximum password length (16-256)"
            required
            {...register('passwordMaxLength', { valueAsNumber: true })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <FormCheckbox
            label="Require Uppercase Letter"
            helperText="Password must contain at least one uppercase letter"
            {...register('passwordRequireUppercase')}
          />

          <FormCheckbox
            label="Require Lowercase Letter"
            helperText="Password must contain at least one lowercase letter"
            {...register('passwordRequireLowercase')}
          />

          <FormCheckbox
            label="Require Digit"
            helperText="Password must contain at least one number"
            {...register('passwordRequireDigit')}
          />

          <FormCheckbox
            label="Require Special Character"
            helperText="Password must contain at least one special character"
            {...register('passwordRequireSpecialChar')}
          />
        </div>
      </div>

      {/* Token Expiry */}
      <div className="border-t border-blue-500/20 pt-6">
        <h3 className="text-lg font-semibold text-white mb-4">Token Expiry</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            label="Email Verification Token Expiry (hours)"
            type="number"
            error={errors.emailVerificationTokenExpiry?.message}
            helperText="How long verification links are valid (1-72 hours)"
            required
            {...register('emailVerificationTokenExpiry', { valueAsNumber: true })}
          />

          <FormInput
            label="Password Reset Token Expiry (hours)"
            type="number"
            error={errors.passwordResetTokenExpiry?.message}
            helperText="How long reset links are valid (1-24 hours)"
            required
            {...register('passwordResetTokenExpiry', { valueAsNumber: true })}
          />
        </div>
      </div>

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
