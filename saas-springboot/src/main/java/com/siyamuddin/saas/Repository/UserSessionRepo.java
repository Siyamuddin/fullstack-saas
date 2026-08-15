package com.siyamuddin.saas.Repository;

import com.siyamuddin.saas.Entity.User;
import com.siyamuddin.saas.Entity.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserSessionRepo extends JpaRepository<UserSession, Long> {
    Optional<UserSession> findBySessionId(String sessionId);
    List<UserSession> findByUserAndIsActiveTrue(User user);
    List<UserSession> findByUser(User user);
    void deleteByExpiresAtBefore(LocalDateTime now);
    void deleteByUser(User user);
}

