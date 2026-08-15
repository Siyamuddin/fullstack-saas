package com.siyamuddin.saas.Services;

public interface TokenBlacklistService {
    void blacklistToken(String token, Integer userId);
    boolean isTokenBlacklisted(String token);
    void cleanupExpiredTokens();
}

