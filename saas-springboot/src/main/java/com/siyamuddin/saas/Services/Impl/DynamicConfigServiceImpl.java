package com.siyamuddin.saas.Services.Impl;

import com.siyamuddin.saas.Config.Properties.EmailProperties;
import com.siyamuddin.saas.Config.Properties.RateLimitProperties;
import com.siyamuddin.saas.Config.Properties.SecurityProperties;
import com.siyamuddin.saas.Services.AppSettingsService;
import com.siyamuddin.saas.Services.DynamicConfigService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.stereotype.Service;

/**
 * Implementation that reads configuration from database first, falls back to properties files.
 * Uses @RefreshScope to reload when admin updates settings.
 */
@Slf4j
@Service
@RefreshScope
public class DynamicConfigServiceImpl implements DynamicConfigService {
    
    private final AppSettingsService appSettingsService;
    private final SecurityProperties securityProperties;
    private final RateLimitProperties rateLimitProperties;
    private final EmailProperties emailProperties;

    public DynamicConfigServiceImpl(
            @Autowired(required = false) AppSettingsService appSettingsService,
            SecurityProperties securityProperties,
            RateLimitProperties rateLimitProperties,
            EmailProperties emailProperties) {
        this.appSettingsService = appSettingsService;
        this.securityProperties = securityProperties;
        this.rateLimitProperties = rateLimitProperties;
        this.emailProperties = emailProperties;
    }
    
    // Security Settings
    
    @Override
    public Integer getMaxFailedLoginAttempts() {
        if (appSettingsService != null) {
            try {
                return Integer.parseInt(appSettingsService.getSettingValue("security.maxFailedLoginAttempts", 
                    String.valueOf(securityProperties.getMaxFailedLoginAttempts())));
            } catch (Exception e) {
                log.warn("Failed to get maxFailedLoginAttempts from database, using properties", e);
            }
        }
        return securityProperties.getMaxFailedLoginAttempts();
    }
    
    @Override
    public Integer getAccountLockoutDurationMinutes() {
        if (appSettingsService != null) {
            try {
                return Integer.parseInt(appSettingsService.getSettingValue("security.lockoutDurationMinutes",
                    String.valueOf(securityProperties.getAccountLockoutDurationMinutes())));
            } catch (Exception e) {
                log.warn("Failed to get lockoutDuration from database, using properties", e);
            }
        }
        return securityProperties.getAccountLockoutDurationMinutes();
    }
    
    @Override
    public Integer getPasswordMinLength() {
        if (appSettingsService != null) {
            try {
                return Integer.parseInt(appSettingsService.getSettingValue("security.passwordMinLength",
                    String.valueOf(securityProperties.getPasswordMinLength())));
            } catch (Exception e) {
                log.warn("Failed to get passwordMinLength from database, using properties", e);
            }
        }
        return securityProperties.getPasswordMinLength();
    }
    
    @Override
    public Integer getPasswordMaxLength() {
        if (appSettingsService != null) {
            try {
                return Integer.parseInt(appSettingsService.getSettingValue("security.passwordMaxLength",
                    String.valueOf(securityProperties.getPasswordMaxLength())));
            } catch (Exception e) {
                log.warn("Failed to get passwordMaxLength from database, using properties", e);
            }
        }
        return securityProperties.getPasswordMaxLength();
    }
    
    @Override
    public Boolean getPasswordRequireUppercase() {
        if (appSettingsService != null) {
            try {
                return Boolean.parseBoolean(appSettingsService.getSettingValue("security.passwordRequireUppercase",
                    String.valueOf(securityProperties.getPasswordRequireUppercase())));
            } catch (Exception e) {
                log.warn("Failed to get passwordRequireUppercase from database, using properties", e);
            }
        }
        return securityProperties.getPasswordRequireUppercase();
    }
    
    @Override
    public Boolean getPasswordRequireLowercase() {
        if (appSettingsService != null) {
            try {
                return Boolean.parseBoolean(appSettingsService.getSettingValue("security.passwordRequireLowercase",
                    String.valueOf(securityProperties.getPasswordRequireLowercase())));
            } catch (Exception e) {
                log.warn("Failed to get passwordRequireLowercase from database, using properties", e);
            }
        }
        return securityProperties.getPasswordRequireLowercase();
    }
    
    @Override
    public Boolean getPasswordRequireDigit() {
        if (appSettingsService != null) {
            try {
                return Boolean.parseBoolean(appSettingsService.getSettingValue("security.passwordRequireDigit",
                    String.valueOf(securityProperties.getPasswordRequireDigit())));
            } catch (Exception e) {
                log.warn("Failed to get passwordRequireDigit from database, using properties", e);
            }
        }
        return securityProperties.getPasswordRequireDigit();
    }
    
    @Override
    public Boolean getPasswordRequireSpecialChar() {
        if (appSettingsService != null) {
            try {
                return Boolean.parseBoolean(appSettingsService.getSettingValue("security.passwordRequireSpecialChar",
                    String.valueOf(securityProperties.getPasswordRequireSpecialChar())));
            } catch (Exception e) {
                log.warn("Failed to get passwordRequireSpecialChar from database, using properties", e);
            }
        }
        return securityProperties.getPasswordRequireSpecialChar();
    }
    
    @Override
    public Integer getPasswordHistoryCount() {
        if (appSettingsService != null) {
            try {
                return Integer.parseInt(appSettingsService.getSettingValue("security.passwordHistoryCount",
                    String.valueOf(securityProperties.getPasswordHistoryCount())));
            } catch (Exception e) {
                log.warn("Failed to get passwordHistoryCount from database, using properties", e);
            }
        }
        return securityProperties.getPasswordHistoryCount();
    }
    
    @Override
    public Integer getSessionTimeoutMinutes() {
        if (appSettingsService != null) {
            try {
                return Integer.parseInt(appSettingsService.getSettingValue("security.sessionTimeoutMinutes",
                    String.valueOf(securityProperties.getSessionTimeoutMinutes())));
            } catch (Exception e) {
                log.warn("Failed to get sessionTimeoutMinutes from database, using properties", e);
            }
        }
        return securityProperties.getSessionTimeoutMinutes();
    }
    
    @Override
    public Integer getEmailVerificationTokenExpiryHours() {
        if (appSettingsService != null) {
            try {
                return Integer.parseInt(appSettingsService.getSettingValue("security.emailVerificationTokenExpiryHours",
                    String.valueOf(securityProperties.getEmailVerificationTokenExpiryHours())));
            } catch (Exception e) {
                log.warn("Failed to get emailVerificationTokenExpiryHours from database, using properties", e);
            }
        }
        return securityProperties.getEmailVerificationTokenExpiryHours();
    }
    
    @Override
    public Integer getPasswordResetTokenExpiryHours() {
        if (appSettingsService != null) {
            try {
                return Integer.parseInt(appSettingsService.getSettingValue("security.passwordResetTokenExpiryHours",
                    String.valueOf(securityProperties.getPasswordResetTokenExpiryHours())));
            } catch (Exception e) {
                log.warn("Failed to get passwordResetTokenExpiryHours from database, using properties", e);
            }
        }
        return securityProperties.getPasswordResetTokenExpiryHours();
    }
    
    @Override
    public Boolean getRequireEmailVerificationForLogin() {
        if (appSettingsService != null) {
            try {
                Boolean dbValue = securityProperties.getRequireEmailVerificationForLogin();
                return Boolean.parseBoolean(appSettingsService.getSettingValue("security.requireEmailVerificationForLogin",
                    String.valueOf(dbValue != null ? dbValue : false)));
            } catch (Exception e) {
                log.warn("Failed to get requireEmailVerificationForLogin from database, using properties", e);
            }
        }
        Boolean propValue = securityProperties.getRequireEmailVerificationForLogin();
        return propValue != null ? propValue : false;
    }
    
    // Rate Limit Settings
    
    @Override
    public Integer getLoginRateLimitRequests() {
        if (appSettingsService != null) {
            try {
                return Integer.parseInt(appSettingsService.getSettingValue("rateLimit.login.requests",
                    String.valueOf(rateLimitProperties.getLogin().getRequests())));
            } catch (Exception e) {
                log.warn("Failed to get login rate limit from database, using properties", e);
            }
        }
        return rateLimitProperties.getLogin().getRequests();
    }
    
    @Override
    public Integer getLoginRateLimitDuration() {
        if (appSettingsService != null) {
            try {
                return Integer.parseInt(appSettingsService.getSettingValue("rateLimit.login.duration",
                    String.valueOf(rateLimitProperties.getLogin().getDuration())));
            } catch (Exception e) {
                log.warn("Failed to get login rate limit duration from database, using properties", e);
            }
        }
        return rateLimitProperties.getLogin().getDuration();
    }
    
    @Override
    public Integer getRegistrationRateLimitRequests() {
        if (appSettingsService != null) {
            try {
                return Integer.parseInt(appSettingsService.getSettingValue("rateLimit.registration.requests",
                    String.valueOf(rateLimitProperties.getRegistration().getRequests())));
            } catch (Exception e) {
                log.warn("Failed to get registration rate limit from database, using properties", e);
            }
        }
        return rateLimitProperties.getRegistration().getRequests();
    }
    
    @Override
    public Integer getRegistrationRateLimitDuration() {
        if (appSettingsService != null) {
            try {
                return Integer.parseInt(appSettingsService.getSettingValue("rateLimit.registration.duration",
                    String.valueOf(rateLimitProperties.getRegistration().getDuration())));
            } catch (Exception e) {
                log.warn("Failed to get registration rate limit duration from database, using properties", e);
            }
        }
        return rateLimitProperties.getRegistration().getDuration();
    }
    
    @Override
    public Integer getPasswordChangeRateLimitRequests() {
        if (appSettingsService != null) {
            try {
                return Integer.parseInt(appSettingsService.getSettingValue("rateLimit.passwordChange.requests",
                    String.valueOf(rateLimitProperties.getPasswordChange().getRequests())));
            } catch (Exception e) {
                log.warn("Failed to get password change rate limit from database, using properties", e);
            }
        }
        return rateLimitProperties.getPasswordChange().getRequests();
    }
    
    @Override
    public Integer getPasswordChangeRateLimitDuration() {
        if (appSettingsService != null) {
            try {
                return Integer.parseInt(appSettingsService.getSettingValue("rateLimit.passwordChange.duration",
                    String.valueOf(rateLimitProperties.getPasswordChange().getDuration())));
            } catch (Exception e) {
                log.warn("Failed to get password change rate limit duration from database, using properties", e);
            }
        }
        return rateLimitProperties.getPasswordChange().getDuration();
    }
    
    // Email Settings
    
    @Override
    public String getEmailFrom() {
        if (appSettingsService != null) {
            try {
                return appSettingsService.getSettingValue("email.from", emailProperties.getFrom());
            } catch (Exception e) {
                log.warn("Failed to get email.from from database, using properties", e);
            }
        }
        return emailProperties.getFrom();
    }
    
    @Override
    public String getEmailFromName() {
        if (appSettingsService != null) {
            try {
                return appSettingsService.getSettingValue("email.fromName", emailProperties.getFromName());
            } catch (Exception e) {
                log.warn("Failed to get email.fromName from database, using properties", e);
            }
        }
        return emailProperties.getFromName();
    }
    
    @Override
    public String getEmailVerificationBaseUrl() {
        if (appSettingsService != null) {
            try {
                return appSettingsService.getSettingValue("email.verificationBaseUrl", emailProperties.getVerificationBaseUrl());
            } catch (Exception e) {
                log.warn("Failed to get email.verificationBaseUrl from database, using properties", e);
            }
        }
        return emailProperties.getVerificationBaseUrl();
    }
    
    @Override
    public String getEmailPasswordResetBaseUrl() {
        if (appSettingsService != null) {
            try {
                return appSettingsService.getSettingValue("email.passwordResetBaseUrl", emailProperties.getPasswordResetBaseUrl());
            } catch (Exception e) {
                log.warn("Failed to get email.passwordResetBaseUrl from database, using properties", e);
            }
        }
        return emailProperties.getPasswordResetBaseUrl();
    }
    
    @Override
    public Boolean getEmailEnabled() {
        if (appSettingsService != null) {
            try {
                return Boolean.parseBoolean(appSettingsService.getSettingValue("email.enabled", 
                    String.valueOf(emailProperties.getEnabled())));
            } catch (Exception e) {
                log.warn("Failed to get email.enabled from database, using properties", e);
            }
        }
        return emailProperties.getEnabled();
    }
}
