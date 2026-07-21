package com.siyamuddin.saas.Payloads.Settings;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RateLimitSettingsDto {
    
    // Login rate limits
    @NotNull(message = "Login requests limit is required")
    @Min(value = 1, message = "Login requests must be at least 1")
    @Max(value = 10000, message = "Login requests must not exceed 10000")
    private Integer loginRequests;
    
    @NotNull(message = "Login duration is required")
    @Min(value = 1, message = "Login duration must be at least 1 hour")
    @Max(value = 24, message = "Login duration must not exceed 24 hours")
    private Integer loginDuration; // in hours
    
    // Registration rate limits
    @NotNull(message = "Registration requests limit is required")
    @Min(value = 1, message = "Registration requests must be at least 1")
    @Max(value = 10000, message = "Registration requests must not exceed 10000")
    private Integer registrationRequests;
    
    @NotNull(message = "Registration duration is required")
    @Min(value = 1, message = "Registration duration must be at least 1 hour")
    @Max(value = 24, message = "Registration duration must not exceed 24 hours")
    private Integer registrationDuration; // in hours
    
    // Password change rate limits
    @NotNull(message = "Password change requests limit is required")
    @Min(value = 1, message = "Password change requests must be at least 1")
    @Max(value = 10000, message = "Password change requests must not exceed 10000")
    private Integer passwordChangeRequests;
    
    @NotNull(message = "Password change duration is required")
    @Min(value = 1, message = "Password change duration must be at least 1 hour")
    @Max(value = 24, message = "Password change duration must not exceed 24 hours")
    private Integer passwordChangeDuration; // in hours
    
    // General API rate limits
    @NotNull(message = "General requests limit is required")
    @Min(value = 100, message = "General requests must be at least 100")
    @Max(value = 100000, message = "General requests must not exceed 100000")
    private Integer generalRequests;
    
    @NotNull(message = "General duration is required")
    @Min(value = 1, message = "General duration must be at least 1 hour")
    @Max(value = 24, message = "General duration must not exceed 24 hours")
    private Integer generalDuration; // in hours
}

