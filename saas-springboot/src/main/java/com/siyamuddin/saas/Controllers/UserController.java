package com.siyamuddin.saas.Controllers;

import com.siyamuddin.saas.Entity.User;
import com.siyamuddin.saas.Entity.UserSession;
import com.siyamuddin.saas.Payloads.ApiResponse;
import com.siyamuddin.saas.Payloads.UserPayload.UserDto;
import com.siyamuddin.saas.Payloads.UserPayload.ValidationGroups;
import com.siyamuddin.saas.Services.AuditService;
import com.siyamuddin.saas.Services.PasswordValidationService;
import com.siyamuddin.saas.Services.SessionService;
import com.siyamuddin.saas.Services.UserProfilePhotoService;
import com.siyamuddin.saas.Services.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@SecurityRequirement(name = "JWT-Auth")
@Tag(name = "User - Profile Management", description = "Endpoints for users to manage their own profile")
public class UserController {
    
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final SessionService sessionService;
    private final PasswordValidationService passwordValidationService;
    private final AuditService auditService;
    private final com.siyamuddin.saas.Config.MetricsConfig.BusinessMetrics businessMetrics;
    private final UserProfilePhotoService userProfilePhotoService;

    public UserController(
            UserService userService,
            PasswordEncoder passwordEncoder,
            SessionService sessionService,
            PasswordValidationService passwordValidationService,
            AuditService auditService,
            com.siyamuddin.saas.Config.MetricsConfig.BusinessMetrics businessMetrics,
            UserProfilePhotoService userProfilePhotoService) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.sessionService = sessionService;
        this.passwordValidationService = passwordValidationService;
        this.auditService = auditService;
        this.businessMetrics = businessMetrics;
        this.userProfilePhotoService = userProfilePhotoService;
    }
    
    @Operation(
        summary = "Get current user",
        description = "Get information about the currently authenticated user"
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200", 
            description = "User information retrieved",
            content = @Content(schema = @Schema(implementation = UserDto.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401", 
            description = "Unauthorized"
        )
    })
    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userService.getUserEntityByEmail(email);
        UserDto userDto = userService.getUserById(user.getId());
        return new ResponseEntity<>(userDto, HttpStatus.OK);
    }
    
    @Operation(
        summary = "Update current user profile",
        description = "Update the currently authenticated user's profile information"
    )
    @PutMapping("/me")
    public ResponseEntity<UserDto> updateCurrentUser(
            @Valid @org.springframework.validation.annotation.Validated(ValidationGroups.Update.class) @RequestBody UserDto userDto) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userService.getUserEntityByEmail(email);
        UserDto updatedUserDto = this.userService.updateUser(userDto, user.getId());
        // Audit profile update
        auditService.logUserAction(user, "PROFILE_UPDATED", "USER", user.getId());
        return ResponseEntity.ok(updatedUserDto);
    }
    
    @Operation(
        summary = "Delete my account",
        description = "Delete the currently authenticated user's account. This action is irreversible."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200", 
            description = "Account deleted successfully"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401", 
            description = "Unauthorized"
        )
    })
    @DeleteMapping("/me")
    public ResponseEntity<ApiResponse> deleteMyAccount() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userService.getUserEntityByEmail(email);
        
        // Audit before deletion
        auditService.logSecurityEvent(user, "ACCOUNT_SELF_DELETED", true);
        
        // Delete user (this will cascade delete related data)
        userService.deleteUser(user.getId());
        
        return new ResponseEntity<>(
            new ApiResponse("Account deleted successfully. You will be logged out.", true),
            HttpStatus.OK
        );
    }
    
    @Operation(
        summary = "Change password",
        description = "Change the current user's password. Rate limited for security."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200", 
            description = "Password changed successfully"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400", 
            description = "Invalid current password or weak new password"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "429", 
            description = "Too many password change attempts"
        )
    })
    @PostMapping("/me/change-password")
    public ResponseEntity<ApiResponse> changePassword(
            @Parameter(description = "Current password", required = true)
            @RequestParam @jakarta.validation.constraints.NotBlank(message = "Current password is required") String currentPassword,
            @Parameter(description = "New password (must meet strength requirements)", required = true)
            @RequestParam @jakarta.validation.constraints.NotBlank(message = "New password is required") String newPassword) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userService.getUserEntityByEmail(email);
        
        // Verify current password
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            return new ResponseEntity<>(
                new ApiResponse("Current password is incorrect", false),
                HttpStatus.BAD_REQUEST
            );
        }
        
        // Validate new password strength
        try {
            passwordValidationService.validatePassword(newPassword);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(
                new ApiResponse(e.getMessage(), false),
                HttpStatus.BAD_REQUEST
            );
        }
        
        // Update password through service
        userService.changeUserPassword(user, newPassword);
        
        // Audit password change
        auditService.logSecurityEvent(user, "PASSWORD_CHANGED", true);
        businessMetrics.incrementPasswordChange();
        
        return new ResponseEntity<>(
            new ApiResponse("Password changed successfully", true),
            HttpStatus.OK
        );
    }
    
    @Operation(
        summary = "Get active sessions",
        description = "Get all active sessions for the current user"
    )
    @GetMapping("/me/sessions")
    public ResponseEntity<List<UserSession>> getActiveSessions() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userService.getUserEntityByEmail(email);
        List<UserSession> sessions = sessionService.getActiveSessions(user.getId());
        return new ResponseEntity<>(sessions, HttpStatus.OK);
    }
    
    @Operation(
        summary = "Revoke session",
        description = "Revoke a specific user session by session ID"
    )
    @DeleteMapping("/me/sessions/{sessionId}")
    public ResponseEntity<ApiResponse> revokeSession(
            @Parameter(description = "Session ID", required = true)
            @PathVariable String sessionId) {
        sessionService.invalidateSession(sessionId);
        return new ResponseEntity<>(
            new ApiResponse("Session revoked successfully", true),
            HttpStatus.OK
        );
    }

    @Operation(
        summary = "Upload current user's profile photo",
        description = "Upload or replace the authenticated user's profile photo."
    )
    @PostMapping(
        value = "/me/profile-photo",
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<UserDto> uploadMyProfilePhoto(
            @Parameter(description = "Profile photo file (jpg, png, webp, gif, avif, pdf)", required = true)
            @RequestPart("file") MultipartFile file) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userService.getUserEntityByEmail(email);
        UserDto updated = userProfilePhotoService.uploadProfilePhoto(user.getId(), file);
        auditService.logUserAction(user, "PROFILE_PHOTO_UPDATED", "USER", user.getId());
        return ResponseEntity.ok(updated);
    }
}
