package com.siyamuddin.saas.Services.Impl;

import com.siyamuddin.saas.Entity.User;
import com.siyamuddin.saas.Exceptions.ResourceNotFoundException;
import com.siyamuddin.saas.Repository.UserRepo;
import com.siyamuddin.saas.Services.AuditService;
import com.siyamuddin.saas.Services.DynamicConfigService;
import com.siyamuddin.saas.Services.EmailService;
import com.siyamuddin.saas.Services.PasswordResetService;
import com.siyamuddin.saas.Services.PasswordValidationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PasswordResetServiceImpl implements PasswordResetService {
    
    private final UserRepo userRepo;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final DynamicConfigService dynamicConfig;
    private final PasswordValidationService passwordValidationService;
    private final AuditService auditService;
    
    @Override
    @Transactional
    public void requestPasswordReset(String email) {
        // Security: Always return success to prevent email enumeration
        // Only send email if user exists (silently fail if user doesn't exist)
        Optional<User> userOptional = userRepo.findByEmail(email);
        
        if (userOptional.isPresent()) {
            User user = userOptional.orElse(null); // Safe extraction after isPresent() check
            String token = generateResetToken();
            user.setPasswordResetToken(token);
            long expiryHours = dynamicConfig.getPasswordResetTokenExpiryHours();
            long expiryMillis = expiryHours * 60L * 60 * 1000;
            user.setPasswordResetTokenExpiry(new Date(System.currentTimeMillis() + expiryMillis));
            userRepo.save(user);
            
            emailService.sendPasswordResetEmail(user.getEmail(), user.getName(), token);
            log.info("Password reset email sent to user: {}", user.getEmail());
        } else {
            // Log but don't reveal that user doesn't exist
            log.debug("Password reset requested for non-existent email: {}", email);
        }
    }
    
    @Override
    @Transactional
    public void resetPassword(String token, String newPassword) {
        User user = userRepo.findByPasswordResetToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("User", "reset token", token));
        
        if (user.getPasswordResetTokenExpiry() != null && 
            user.getPasswordResetTokenExpiry().before(new Date())) {
            throw new IllegalArgumentException("Password reset token has expired");
        }
        
        // Validate password strength
        passwordValidationService.validatePassword(newPassword);
        
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordResetToken(null);
        user.setPasswordResetTokenExpiry(null);
        user.setFailedLoginAttempts(0);
        user.setAccountLockedUntil(null);
        userRepo.save(user);
        
        // Audit password reset
        auditService.logSecurityEvent(user, "PASSWORD_RESET", true);
        
        log.info("Password reset successful for user: {}", user.getEmail());
    }
    
    @Override
    public boolean validateResetToken(String token) {
        try {
            User user = userRepo.findByPasswordResetToken(token)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "reset token", token));
            
            if (user.getPasswordResetTokenExpiry() != null && 
                user.getPasswordResetTokenExpiry().before(new Date())) {
                return false;
            }
            return true;
        } catch (ResourceNotFoundException e) {
            return false;
        }
    }
    
    @Override
    public String generateResetToken() {
        return UUID.randomUUID().toString();
    }
}
