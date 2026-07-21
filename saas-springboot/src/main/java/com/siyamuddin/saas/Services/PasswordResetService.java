package com.siyamuddin.saas.Services;

public interface PasswordResetService {
    void requestPasswordReset(String email);
    void resetPassword(String token, String newPassword);
    boolean validateResetToken(String token);
    String generateResetToken();
}

