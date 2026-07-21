import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { OAuthSettings } from '../../../api/settings';
import { useUpdateOAuthSettings, useTestOAuthConfig } from '../../../hooks';
import { FormInput, FormCheckbox, FormButton } from '../../../components/forms';

const oauthSchema = z.object({
  enabled: z.boolean(),
  clientId: z.string(),
  clientSecret: z.string(),
  redirectUri: z.string().url('Invalid redirect URI'),
  authorizedDomains: z.string(),
  scopes: z.string().min(1, 'At least one scope is required'),
});

interface OAuthSettingsTabProps {
  settings: OAuthSettings;
  onUnsavedChanges: (hasChanges: boolean) => void;
}

export function OAuthSettingsTab({ settings, onUnsavedChanges }: OAuthSettingsTabProps) {
  const [showClientSecret, setShowClientSecret] = useState(false);
  const [isSecretChanged, setIsSecretChanged] = useState(false);

  const { register, handleSubmit, formState: { errors, isDirty }, watch, reset, setValue } = useForm<OAuthSettings>({
    resolver: zodResolver(oauthSchema),
    defaultValues: settings,
  });

  const { mutate: updateSettings, isPending: isUpdating } = useUpdateOAuthSettings();
  const { mutate: testConfig, isPending: isTesting } = useTestOAuthConfig();

  const isEnabled = watch('enabled');
  const currentScopes = watch('scopes');

  useEffect(() => {
    onUnsavedChanges(isDirty);
  }, [isDirty, onUnsavedChanges]);

  const onSubmit = (data: OAuthSettings) => {
    // If secret wasn't changed, send masked value
    if (!isSecretChanged) {
      data.clientSecret = '********';
    }
    updateSettings(data, {
      onSuccess: () => {
        reset(data);
        setIsSecretChanged(false);
        onUnsavedChanges(false);
      },
    });
  };

  const handleTestConfig = () => {
    const currentData = watch();
    testConfig(currentData as OAuthSettings);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
  };

  const scopeOptions = [
    { value: 'openid', label: 'OpenID', description: 'Required for OAuth' },
    { value: 'profile', label: 'Profile', description: 'User name and profile info' },
    { value: 'email', label: 'Email', description: 'User email address' },
  ];

  const toggleScope = (scope: string) => {
    const scopes = currentScopes.split(',').map(s => s.trim()).filter(Boolean);
    const index = scopes.indexOf(scope);
    
    if (index > -1) {
      scopes.splice(index, 1);
    } else {
      scopes.push(scope);
    }
    
    setValue('scopes', scopes.join(','), { shouldDirty: true });
  };

  const isScopeSelected = (scope: string) => {
    return currentScopes.split(',').map(s => s.trim()).includes(scope);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* OAuth Status */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">Google OAuth Login</h3>
            <p className="text-sm text-gray-400 mb-4">
              Allow users to sign in with their Google account. You'll need to create a Google Cloud project and configure OAuth 2.0 credentials.
            </p>
            <a
              href="https://console.cloud.google.com/apis/credentials"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-400 hover:text-cyan-400 transition-colors"
            >
              → Create Google OAuth Credentials
            </a>
          </div>
          <div className="ml-4">
            <FormCheckbox
              label={isEnabled ? 'Enabled' : 'Disabled'}
              {...register('enabled')}
            />
          </div>
        </div>
      </div>

      {/* OAuth Configuration */}
      {isEnabled && (
        <>
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">OAuth Credentials</h3>
            <div className="grid grid-cols-1 gap-6">
              <FormInput
                label="Client ID"
                placeholder="123456789-abcdefg.apps.googleusercontent.com"
                error={errors.clientId?.message}
                helperText="Google OAuth Client ID from Google Cloud Console"
                required
                {...register('clientId')}
              />

              <div className="relative">
                <FormInput
                  label="Client Secret"
                  type={showClientSecret ? 'text' : 'password'}
                  placeholder={isSecretChanged ? 'Enter new client secret' : '••••••••'}
                  error={errors.clientSecret?.message}
                  helperText={isSecretChanged ? 'Enter new client secret' : 'Leave unchanged to keep current secret'}
                  {...register('clientSecret', {
                    onChange: () => setIsSecretChanged(true),
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowClientSecret(!showClientSecret)}
                  className="absolute right-3 top-9 text-gray-400 hover:text-white"
                >
                  {showClientSecret ? '🙈' : '👁️'}
                </button>
              </div>

              <div className="relative">
                <FormInput
                  label="Redirect URI"
                  placeholder="http://localhost:3000/oauth/callback"
                  error={errors.redirectUri?.message}
                  helperText="Add this URI to your Google OAuth configuration"
                  required
                  {...register('redirectUri')}
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(watch('redirectUri'))}
                  className="absolute right-3 top-9 text-gray-400 hover:text-white"
                  title="Copy to clipboard"
                >
                  📋
                </button>
              </div>
            </div>
          </div>

          {/* Authorization Settings */}
          <div className="border-t border-blue-500/20 pt-6">
            <h3 className="text-lg font-semibold text-white mb-4">Authorization Settings</h3>
            <div className="space-y-6">
              <FormInput
                label="Authorized Domains (Optional)"
                placeholder="example.com, company.com"
                error={errors.authorizedDomains?.message}
                helperText="Comma-separated list of allowed email domains. Leave empty to allow all domains."
                {...register('authorizedDomains')}
              />

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  OAuth Scopes <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3">
                  {scopeOptions.map((scope) => (
                    <div
                      key={scope.value}
                      className="flex items-start p-3 bg-slate-700/30 rounded-lg border border-slate-600"
                    >
                      <input
                        type="checkbox"
                        checked={isScopeSelected(scope.value)}
                        onChange={() => toggleScope(scope.value)}
                        className="mt-1 w-5 h-5 bg-slate-800/50 border border-slate-700 rounded text-blue-600 focus:ring-2 focus:ring-blue-500/50"
                      />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-white">{scope.label}</p>
                        <p className="text-xs text-gray-400">{scope.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {errors.scopes && (
                  <p className="mt-2 text-sm text-red-400">{errors.scopes.message}</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}

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

        {isEnabled && (
          <FormButton
            type="button"
            variant="secondary"
            onClick={handleTestConfig}
            isLoading={isTesting}
            loadingText="Testing..."
          >
            Test Configuration
          </FormButton>
        )}

        <FormButton
          type="button"
          variant="ghost"
          onClick={() => {
            reset(settings);
            setIsSecretChanged(false);
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
