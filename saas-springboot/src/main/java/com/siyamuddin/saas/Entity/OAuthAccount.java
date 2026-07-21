package com.siyamuddin.saas.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "oauth_accounts", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"provider", "provider_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OAuthAccount {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false, length = 50)
    private String provider; // google, github, etc.
    
    @Column(name = "provider_id", nullable = false, length = 255)
    private String providerId; // Google's user ID
    
    @Column(name = "provider_email", length = 255)
    private String providerEmail;
    
    @Column(name = "provider_name", length = 255)
    private String providerName;
    
    @Column(name = "provider_picture_url", length = 512)
    private String providerPictureUrl;
    
    @Column(name = "linked_at", nullable = false)
    private LocalDateTime linkedAt;
    
    @Column(name = "last_used_at")
    private LocalDateTime lastUsedAt;
    
    @Column(name = "access_token", length = 512)
    private String accessToken; // For future API calls to provider
    
    @Column(name = "refresh_token", length = 512)
    private String refreshToken;
    
    @Column(name = "token_expires_at")
    private LocalDateTime tokenExpiresAt;
    
    @PrePersist
    protected void onCreate() {
        linkedAt = LocalDateTime.now();
        lastUsedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        lastUsedAt = LocalDateTime.now();
    }
}

