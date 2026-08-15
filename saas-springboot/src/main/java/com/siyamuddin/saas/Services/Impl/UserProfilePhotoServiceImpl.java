package com.siyamuddin.saas.Services.Impl;

import com.siyamuddin.saas.Config.Properties.FileStorageProperties;
import com.siyamuddin.saas.Entity.User;
import com.siyamuddin.saas.Exceptions.FileStorageException;
import com.siyamuddin.saas.Exceptions.InvalidFileException;
import com.siyamuddin.saas.Exceptions.ResourceNotFoundException;
import com.siyamuddin.saas.Payloads.UserPayload.UserDto;
import com.siyamuddin.saas.Payloads.UserPayload.UserMapper;
import com.siyamuddin.saas.Repository.UserRepo;
import com.siyamuddin.saas.Services.Storage.FileStorageService;
import com.siyamuddin.saas.Services.Storage.FileUploadRequest;
import com.siyamuddin.saas.Services.Storage.StoredFile;
import com.siyamuddin.saas.Services.UserProfilePhotoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserProfilePhotoServiceImpl implements UserProfilePhotoService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/jpg",  // Some browsers/systems use jpg instead of jpeg
            "image/png",
            "image/webp",
            "image/gif",
            "image/avif",
            "application/pdf"
    );

    private final UserRepo userRepo;
    private final FileStorageService fileStorageService;
    private final FileStorageProperties fileStorageProperties;

    @Override
    @Transactional
    @CacheEvict(value = "users", key = "#userId")
    public UserDto uploadProfilePhoto(Integer userId, MultipartFile file) {
        validateFile(file);
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "ID", userId));

        String previousStorageKey = user.getProfileImageStorageKey();

        FileUploadRequest request = FileUploadRequest.builder()
                .file(file)
                .subDirectory("public/profiles/user-" + userId)
                .preferredFileName(buildPreferredFileName(userId, file))
                .build();

        StoredFile storedFile = fileStorageService.store(request);

        try {
            user.setProfileImageUrl(storedFile.getPublicUrl());
            user.setProfileImageStorageKey(storedFile.getKey());
            userRepo.save(user);
        } catch (RuntimeException ex) {
            // Rollback stored file on persistence failure
            try {
                fileStorageService.delete(storedFile.getKey());
            } catch (RuntimeException deleteEx) {
                log.error("Failed to cleanup uploaded file {} after persistence error", storedFile.getKey(), deleteEx);
            }
            throw ex;
        }

        maybeDeletePrevious(previousStorageKey, storedFile.getKey());
        return UserMapper.toDto(user);
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidFileException("File is required");
        }
        if (file.getSize() <= 0) {
            throw new InvalidFileException("File is empty");
        }
        String contentType = file.getContentType();
        if (!StringUtils.hasText(contentType) || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new InvalidFileException("Unsupported file type. Allowed: JPEG, PNG, WEBP, GIF, AVIF, PDF");
        }
    }

    private String buildPreferredFileName(Integer userId, MultipartFile file) {
        String extension = "";
        String originalName = file.getOriginalFilename();
        if (StringUtils.hasText(originalName) && originalName.contains(".")) {
            extension = originalName.substring(originalName.lastIndexOf('.'));
        }
        return "profile-" + userId + "-" + UUID.randomUUID() + extension;
    }

    private void maybeDeletePrevious(String previousStorageKey, String newKey) {
        if (!fileStorageProperties.getCleanup().isEnabled()) {
            return;
        }
        if (!StringUtils.hasText(previousStorageKey)) {
            return;
        }
        if (previousStorageKey.equals(newKey)) {
            return;
        }

        try {
            fileStorageService.delete(previousStorageKey);
        } catch (FileStorageException ex) {
            log.warn("Failed to delete old profile photo {}", previousStorageKey, ex);
        }
    }
}

