package com.siyamuddin.saas.Payloads.Settings;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OAuthSettingsDto {
    
    @NotNull(message = "OAuth enabled status is required")
    private Boolean enabled;
    
    // Required if enabled
    private String clientId;
    
    // Masked in responses (shows ******** if set)
    private String clientSecret;
    
    @NotBlank(message = "Redirect URI is required")
    private String redirectUri;
    
    // Comma-separated list of authorized email domains (empty = all allowed)
    private String authorizedDomains;
    
    @NotBlank(message = "OAuth scopes are required")
    private String scopes; // comma-separated: openid,profile,email
    
    // Validation: If enabled, clientId and clientSecret are required
    public void validate() {
        if (Boolean.TRUE.equals(enabled)) {
            if (clientId == null || clientId.trim().isEmpty()) {
                throw new IllegalArgumentException("Client ID is required when OAuth is enabled");
            }
            // Don't validate clientSecret if it's masked (starts with ***)
            if (clientSecret != null && !clientSecret.startsWith("***") && clientSecret.trim().isEmpty()) {
                throw new IllegalArgumentException("Client Secret is required when OAuth is enabled");
            }
        }
    }
}

