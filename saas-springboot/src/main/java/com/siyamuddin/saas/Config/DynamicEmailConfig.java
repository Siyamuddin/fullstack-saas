package com.siyamuddin.saas.Config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import com.siyamuddin.saas.Services.AppSettingsService;

import java.util.Properties;

/**
 * Dynamic email configuration that refreshes when admin updates email settings.
 * Uses @RefreshScope to reload JavaMailSender bean when settings change.
 */
@Slf4j
@Configuration
public class DynamicEmailConfig {
    
    private final AppSettingsService appSettingsService;

    public DynamicEmailConfig(@Autowired(required = false) AppSettingsService appSettingsService) {
        this.appSettingsService = appSettingsService;
    }
    
    @Bean
    @Primary
    @RefreshScope
    public JavaMailSender javaMailSender() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        
        if (appSettingsService != null) {
            try {
                // Get settings from database (falls back to application.properties)
                // Note: Database uses "email.host" not "email.smtp.host"
                String host = appSettingsService.getSettingValue("email.host", "localhost");
                String portStr = appSettingsService.getSettingValue("email.port", "1025");
                String username = appSettingsService.getSettingValue("email.username", "");
                String password = appSettingsService.getSettingValue("email.password", "");
                String authStr = appSettingsService.getSettingValue("email.smtpAuth", "false");
                String tlsStr = appSettingsService.getSettingValue("email.smtpTls", "false");
                
                mailSender.setHost(host);
                mailSender.setPort(Integer.parseInt(portStr));
                
                if (username != null && !username.trim().isEmpty()) {
                    mailSender.setUsername(username);
                }
                
                if (password != null && !password.trim().isEmpty()) {
                    mailSender.setPassword(password);
                }
                
                Properties props = mailSender.getJavaMailProperties();
                props.put("mail.transport.protocol", "smtp");
                props.put("mail.smtp.auth", Boolean.parseBoolean(authStr));
                props.put("mail.smtp.starttls.enable", Boolean.parseBoolean(tlsStr));
                props.put("mail.smtp.starttls.required", Boolean.parseBoolean(tlsStr));
                props.put("mail.debug", "false");
                props.put("mail.smtp.connectiontimeout", "5000");
                props.put("mail.smtp.timeout", "5000");
                props.put("mail.smtp.writetimeout", "5000");
                
                log.info("JavaMailSender configured from database: host={}, port={}, username={}", 
                        host, portStr, username);
                
            } catch (Exception e) {
                log.error("Failed to configure JavaMailSender from database settings, using defaults", e);
            }
        } else {
            log.warn("AppSettingsService not available, using static configuration");
        }
        
        return mailSender;
    }
}
