package com.siyamuddin.saas.Services;

/**
 * Service to provide dynamic configuration values from database (via AppSettingsService)
 * with fallback to static properties files.
 * This ensures admin-configured settings always take precedence.
 */
public interface DynamicConfigService {
    
    // Security Settings
    Integer getMaxFailedLoginAttempts();
    Integer getAccountLockoutDurationMinutes();
    Integer getPasswordMinLength();
    Integer getPasswordMaxLength();
    Boolean getPasswordRequireUppercase();
    Boolean getPasswordRequireLowercase();
    Boolean getPasswordRequireDigit();
    Boolean getPasswordRequireSpecialChar();
    Integer getPasswordHistoryCount();
    Integer getSessionTimeoutMinutes();
    Integer getEmailVerificationTokenExpiryHours();
    Integer getPasswordResetTokenExpiryHours();
    Boolean getRequireEmailVerificationForLogin();
    
    // Rate Limit Settings
    Integer getLoginRateLimitRequests();
    Integer getLoginRateLimitDuration();
    Integer getRegistrationRateLimitRequests();
    Integer getRegistrationRateLimitDuration();
    Integer getPasswordChangeRateLimitRequests();
    Integer getPasswordChangeRateLimitDuration();
    
    // Email Settings  
    String getEmailFrom();
    String getEmailFromName();
    String getEmailVerificationBaseUrl();
    String getEmailPasswordResetBaseUrl();
    Boolean getEmailEnabled();
}

