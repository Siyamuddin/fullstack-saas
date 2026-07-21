package com.siyamuddin.saas.Services;

/**
 * Service for managing OAuth state tokens to prevent CSRF attacks
 */
public interface OAuthStateService {
    
    /**
     * Generate and store a new OAuth state token
     * @return The generated state token
     */
    String generateState();
    
    /**
     * Validate and consume an OAuth state token
     * @param state The state token to validate
     * @return true if valid, false otherwise
     */
    boolean validateAndConsumeState(String state);
    
    /**
     * Manually invalidate a state token
     * @param state The state token to invalidate
     */
    void invalidateState(String state);
}

