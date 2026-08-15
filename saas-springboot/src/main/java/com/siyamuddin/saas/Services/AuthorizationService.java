package com.siyamuddin.saas.Services;

import com.siyamuddin.saas.Entity.User;
import com.siyamuddin.saas.Repository.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service("authz")
@RequiredArgsConstructor
public class AuthorizationService {

    private final UserRepo userRepo;

    // Check if user can modify/delete another user profile
    public boolean canModifyUser(Authentication authentication, Integer userId) {
        if (authentication == null) return false;

        String currentEmail = authentication.getName();
        // Use findByEmailWithRoles to eagerly fetch roles and avoid LazyInitializationException
        User currentUser = userRepo.findByEmailWithRoles(currentEmail).orElse(null);
        if (currentUser == null) return false;

        // Check if user is admin
        boolean isAdmin = currentUser.getRoles().stream()
                .anyMatch(role -> role.getName().equals("ROLE_ADMIN"));

        // Check if user is modifying their own profile
        boolean isSelf = currentUser.getId() == userId;

        return isAdmin || isSelf;
    }
}
