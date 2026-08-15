package com.siyamuddin.saas.Services;

import com.siyamuddin.saas.Payloads.PagedResponse;
import com.siyamuddin.saas.Payloads.UserPayload.UserDto;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
public interface UserService {
    UserDto registerNewUser(UserDto userDto);
    UserDto updateUser(UserDto user, Integer userId);
    UserDto getUserById(Integer userId);
    PagedResponse<UserDto> getAllUser(Integer pageNumber, Integer pageSize, String sortBy, String sortDirec);
    void deleteUser(Integer userId);
    List<UserDto> searchUserByName(String name);
    // Internal method to get User entity for audit/logging purposes
    com.siyamuddin.saas.Entity.User getUserEntityById(Integer userId);
    com.siyamuddin.saas.Entity.User getUserEntityByEmail(String email);
    void changeUserPassword(com.siyamuddin.saas.Entity.User user, String newPassword);
    void updateUserLastLogin(com.siyamuddin.saas.Entity.User user);
}
