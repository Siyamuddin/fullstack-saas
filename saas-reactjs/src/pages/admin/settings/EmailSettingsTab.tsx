import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EmailSettings } from '../../../api/settings';
import { useUpdateEmailSettings, useTestEmailConnection } from '../../../hooks';
import { FormInput, FormCheckbox, FormButton } from '../../../components/forms';

const emailSchema = z.object({
  host: z.string().min(1, 'Host is required'),
  port: z.number().min(1).max(65535),
  username: z.string(),
  password: z.string(),
  from: z.string().email('Invalid email address'),
  fromName: z.string().min(1, 'From name is required'),
  enabled: z.boolean(),
  verificationBaseUrl: z.string().url('Invalid URL'),
  passwordResetBaseUrl: z.string().url('Invalid URL'),
  smtpAuth: z.boolean(),
  smtpTls: z.boolean(),
});

interface EmailSettingsTabProps {
  settings: EmailSettings;
  onUnsavedChanges: (hasChanges: boolean) => void;
}

export function EmailSettingsTab({ settings, onUnsavedChanges }: EmailSettingsTabProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordChanged, setIsPasswordChanged] = useState(false);

  const { register, handleSubmit, formState: { errors, isDirty }, watch, reset } = useForm<EmailSettings>({
    resolver: zodResolver(emailSchema),
    defaultValues: settings,
  });

  const { mutate: updateSettings, isPending: isUpdating } = useUpdateEmailSettings();
  const { mutate: testConnection, isPending: isTesting } = useTestEmailConnection();

  useEffect(() => {
    onUnsavedChanges(isDirty);
  }, [isDirty, onUnsavedChanges]);

  const onSubmit = (data: EmailSettings) => {
    // If password wasn't changed, send masked value
    if (!isPasswordChanged) {
      data.password = '********';
    }
    updateSettings(data, {
      onSuccess: () => {
        reset(data);
        setIsPasswordChanged(false);
        onUnsavedChanges(false);
      },
    });
  };

  const handleTestConnection = () => {
    const currentData = watch();
    testConnection(currentData as EmailSettings);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormInput
          label="SMTP Host"
          placeholder="smtp.gmail.com"
          error={errors.host?.message}
          helperText="SMTP server hostname"
          required
          {...register('host')}
        />

        <FormInput
          label="SMTP Port"
          type="number"
          placeholder="587"
          error={errors.port?.message}
          helperText="Common ports: 587 (TLS), 465 (SSL), 25"
          required
          {...register('port', { valueAsNumber: true })}
        />

        <FormInput
          label="Username"
          placeholder="your-email@gmail.com"
          error={errors.username?.message}
          helperText="SMTP authentication username"
          {...register('username')}
        />

        <div className="relative">
          <FormInput
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder={isPasswordChanged ? 'Enter new password' : '••••••••'}
            error={errors.password?.message}
            helperText={isPasswordChanged ? 'Enter new SMTP password' : 'Leave unchanged to keep current password'}
            {...register('password', {
              onChange: () => setIsPasswordChanged(true),
            })}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-gray-400 hover:text-white"
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>

        <FormInput
          label="From Email"
          type="email"
          placeholder="noreply@example.com"
          error={errors.from?.message}
          helperText="Email address shown as sender"
          required
          {...register('from')}
        />

        <FormInput
          label="From Name"
          placeholder="SAAS Starter"
          error={errors.fromName?.message}
          helperText="Name shown as sender"
          required
          {...register('fromName')}
        />

        <FormInput
          label="Verification Base URL"
          placeholder="http://localhost:3000/verify-email"
          error={errors.verificationBaseUrl?.message}
          helperText="Base URL for email verification links"
          required
          {...register('verificationBaseUrl')}
        />

        <FormInput
          label="Password Reset Base URL"
          placeholder="http://localhost:3000/reset-password"
          error={errors.passwordResetBaseUrl?.message}
          helperText="Base URL for password reset links"
          required
          {...register('passwordResetBaseUrl')}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-blue-500/20">
        <FormCheckbox
          label="Enable Email"
          helperText="Enable/disable all email functionality"
          {...register('enabled')}
        />

        <FormCheckbox
          label="SMTP Authentication"
          helperText="Enable SMTP authentication"
          {...register('smtpAuth')}
        />

        <FormCheckbox
          label="SMTP TLS"
          helperText="Enable SMTP TLS/STARTTLS"
          {...register('smtpTls')}
        />
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
          variant="secondary"
          onClick={handleTestConnection}
          isLoading={isTesting}
          loadingText="Testing..."
        >
          Test Connection
        </FormButton>

        <FormButton
          type="button"
          variant="ghost"
          onClick={() => {
            reset(settings);
            setIsPasswordChanged(false);
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
