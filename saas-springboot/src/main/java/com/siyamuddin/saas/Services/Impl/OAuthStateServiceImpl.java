package com.siyamuddin.saas.Services.Impl;

import com.siyamuddin.saas.Services.OAuthStateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;
import java.util.Base64;

@Slf4j
@Service
@RequiredArgsConstructor
public class OAuthStateServiceImpl implements OAuthStateService {
    
    private static final String OAUTH_STATE_PREFIX = "oauth:state:";
    private static final Duration STATE_TTL = Duration.ofMinutes(5); // State valid for 5 minutes
    private static final int STATE_LENGTH = 32; // 32 bytes = 256 bits
    
    private final RedisTemplate<String, String> redisTemplate;
    
    private final SecureRandom secureRandom = new SecureRandom();
    
    @Override
    public String generateState() {
        // Generate cryptographically secure random state
        byte[] randomBytes = new byte[STATE_LENGTH];
        secureRandom.nextBytes(randomBytes);
        String state = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
        
        // Store in Redis with TTL
        String key = OAUTH_STATE_PREFIX + state;
        redisTemplate.opsForValue().set(key, "valid", STATE_TTL);
        
        log.debug("Generated OAuth state token: {}", state.substring(0, 8) + "...");
        return state;
    }
    
    @Override
    public boolean validateAndConsumeState(String state) {
        if (state == null || state.trim().isEmpty()) {
            log.warn("OAuth state validation failed: state is null or empty");
            return false;
        }
        
        String key = OAUTH_STATE_PREFIX + state;
        
        // Check if state exists in Redis
        String value = redisTemplate.opsForValue().get(key);
        
        if (value == null) {
            log.warn("OAuth state validation failed: state not found or expired");
            return false;
        }
        
        // Delete the state to prevent reuse (one-time use)
        redisTemplate.delete(key);
        
        log.info("OAuth state validated and consumed successfully");
        return true;
    }
    
    @Override
    public void invalidateState(String state) {
        if (state != null && !state.trim().isEmpty()) {
            String key = OAUTH_STATE_PREFIX + state;
            redisTemplate.delete(key);
            log.debug("OAuth state token invalidated: {}", state.substring(0, 8) + "...");
        }
    }
}
