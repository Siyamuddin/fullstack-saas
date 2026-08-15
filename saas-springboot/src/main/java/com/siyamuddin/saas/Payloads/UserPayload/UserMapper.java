package com.siyamuddin.saas.Payloads.UserPayload;

import com.siyamuddin.saas.Entity.Role;
import com.siyamuddin.saas.Entity.User;

import java.util.HashSet;
import java.util.Set;

/**
 * Explicit mapper replacing ModelMapper for User &lt;-&gt; UserDto conversions.
 */
public final class UserMapper {

    private UserMapper() {
    }

    public static UserDto toDto(User user) {
        if (user == null) {
            return null;
        }
        UserDto dto = new UserDto();
        dto.setId(user.getId() != null ? user.getId() : 0);
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setAbout(user.getAbout());
        dto.setProfileImageUrl(user.getProfileImageUrl());
        if (user.getRoles() != null) {
            dto.setRoles(new HashSet<>(user.getRoles()));
        } else {
            dto.setRoles(new HashSet<>());
        }
        return dto;
    }

    public static User toEntity(UserDto dto) {
        if (dto == null) {
            return null;
        }
        User user = new User();
        if (dto.getId() > 0) {
            user.setId(dto.getId());
        }
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPassword(dto.getPassword());
        user.setAbout(dto.getAbout());
        user.setProfileImageUrl(dto.getProfileImageUrl());
        Set<Role> roles = dto.getRoles() != null ? new HashSet<>(dto.getRoles()) : new HashSet<>();
        user.setRoles(roles);
        return user;
    }
}
