package com.siyamuddin.saas.Payloads.Settings;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmailSettingsDto {
    
    @NotBlank(message = "Email host is required")
    private String host;
    
    @NotNull(message = "Email port is required")
    @Min(value = 1, message = "Port must be between 1 and 65535")
    @Max(value = 65535, message = "Port must be between 1 and 65535")
    private Integer port;
    
    private String username;
    
    // Password will be masked in responses, only updated when explicitly changed
    private String password;
    
    @NotBlank(message = "From email is required")
    @Email(message = "Invalid from email address")
    private String from;
    
    @NotBlank(message = "From name is required")
    private String fromName;
    
    @NotNull(message = "Enabled status is required")
    private Boolean enabled;
    
    @NotBlank(message = "Verification base URL is required")
    private String verificationBaseUrl;
    
    @NotBlank(message = "Password reset base URL is required")
    private String passwordResetBaseUrl;
    
    @NotNull(message = "SMTP auth setting is required")
    private Boolean smtpAuth;
    
    @NotNull(message = "SMTP TLS setting is required")
    private Boolean smtpTls;
}

