// src/main/java/com.siyamuddin.saas/Security/SecurityEventLogger.java
package com.siyamuddin.saas.Payloads;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Component
public class SecurityEventLogger {

    private static final Logger securityLogger = LoggerFactory.getLogger("SECURITY_EVENTS");
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public void logLoginAttempt(String username, String ipAddress, boolean success) {
        String event = String.format("[LOGIN_ATTEMPT] %s | User: %s | IP: %s | Success: %s",
                LocalDateTime.now().format(formatter),
                username,
                ipAddress,
                success);
        if (success) {
            securityLogger.info(event);
        } else {
            securityLogger.warn(event);
        }
    }

    public void logResourceAccess(String username, String resource, String action, boolean authorized) {
        String event = String.format("[RESOURCE_ACCESS] %s | User: %s | Resource: %s | Action: %s | Authorized: %s",
                LocalDateTime.now().format(formatter),
                username,
                resource,
                action,
                authorized);
        if (authorized) {
            securityLogger.info(event);
        } else {
            securityLogger.warn(event);
        }
    }

    public void logSecurityViolation(String username, String ipAddress, String violation, String details) {
        String event = String.format("[SECURITY_VIOLATION] %s | User: %s | IP: %s | Violation: %s | Details: %s",
                LocalDateTime.now().format(formatter),
                username,
                ipAddress,
                violation,
                details);
        securityLogger.error(event);
    }

    public void logTokenValidation(String username, String tokenType, boolean valid, String reason) {
        String event = String.format("[TOKEN_VALIDATION] %s | User: %s | Token: %s | Valid: %s | Reason: %s",
                LocalDateTime.now().format(formatter),
                username,
                tokenType,
                valid,
                reason);
        if (valid) {
            securityLogger.info(event);
        } else {
            securityLogger.warn(event);
        }
    }
}