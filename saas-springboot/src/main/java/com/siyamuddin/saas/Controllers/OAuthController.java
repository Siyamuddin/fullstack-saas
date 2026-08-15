package com.siyamuddin.saas.Controllers;

import com.siyamuddin.saas.Entity.JwtResponse;
import com.siyamuddin.saas.Entity.RefreshToken;
import com.siyamuddin.saas.Entity.User;
import com.siyamuddin.saas.Repository.RefreshTokenRepo;
import com.siyamuddin.saas.Security.JwtHelper;
import com.siyamuddin.saas.Services.OAuthService;
import com.siyamuddin.saas.Services.OAuthStateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/auth/oauth")
@Tag(name = "OAuth Authentication", description = "OAuth login endpoints")
@RequiredArgsConstructor
public class OAuthController {

    private final OAuthService oauthService;
    private final OAuthStateService oauthStateService;
    private final JwtHelper jwtHelper;
    private final UserDetailsService userDetailsService;
    private final RefreshTokenRepo refreshTokenRepo;

    @Operation(
        summary = "Check if OAuth is enabled",
        description = "Public endpoint to check if Google OAuth login is enabled"
    )
    @GetMapping("/enabled")
    public ResponseEntity<Map<String, Boolean>> isOAuthEnabled() {
        Map<String, Boolean> response = new HashMap<>();
        response.put("enabled", oauthService.isOAuthEnabled());
        return ResponseEntity.ok(response);
    }

    @Operation(
        summary = "Get Google OAuth authorization URL",
        description = "Get the URL to redirect user to Google for authentication. Includes CSRF protection via state parameter."
    )
    @GetMapping("/google/authorize")
    public ResponseEntity<Map<String, String>> getGoogleAuthUrl() {
        if (!oauthService.isOAuthEnabled()) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", "OAuth is not enabled"));
        }

        // Generate cryptographically secure state token for CSRF protection
        String state = oauthStateService.generateState();
        String authUrl = oauthService.getGoogleAuthorizationUrl(state);
        
        Map<String, String> response = new HashMap<>();
        response.put("authorizationUrl", authUrl);
        response.put("state", state);
        
        log.debug("Generated OAuth authorization URL with state token");
        return ResponseEntity.ok(response);
    }

    @Operation(
        summary = "Handle Google OAuth callback",
        description = "Endpoint called by Google after user authentication. Validates state token (CSRF protection) and returns JWT tokens."
    )
    @GetMapping("/google/callback")
    public ResponseEntity<?> handleGoogleCallback(
            @RequestParam("code") String code,
            @RequestParam("state") String state) {
        
        if (!oauthService.isOAuthEnabled()) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "OAuth is not enabled");
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(error);
        }

        // Validate state parameter to prevent CSRF attacks
        if (!oauthStateService.validateAndConsumeState(state)) {
            log.warn("OAuth callback failed: Invalid or expired state token");
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Invalid or expired authentication request. Please try again.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }

        try {
            // Handle OAuth callback and get/create user
            User user = oauthService.handleGoogleCallback(code, state);
            
            // Generate JWT tokens
            UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
            String accessToken = jwtHelper.generateToken(userDetails);
            String refreshTokenString = jwtHelper.generateRefreshTokenString();
            
            // Save refresh token to database
            RefreshToken refreshToken = new RefreshToken();
            refreshToken.setToken(refreshTokenString);
            refreshToken.setUser(user);
            refreshToken.setExpiresAt(LocalDateTime.now().plusDays(7));
            refreshTokenRepo.save(refreshToken);
            
            // Build response matching the login endpoint format
            JwtResponse response = JwtResponse.builder()
                    .jwtToken(accessToken)
                    .refreshToken(refreshTokenString)
                    .username(user.getEmail())
                    .build();
            
            log.info("OAuth login successful for user: {} - JWT tokens generated", user.getEmail());
            return ResponseEntity.ok(response);
            
        } catch (IllegalStateException e) {
            log.warn("OAuth not enabled: {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(error);
        } catch (RuntimeException e) {
            log.error("OAuth callback failed: {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Authentication failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        } catch (Exception e) {
            log.error("Unexpected error in OAuth callback: {}", e.getMessage(), e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "An unexpected error occurred");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
