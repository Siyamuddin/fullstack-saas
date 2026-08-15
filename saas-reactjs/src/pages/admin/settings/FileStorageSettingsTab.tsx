import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FileStorageSettings } from '../../../api/settings';
import { useUpdateFileStorageSettings } from '../../../hooks';
import { FormInput, FormSelect, FormCheckbox, FormButton } from '../../../components/forms';

const fileStorageSchema = z.object({
  mode: z.enum(['local', 's3']),
  maxFileSize: z.number().min(1024).max(104857600),
  allowedImageTypes: z.string().min(1),
  localBasePath: z.string(),
  localPublicPrefix: z.string(),
  s3BucketName: z.string(),
  s3Region: z.string(),
  s3AccessKey: z.string(),
  s3SecretKey: z.string(),
  s3PublicBaseUrl: z.string(),
  cleanupEnabled: z.boolean(),
});

interface FileStorageSettingsTabProps {
  settings: FileStorageSettings;
  onUnsavedChanges: (hasChanges: boolean) => void;
}

export function FileStorageSettingsTab({ settings, onUnsavedChanges }: FileStorageSettingsTabProps) {
  const [showS3Keys, setShowS3Keys] = useState(false);
  const [areKeysChanged, setAreKeysChanged] = useState(false);

  const { register, handleSubmit, formState: { errors, isDirty }, watch, reset } = useForm<FileStorageSettings>({
    resolver: zodResolver(fileStorageSchema),
    defaultValues: settings,
  });

  const { mutate: updateSettings, isPending: isUpdating } = useUpdateFileStorageSettings();
  const storageMode = watch('mode');

  useEffect(() => {
    onUnsavedChanges(isDirty);
  }, [isDirty, onUnsavedChanges]);

  const onSubmit = (data: FileStorageSettings) => {
    // If keys weren't changed, send masked values
    if (!areKeysChanged) {
      data.s3AccessKey = '********';
      data.s3SecretKey = '********';
    }
    updateSettings(data, {
      onSuccess: () => {
        reset(data);
        setAreKeysChanged(false);
        onUnsavedChanges(false);
      },
    });
  };

  const formatFileSize = (bytes: number) => {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* General Settings */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">General Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormSelect
            label="Storage Mode"
            options={[
              { value: 'local', label: 'Local File System' },
              { value: 's3', label: 'Amazon S3' },
            ]}
            error={errors.mode?.message}
            helperText="Where to store uploaded files"
            required
            {...register('mode')}
          />

          <FormInput
            label="Max File Size (bytes)"
            type="number"
            error={errors.maxFileSize?.message}
            helperText={`Current: ${formatFileSize(watch('maxFileSize') || 5242880)}`}
            required
            {...register('maxFileSize', { valueAsNumber: true })}
          />

          <div className="md:col-span-2">
            <FormInput
              label="Allowed Image Types"
              placeholder="image/jpeg,image/png,image/gif"
              error={errors.allowedImageTypes?.message}
              helperText="Comma-separated MIME types"
              required
              {...register('allowedImageTypes')}
            />
          </div>

          <FormCheckbox
            label="Enable File Cleanup"
            helperText="Automatically delete files when records are deleted"
            {...register('cleanupEnabled')}
          />
        </div>
      </div>

      {/* Local Storage Settings */}
      {storageMode === 'local' && (
        <div className="border-t border-blue-500/20 pt-6">
          <h3 className="text-lg font-semibold text-white mb-4">Local Storage Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="Base Path"
              placeholder="uploads"
              error={errors.localBasePath?.message}
              helperText="Directory path for file storage"
              {...register('localBasePath')}
            />

            <FormInput
              label="Public URI Prefix"
              placeholder="/uploads"
              error={errors.localPublicPrefix?.message}
              helperText="URL prefix for accessing files"
              {...register('localPublicPrefix')}
            />
          </div>
        </div>
      )}

      {/* S3 Storage Settings */}
      {storageMode === 's3' && (
        <div className="border-t border-blue-500/20 pt-6">
          <h3 className="text-lg font-semibold text-white mb-4">Amazon S3 Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="S3 Bucket Name"
              placeholder="my-bucket"
              error={errors.s3BucketName?.message}
              helperText="AWS S3 bucket name"
              {...register('s3BucketName')}
            />

            <FormInput
              label="S3 Region"
              placeholder="us-east-1"
              error={errors.s3Region?.message}
              helperText="AWS region"
              {...register('s3Region')}
            />

            <div className="relative">
              <FormInput
                label="S3 Access Key"
                type={showS3Keys ? 'text' : 'password'}
                placeholder={areKeysChanged ? 'Enter new access key' : '••••••••'}
                error={errors.s3AccessKey?.message}
                helperText="AWS access key ID"
                {...register('s3AccessKey', {
                  onChange: () => setAreKeysChanged(true),
                })}
              />
              <button
                type="button"
                onClick={() => setShowS3Keys(!showS3Keys)}
                className="absolute right-3 top-9 text-gray-400 hover:text-white"
              >
                {showS3Keys ? '🙈' : '👁️'}
              </button>
            </div>

            <div className="relative">
              <FormInput
                label="S3 Secret Key"
                type={showS3Keys ? 'text' : 'password'}
                placeholder={areKeysChanged ? 'Enter new secret key' : '••••••••'}
                error={errors.s3SecretKey?.message}
                helperText="AWS secret access key"
                {...register('s3SecretKey', {
                  onChange: () => setAreKeysChanged(true),
                })}
              />
            </div>

            <div className="md:col-span-2">
              <FormInput
                label="S3 Public Base URL"
                placeholder="https://my-bucket.s3.amazonaws.com"
                error={errors.s3PublicBaseUrl?.message}
                helperText="Public URL for accessing S3 files"
                {...register('s3PublicBaseUrl')}
              />
            </div>
          </div>
        </div>
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

        <FormButton
          type="button"
          variant="ghost"
          onClick={() => {
            reset(settings);
            setAreKeysChanged(false);
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
