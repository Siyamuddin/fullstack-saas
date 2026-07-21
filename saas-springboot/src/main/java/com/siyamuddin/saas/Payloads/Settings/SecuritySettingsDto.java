package com.siyamuddin.saas.Payloads.Settings;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SecuritySettingsDto {
    
    @NotNull(message = "Max failed login attempts is required")
    @Min(value = 3, message = "Max failed login attempts must be at least 3")
    @Max(value = 10, message = "Max failed login attempts must not exceed 10")
    private Integer maxFailedLoginAttempts;
    
    @NotNull(message = "Account lockout duration is required")
    @Min(value = 5, message = "Lockout duration must be at least 5 minutes")
    @Max(value = 1440, message = "Lockout duration must not exceed 1440 minutes (24 hours)")
    private Integer accountLockoutDuration; // in minutes
    
    @NotNull(message = "Password min length is required")
    @Min(value = 8, message = "Password min length must be at least 8")
    @Max(value = 32, message = "Password min length must not exceed 32")
    private Integer passwordMinLength;
    
    @NotNull(message = "Password max length is required")
    @Min(value = 16, message = "Password max length must be at least 16")
    @Max(value = 256, message = "Password max length must not exceed 256")
    private Integer passwordMaxLength;
    
    @NotNull(message = "Password require uppercase setting is required")
    private Boolean passwordRequireUppercase;
    
    @NotNull(message = "Password require lowercase setting is required")
    private Boolean passwordRequireLowercase;
    
    @NotNull(message = "Password require digit setting is required")
    private Boolean passwordRequireDigit;
    
    @NotNull(message = "Password require special char setting is required")
    private Boolean passwordRequireSpecialChar;
    
    @NotNull(message = "Session timeout is required")
    @Min(value = 5, message = "Session timeout must be at least 5 minutes")
    @Max(value = 1440, message = "Session timeout must not exceed 1440 minutes (24 hours)")
    private Integer sessionTimeout; // in minutes
    
    @NotNull(message = "Require email verification setting is required")
    private Boolean requireEmailVerification;
    
    @NotNull(message = "Email verification token expiry is required")
    @Min(value = 1, message = "Token expiry must be at least 1 hour")
    @Max(value = 72, message = "Token expiry must not exceed 72 hours")
    private Integer emailVerificationTokenExpiry; // in hours
    
    @NotNull(message = "Password reset token expiry is required")
    @Min(value = 1, message = "Token expiry must be at least 1 hour")
    @Max(value = 24, message = "Token expiry must not exceed 24 hours")
    private Integer passwordResetTokenExpiry; // in hours
}

