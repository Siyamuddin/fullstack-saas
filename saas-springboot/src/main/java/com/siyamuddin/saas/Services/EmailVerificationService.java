package com.siyamuddin.saas.Services;

import com.siyamuddin.saas.Entity.User;

public interface EmailVerificationService {
    void sendVerificationEmail(User user);
    boolean verifyEmail(String token);
    void resendVerificationEmail(String email);
    String generateVerificationToken();
}

