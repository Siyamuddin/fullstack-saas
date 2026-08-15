package com.siyamuddin.saas.Payloads.Settings;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FileStorageSettingsDto {
    
    @NotBlank(message = "Storage mode is required")
    @Pattern(regexp = "local|s3", message = "Storage mode must be 'local' or 's3'")
    private String mode;
    
    @NotNull(message = "Max file size is required")
    @Min(value = 1024, message = "Max file size must be at least 1KB")
    @Max(value = 104857600, message = "Max file size must not exceed 100MB")
    private Long maxFileSize; // in bytes
    
    @NotBlank(message = "Allowed image types is required")
    private String allowedImageTypes; // comma-separated MIME types
    
    // Local storage settings
    private String localBasePath;
    private String localPublicPrefix;
    
    // S3 storage settings
    private String s3BucketName;
    private String s3Region;
    private String s3AccessKey; // Masked in responses
    private String s3SecretKey; // Masked in responses
    private String s3PublicBaseUrl;
    
    @NotNull(message = "Cleanup enabled setting is required")
    private Boolean cleanupEnabled;
}

