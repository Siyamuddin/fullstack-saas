package com.siyamuddin.saas.Services;

import com.siyamuddin.saas.Entity.User;
import com.siyamuddin.saas.Entity.UserSession;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;

public interface SessionService {
    UserSession createSession(User user, HttpServletRequest request);
    void invalidateSession(String sessionId);
    void invalidateAllUserSessions(Integer userId);
    void deleteAllUserSessions(Integer userId);
    List<UserSession> getActiveSessions(Integer userId);
    void refreshSession(String sessionId);
    void cleanupExpiredSessions();
}

