package com.siyamuddin.saas.Services.Impl;

import com.siyamuddin.saas.Config.Properties.SecurityProperties;
import com.siyamuddin.saas.Entity.User;
import com.siyamuddin.saas.Entity.UserSession;
import com.siyamuddin.saas.Exceptions.ResourceNotFoundException;
import com.siyamuddin.saas.Repository.UserRepo;
import com.siyamuddin.saas.Repository.UserSessionRepo;
import com.siyamuddin.saas.Services.SessionService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SessionServiceImpl implements SessionService {
    
    private final UserSessionRepo sessionRepo;
    private final UserRepo userRepo;
    private final SecurityProperties securityProperties;
    
    @Override
    @Transactional
    public UserSession createSession(User user, HttpServletRequest request) {
        UserSession session = new UserSession();
        session.setUser(user);
        session.setIpAddress(getClientIP(request));
        session.setUserAgent(request.getHeader("User-Agent"));
        session.setLoginTime(LocalDateTime.now());
        session.setLastActivity(LocalDateTime.now());
        session.setExpiresAt(LocalDateTime.now().plusMinutes(securityProperties.getSessionTimeoutMinutes()));
        session.setIsActive(true);
        
        UserSession saved = sessionRepo.save(session);
        log.info("Session created for user: {} with sessionId: {}", user.getEmail(), saved.getSessionId());
        return saved;
    }
    
    @Override
    @Transactional
    public void invalidateSession(String sessionId) {
        UserSession session = sessionRepo.findBySessionId(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session", "sessionId", 0));
        session.setIsActive(false);
        sessionRepo.save(session);
        log.info("Session invalidated: {}", sessionId);
    }
    
    @Override
    @Transactional
    public void invalidateAllUserSessions(Integer userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        List<UserSession> sessions = sessionRepo.findByUser(user);
        sessions.forEach(session -> session.setIsActive(false));
        sessionRepo.saveAll(sessions);
        log.info("All sessions invalidated for user: {}", userId);
    }
    
    @Override
    @Transactional
    public void deleteAllUserSessions(Integer userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        sessionRepo.deleteByUser(user);
        log.info("All sessions deleted for user: {}", userId);
    }
    
    @Override
    public List<UserSession> getActiveSessions(Integer userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return sessionRepo.findByUserAndIsActiveTrue(user);
    }
    
    @Override
    @Transactional
    public void refreshSession(String sessionId) {
        UserSession session = sessionRepo.findBySessionId(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session", "sessionId", 0));
        
        if (!session.getIsActive() || session.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Session is expired or inactive");
        }
        
        session.setLastActivity(LocalDateTime.now());
        session.setExpiresAt(LocalDateTime.now().plusMinutes(securityProperties.getSessionTimeoutMinutes()));
        sessionRepo.save(session);
    }
    
    @Override
    @Scheduled(fixedRate = 3600000) // Run every hour
    @Transactional
    public void cleanupExpiredSessions() {
        sessionRepo.deleteByExpiresAtBefore(LocalDateTime.now());
        log.info("Expired sessions cleaned up");
    }
    
    private String getClientIP(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
