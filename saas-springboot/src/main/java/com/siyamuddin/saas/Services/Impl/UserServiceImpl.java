package com.siyamuddin.saas.Services.Impl;

import com.siyamuddin.saas.Config.Properties.RoleProperties;
import com.siyamuddin.saas.Entity.Role;
import com.siyamuddin.saas.Entity.User;
import com.siyamuddin.saas.Exceptions.ResourceNotFoundException;
import com.siyamuddin.saas.Exceptions.UserAlreadyExists;
import com.siyamuddin.saas.Payloads.PagedResponse;
import com.siyamuddin.saas.Payloads.UserPayload.UserDto;
import com.siyamuddin.saas.Payloads.UserPayload.UserMapper;
import com.siyamuddin.saas.Repository.OAuthAccountRepo;
import com.siyamuddin.saas.Repository.RefreshTokenRepo;
import com.siyamuddin.saas.Repository.RoleRepo;
import com.siyamuddin.saas.Repository.UserRepo;
import com.siyamuddin.saas.Services.SessionService;
import com.siyamuddin.saas.Services.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheConfig;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Slf4j
@CacheConfig(cacheNames = "users")
public class UserServiceImpl implements UserService {
    
    private final PasswordEncoder passwordEncoder;
    private final UserRepo userRepo;
    private final RoleRepo roleRepo;
    private final RoleProperties roleProperties;
    private final RefreshTokenRepo refreshTokenRepo;
    private final SessionService sessionService;
    private final OAuthAccountRepo oAuthAccountRepo;

    public UserServiceImpl(
            PasswordEncoder passwordEncoder,
            UserRepo userRepo,
            RoleRepo roleRepo,
            RoleProperties roleProperties,
            @Autowired(required = false) RefreshTokenRepo refreshTokenRepo,
            @Autowired(required = false) SessionService sessionService,
            @Autowired(required = false) OAuthAccountRepo oAuthAccountRepo) {
        this.passwordEncoder = passwordEncoder;
        this.userRepo = userRepo;
        this.roleRepo = roleRepo;
        this.roleProperties = roleProperties;
        this.refreshTokenRepo = refreshTokenRepo;
        this.sessionService = sessionService;
        this.oAuthAccountRepo = oAuthAccountRepo;
    }

    @Override
    @Transactional
    public UserDto registerNewUser(UserDto userDto) {
        Optional<User> userCheck=userRepo.findByEmail(userDto.getEmail());
        if(userCheck.isPresent()){
            log.info("Duplicate user tried to login.");
            throw new UserAlreadyExists(userCheck.get().getName(),userDto.getEmail());
        }
        else if(userRepo.count()==0){
            User user=UserMapper.toEntity(userDto);
            //encoded password
            user.setPassword(this.passwordEncoder.encode(user.getPassword()));
            //roles - safely get admin role (first user is admin)
            Integer adminRoleId = roleProperties.getAdminUser();
            Role role= this.roleRepo.findById(adminRoleId)
                    .orElseThrow(() -> new IllegalStateException(
                            "Admin role (ID: " + adminRoleId + ") not found. " +
                            "Please run database migrations to seed roles."));
            user.getRoles().add(role);
            User newUser=this.userRepo.save(user);
            return UserMapper.toDto(newUser);
        }
        else {
        User user=UserMapper.toEntity(userDto);
        //encoded password
        user.setPassword(this.passwordEncoder.encode(user.getPassword()));
        //roles - safely get normal user role
        Integer normalRoleId = roleProperties.getNormalUser();
        Role role= this.roleRepo.findById(normalRoleId)
                .orElseThrow(() -> new IllegalStateException(
                        "Normal user role (ID: " + normalRoleId + ") not found. " +
                        "Please run database migrations to seed roles."));
        user.getRoles().add(role);
        User newUser=this.userRepo.save(user);
        return UserMapper.toDto(newUser);}
    }

    @Override
    @Transactional
    @CacheEvict(value = "users", key = "#userId", allEntries = false)
    public UserDto updateUser(UserDto userDto, Integer userId) {
        User user = this.userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "ID", userId));

        // Update name
        if (userDto.getName() != null && !userDto.getName().trim().isEmpty()) {
            user.setName(userDto.getName());
        }

        // Update email with uniqueness validation
        if (userDto.getEmail() != null && !userDto.getEmail().equals(user.getEmail())) {
            Optional<User> existingUser = userRepo.findByEmail(userDto.getEmail());
            if (existingUser.isPresent() && !existingUser.get().getId().equals(userId)) {
                throw new UserAlreadyExists(existingUser.get().getName(), userDto.getEmail());
            }
            user.setEmail(userDto.getEmail());
        }

        // Update about
        if (userDto.getAbout() != null) {
            user.setAbout(userDto.getAbout());
        }

        // Password should NEVER be updated through this endpoint
        // Password changes must go through the dedicated change-password endpoint

        User updatedUser = this.userRepo.save(user);
        return UserMapper.toDto(updatedUser);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "users", key = "#userId", unless = "#result == null")
    public UserDto getUserById(Integer userId) {
        User user=userRepo.findById(userId).orElseThrow(()-> new ResourceNotFoundException("User","ID",userId));
        // Note: Roles are lazy-loaded, but this is in a @Transactional method so it's safe
        // If roles are needed, consider using findByIdWithRoles query
        if (log.isDebugEnabled()) {
            log.debug("Retrieved user {} with {} roles", userId, user.getRoles().size());
        }
        return UserMapper.toDto(user);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<UserDto> getAllUser(Integer pageNumber, Integer pageSize, String sortBy, String sortDirec) {
        Sort sort = null;
        if (sortDirec.equalsIgnoreCase("asc")) {
            sort = Sort.by(sortBy).ascending();
        } else {
            sort = Sort.by(sortBy).descending();
        }
        Pageable pageable = PageRequest.of(pageNumber, pageSize, sort);
        Page<User> users = this.userRepo.findAll(pageable);

        List<UserDto> userDtos = users.stream()
                .map(UserMapper::toDto)
                .toList();

        return PagedResponse.<UserDto>builder()
                .content(userDtos)
                .pageNumber(users.getNumber())
                .pageSize(users.getSize())
                .totalElements(users.getTotalElements())
                .totalPages(users.getTotalPages())
                .lastPage(users.isLast())
                .build();
    }

    @Override
    @Transactional
    @CacheEvict(value = "users", key = "#userId")
    public void deleteUser(Integer userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "ID", userId));
        
        // Clean up all related data before deleting user
        log.info("Deleting user {} - cleaning up related data...", userId);
        
        // 1. Delete refresh tokens (must actually delete, not just revoke)
        if (refreshTokenRepo != null) {
            try {
                refreshTokenRepo.deleteAllByUser(user);
                log.debug("Deleted refresh tokens for user {}", userId);
            } catch (Exception e) {
                log.warn("Failed to delete refresh tokens for user {}: {}", userId, e.getMessage());
            }
        }
        
        // 2. Delete all sessions (must delete, not just invalidate)
        if (sessionService != null) {
            try {
                sessionService.deleteAllUserSessions(userId);
                log.debug("Deleted all sessions for user {}", userId);
            } catch (Exception e) {
                log.warn("Failed to delete sessions for user {}: {}", userId, e.getMessage());
            }
        }
        
        // 3. Delete OAuth accounts
        if (oAuthAccountRepo != null) {
            try {
                oAuthAccountRepo.deleteByUser(user);
                log.debug("Deleted OAuth accounts for user {}", userId);
            } catch (Exception e) {
                log.warn("Failed to delete OAuth accounts for user {}: {}", userId, e.getMessage());
            }
        }
        
        // 4. Clear roles (breaks the many-to-many relationship)
        user.getRoles().clear();
        userRepo.save(user); // Save to persist the cleared roles
        
        // 5. Delete the user
        userRepo.deleteById(userId);
        
        log.info("User {} deleted successfully", userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserDto> searchUserByName(String name) {
        List<User> users=this.userRepo.findByNameContaining(name);
        return users.stream().map(UserMapper::toDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public User getUserEntityById(Integer userId) {
        return userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "ID", userId));
    }

    @Override
    @Transactional(readOnly = true)
    public User getUserEntityByEmail(String email) {
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    @Override
    @Transactional
    @CacheEvict(value = "users", key = "#user.id")
    public void changeUserPassword(User user, String newPassword) {
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepo.save(user);
    }

    @Override
    @Transactional
    @CacheEvict(value = "users", key = "#user.id")
    public void updateUserLastLogin(User user) {
        user.setLastLoginDate(new java.util.Date());
        user.setFailedLoginAttempts(0);
        userRepo.save(user);
    }

}
