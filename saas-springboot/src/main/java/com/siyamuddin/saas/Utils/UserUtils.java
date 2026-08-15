package com.siyamuddin.saas.Utils;

import com.siyamuddin.saas.Entity.User;
import com.siyamuddin.saas.Exceptions.ResourceNotFoundException;
import com.siyamuddin.saas.Repository.UserRepo;

import java.util.Optional;

/**
 * Utility class for user-related operations
 */
public class UserUtils {
    
    /**
     * Finds a user by email or throws ResourceNotFoundException
     * 
     * @param userRepo User repository
     * @param email User email
     * @return User entity
     * @throws ResourceNotFoundException if user not found
     */
    public static User findUserByEmailOrThrow(UserRepo userRepo, String email) {
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }
    
    /**
     * Finds a user by email, returns Optional
     * 
     * @param userRepo User repository
     * @param email User email
     * @return Optional User entity
     */
    public static Optional<User> findUserByEmail(UserRepo userRepo, String email) {
        return userRepo.findByEmail(email);
    }
}

