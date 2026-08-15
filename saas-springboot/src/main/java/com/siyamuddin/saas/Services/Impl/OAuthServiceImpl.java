package com.siyamuddin.saas.Services.Impl;

import com.siyamuddin.saas.Entity.OAuthAccount;
import com.siyamuddin.saas.Entity.User;
import com.siyamuddin.saas.Repository.OAuthAccountRepo;
import com.siyamuddin.saas.Repository.UserRepo;
import com.siyamuddin.saas.Services.OAuthService;
import com.siyamuddin.saas.Services.AppSettingsService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.Optional;

@Slf4j
@Service
public class OAuthServiceImpl implements OAuthService {
    
    private final UserRepo userRepo;
    private final OAuthAccountRepo oauthAccountRepo;
    private final AppSettingsService appSettingsService;
    private final RestTemplate restTemplate;

    public OAuthServiceImpl(
            UserRepo userRepo,
            OAuthAccountRepo oauthAccountRepo,
            @Autowired(required = false) AppSettingsService appSettingsService,
            RestTemplate restTemplate) {
        this.userRepo = userRepo;
        this.oauthAccountRepo = oauthAccountRepo;
        this.appSettingsService = appSettingsService;
        this.restTemplate = restTemplate;
    }
    
    @Override
    @Transactional
    public User linkOAuthAccount(User user, String provider, String providerId) {
        // Check if already linked
        Optional<OAuthAccount> existing = oauthAccountRepo.findByProviderAndProviderId(provider, providerId);
        
        if (existing.isPresent()) {
            OAuthAccount account = existing.get();
            // Update last used timestamp
            account.setLastUsedAt(LocalDateTime.now());
            oauthAccountRepo.save(account);
            log.info("OAuth account already linked, updated last used: user={}, provider={}", 
                    user.getEmail(), provider);
            return user;
        }
        
        // Create new OAuth account link
        OAuthAccount oauthAccount = new OAuthAccount();
        oauthAccount.setUser(user);
        oauthAccount.setProvider(provider);
        oauthAccount.setProviderId(providerId);
        oauthAccount.setLinkedAt(LocalDateTime.now());
        oauthAccount.setLastUsedAt(LocalDateTime.now());
        
        oauthAccountRepo.save(oauthAccount);
        
        log.info("OAuth account linked: user={}, provider={}, providerId={}", 
                user.getEmail(), provider, providerId);
        return user;
    }
    
    @Override
    @Transactional
    public void unlinkOAuthAccount(User user, String provider) {
        oauthAccountRepo.deleteByUserAndProvider(user, provider);
        log.info("OAuth account unlinked: user={}, provider={}", user.getEmail(), provider);
    }
    
    @Override
    @Transactional
    public User findOrCreateUserFromOAuth(String provider, String providerId, String email, String name) {
        // First, check if this OAuth account is already linked
        Optional<OAuthAccount> existingOAuth = oauthAccountRepo.findByProviderAndProviderId(provider, providerId);
        
        if (existingOAuth.isPresent()) {
            User user = existingOAuth.get().getUser();
            // Update last used timestamp
            OAuthAccount account = existingOAuth.get();
            account.setLastUsedAt(LocalDateTime.now());
            oauthAccountRepo.save(account);
            log.info("Existing OAuth account used: email={}, provider={}", email, provider);
            return user;
        }
        
        // Check if user exists by email
        Optional<User> existingUser = userRepo.findByEmail(email);
        
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            linkOAuthAccount(user, provider, providerId);
            return user;
        }
        
        // Create new user
        User newUser = new User();
        newUser.setEmail(email);
        newUser.setName(name);
        newUser.setEmailVerified(true); // OAuth providers verify emails
        newUser.setPassword(""); // OAuth users don't have passwords
        
        User saved = userRepo.save(newUser);
        linkOAuthAccount(saved, provider, providerId);
        
        log.info("New user created from OAuth: email={}, provider={}", email, provider);
        return saved;
    }
    
    @Override
    public boolean isOAuthEnabled() {
        if (appSettingsService == null) {
            return false;
        }
        try {
            String enabled = appSettingsService.getSettingValue("oauth.google.enabled", "false");
            return Boolean.parseBoolean(enabled);
        } catch (Exception e) {
            log.error("Failed to check OAuth enabled status: {}", e.getMessage());
            return false;
        }
    }
    
    @Override
    public String getGoogleAuthorizationUrl(String state) {
        if (!isOAuthEnabled()) {
            throw new IllegalStateException("OAuth is not enabled");
        }
        
        String clientId = appSettingsService.getSettingValue("oauth.google.clientId", "");
        String redirectUri = appSettingsService.getSettingValue("oauth.google.redirectUri", "");
        String scopes = appSettingsService.getSettingValue("oauth.google.scopes", "openid profile email");
        
        String scopesEncoded = scopes.replace(",", "%20");
        
        return String.format(
            "https://accounts.google.com/o/oauth2/v2/auth?client_id=%s&redirect_uri=%s&response_type=code&scope=%s&state=%s&access_type=offline&prompt=consent",
            clientId, redirectUri, scopesEncoded, state
        );
    }
    
    @Override
    @Transactional
    public User handleGoogleCallback(String code, String state) {
        if (!isOAuthEnabled()) {
            throw new IllegalStateException("OAuth is not enabled");
        }
        
        try {
            // Step 1: Exchange code for access token
            String accessToken = exchangeCodeForToken(code);
            
            // Step 2: Fetch user info from Google
            JsonNode userInfo = fetchGoogleUserInfo(accessToken);
            
            // Log the response for debugging
            log.info("Google user info response: {}", userInfo.toString());
            
            // Step 3: Extract user data with proper null checks
            if (userInfo.get("email") == null) {
                log.error("Email field missing from Google userinfo response");
                throw new RuntimeException("Email not provided by Google");
            }
            String email = userInfo.get("email").asText();
            
            // Google's v2/userinfo returns "id" instead of "sub"
            String googleId = null;
            if (userInfo.get("id") != null) {
                googleId = userInfo.get("id").asText();
            } else if (userInfo.get("sub") != null) {
                googleId = userInfo.get("sub").asText();
            } else {
                log.error("Neither 'id' nor 'sub' field found in Google userinfo response");
                throw new RuntimeException("Google ID not provided");
            }
            
            String name = userInfo.has("name") && userInfo.get("name") != null 
                ? userInfo.get("name").asText() 
                : email;
            
            String picture = userInfo.has("picture") && userInfo.get("picture") != null 
                ? userInfo.get("picture").asText() 
                : null;
            
            // Step 4: Create or find user
            User user = findOrCreateUserFromOAuth("google", googleId, email, name);
            
            // Step 5: Update profile photo if provided, validated, and user doesn't have one
            if (picture != null && isValidProfileImageUrl(picture) && 
                (user.getProfileImageUrl() == null || user.getProfileImageUrl().isEmpty())) {
                user.setProfileImageUrl(picture);
                userRepo.save(user);
                log.info("Updated user profile photo from Google: {}", email);
            } else if (picture != null && !isValidProfileImageUrl(picture)) {
                log.warn("Invalid profile image URL from Google, skipping: {}", picture);
            }
            
            log.info("Google OAuth login successful for user: {}", email);
            return user;
            
        } catch (Exception e) {
            log.error("Failed to handle Google OAuth callback: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to authenticate with Google: " + e.getMessage());
        }
    }
    
    private String exchangeCodeForToken(String code) {
        String clientId = appSettingsService.getSettingValue("oauth.google.clientId", "");
        String clientSecret = appSettingsService.getSettingValue("oauth.google.clientSecret", "");
        String redirectUri = appSettingsService.getSettingValue("oauth.google.redirectUri", "");
        
        String tokenUrl = "https://oauth2.googleapis.com/token";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        
        String body = String.format(
            "code=%s&client_id=%s&client_secret=%s&redirect_uri=%s&grant_type=authorization_code",
            code, clientId, clientSecret, redirectUri
        );
        
        HttpEntity<String> request = new HttpEntity<>(body, headers);
        
        try {
            ResponseEntity<String> response = restTemplate.postForEntity(tokenUrl, request, String.class);
            ObjectMapper mapper = new ObjectMapper();
            JsonNode jsonNode = mapper.readTree(response.getBody());
            return jsonNode.get("access_token").asText();
        } catch (Exception e) {
            log.error("Failed to exchange code for token: {}", e.getMessage());
            throw new RuntimeException("Token exchange failed", e);
        }
    }
    
    private JsonNode fetchGoogleUserInfo(String accessToken) {
        String userInfoUrl = "https://www.googleapis.com/oauth2/v2/userinfo";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        
        HttpEntity<String> request = new HttpEntity<>(headers);
        
        try {
            ResponseEntity<String> response = restTemplate.exchange(
                userInfoUrl, HttpMethod.GET, request, String.class
            );
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readTree(response.getBody());
        } catch (Exception e) {
            log.error("Failed to fetch Google user info: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch user info", e);
        }
    }
    
    /**
     * Validate profile image URL to prevent malicious URLs
     * Only allow HTTPS URLs from trusted Google domains
     */
    private boolean isValidProfileImageUrl(String url) {
        if (url == null || url.trim().isEmpty()) {
            return false;
        }
        
        // Must be HTTPS
        if (!url.startsWith("https://")) {
            log.warn("Profile image URL is not HTTPS: {}", url);
            return false;
        }
        
        // Must be from trusted Google domains
        String[] trustedDomains = {
            "lh3.googleusercontent.com",
            "lh4.googleusercontent.com",
            "lh5.googleusercontent.com",
            "lh6.googleusercontent.com",
            "googleusercontent.com"
        };
        
        boolean isTrusted = false;
        for (String domain : trustedDomains) {
            if (url.contains(domain)) {
                isTrusted = true;
                break;
            }
        }
        
        if (!isTrusted) {
            log.warn("Profile image URL is not from trusted Google domain: {}", url);
            return false;
        }
        
        // Basic URL length check to prevent extremely long URLs
        if (url.length() > 500) {
            log.warn("Profile image URL is too long: {} characters", url.length());
            return false;
        }
        
        return true;
    }
}
