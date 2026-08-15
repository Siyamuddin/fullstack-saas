package com.siyamuddin.saas.Controllers;

import com.siyamuddin.saas.Config.MetricsConfig;
import com.siyamuddin.saas.Entity.User;
import com.siyamuddin.saas.Payloads.UserPayload.UserDto;
import com.siyamuddin.saas.Services.AuditService;
import com.siyamuddin.saas.Services.PasswordValidationService;
import com.siyamuddin.saas.Services.SessionService;
import com.siyamuddin.saas.Services.UserProfilePhotoService;
import com.siyamuddin.saas.Services.UserService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    @Mock
    private UserService userService;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private SessionService sessionService;
    @Mock
    private PasswordValidationService passwordValidationService;
    @Mock
    private AuditService auditService;
    @Mock
    private MetricsConfig.BusinessMetrics businessMetrics;
    @Mock
    private UserProfilePhotoService userProfilePhotoService;

    @InjectMocks
    private UserController userController;

    @AfterEach
    void cleanSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void uploadMyProfilePhoto_usesAuthenticatedUser() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "avatar.jpg",
                "image/jpeg",
                "bytes".getBytes()
        );
        UserDto dto = new UserDto();
        dto.setId(42);
        User user = new User();
        user.setId(42);
        user.setEmail("current@user.test");

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user.getEmail(), "password")
        );

        when(userService.getUserEntityByEmail(user.getEmail())).thenReturn(user);
        when(userProfilePhotoService.uploadProfilePhoto(eq(42), eq(file))).thenReturn(dto);

        ResponseEntity<UserDto> response = userController.uploadMyProfilePhoto(file);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isSameAs(dto);
        verify(userProfilePhotoService).uploadProfilePhoto(42, file);
        verify(auditService).logUserAction(user, "PROFILE_PHOTO_UPDATED", "USER", 42);
    }
}

