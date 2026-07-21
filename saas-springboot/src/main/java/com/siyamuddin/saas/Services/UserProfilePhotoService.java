package com.siyamuddin.saas.Services;

import com.siyamuddin.saas.Payloads.UserPayload.UserDto;
import org.springframework.web.multipart.MultipartFile;

public interface UserProfilePhotoService {

    /**
     * Upload a profile photo for the specified user and return the updated DTO.
     */
    UserDto uploadProfilePhoto(Integer userId, MultipartFile file);
}

