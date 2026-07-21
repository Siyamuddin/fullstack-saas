package com.siyamuddin.saas.Repository;

import com.siyamuddin.saas.Entity.OAuthAccount;
import com.siyamuddin.saas.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OAuthAccountRepo extends JpaRepository<OAuthAccount, Long> {
    
    Optional<OAuthAccount> findByProviderAndProviderId(String provider, String providerId);
    
    Optional<OAuthAccount> findByUserAndProvider(User user, String provider);
    
    List<OAuthAccount> findByUser(User user);
    
    boolean existsByProviderAndProviderId(String provider, String providerId);
    
    void deleteByUserAndProvider(User user, String provider);
    
    void deleteByUser(User user);
}

