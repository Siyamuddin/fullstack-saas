package com.siyamuddin.saas.Services.Impl;

import com.siyamuddin.saas.Entity.User;
import com.siyamuddin.saas.Exceptions.ResourceNotFoundException;
import com.siyamuddin.saas.Repository.UserRepo;
import com.siyamuddin.saas.Services.AuditService;
import com.siyamuddin.saas.Services.DynamicConfigService;
import com.siyamuddin.saas.Services.EmailService;
import com.siyamuddin.saas.Services.EmailVerificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailVerificationServiceImpl implements EmailVerificationService {
    
    private final UserRepo userRepo;
    private final EmailService emailService;
    private final DynamicConfigService dynamicConfig;
    private final AuditService auditService;
    
    @Override
    @Transactional
    public void sendVerificationEmail(User user) {
        String token = generateVerificationToken();
        user.setEmailVerificationToken(token);
        long expiryHours = dynamicConfig.getEmailVerificationTokenExpiryHours();
        long expiryMillis = expiryHours * 60L * 60 * 1000;
        user.setEmailVerificationTokenExpiry(new Date(System.currentTimeMillis() + expiryMillis));
        userRepo.save(user);
        
        emailService.sendVerificationEmail(user.getEmail(), user.getName(), token);
        log.info("Verification email sent to user: {}", user.getEmail());
    }
    
    @Override
    @Transactional
    public boolean verifyEmail(String token) {
        User user = userRepo.findByEmailVerificationToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("User", "verification token", token));
        
        if (user.getEmailVerificationTokenExpiry() != null && 
            user.getEmailVerificationTokenExpiry().before(new Date())) {
            log.warn("Verification token expired for user: {}", user.getEmail());
            return false;
        }
        
        user.setEmailVerified(true);
        user.setEmailVerificationToken(null);
        user.setEmailVerificationTokenExpiry(null);
        userRepo.save(user);
        
        // Audit email verification
        auditService.logSecurityEvent(user, "EMAIL_VERIFIED", true);
        
        log.info("Email verified for user: {}", user.getEmail());
        return true;
    }
    
    @Override
    @Transactional
    public void resendVerificationEmail(String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        
        if (user.getEmailVerified()) {
            throw new IllegalArgumentException("Email is already verified");
        }
        
        sendVerificationEmail(user);
    }
    
    @Override
    public String generateVerificationToken() {
        return UUID.randomUUID().toString();
    }
}
