package com.siyamuddin.saas.Services;

import com.siyamuddin.saas.Entity.User;

public interface OAuthService {
    User linkOAuthAccount(User user, String provider, String providerId);
    void unlinkOAuthAccount(User user, String provider);
    User findOrCreateUserFromOAuth(String provider, String providerId, String email, String name);
    boolean isOAuthEnabled();
    String getGoogleAuthorizationUrl(String state);
    User handleGoogleCallback(String code, String state);
}

