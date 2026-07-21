package com.siyamuddin.saas.Utils;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Optional;

/**
 * Utility class for managing secure HTTP-only cookies
 */
@Slf4j
@Component
public class CookieUtils {
    
    private static final String REFRESH_TOKEN_COOKIE_NAME = "refresh_token";
    private static final int REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds
    
    @Value("${app.security.cookie.domain:#{null}}")
    private String cookieDomain;
    
    @Value("${app.security.cookie.secure:true}")
    private boolean secureCookie;
    
    @Value("${app.security.cookie.same-site:Strict}")
    private String sameSite;
    
    /**
     * Add refresh token as HTTP-only cookie
     * @param response HTTP response
     * @param refreshToken The refresh token to store
     */
    public void addRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
        Cookie cookie = new Cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken);
        cookie.setHttpOnly(true); // Prevents JavaScript access (XSS protection)
        cookie.setSecure(secureCookie); // Only send over HTTPS
        cookie.setPath("/");
        cookie.setMaxAge(REFRESH_TOKEN_MAX_AGE);
        
        if (cookieDomain != null && !cookieDomain.isEmpty()) {
            cookie.setDomain(cookieDomain);
        }
        
        // SameSite attribute for CSRF protection
        String cookieHeader = String.format("%s=%s; Path=/; Max-Age=%d; HttpOnly; %s; SameSite=%s",
                REFRESH_TOKEN_COOKIE_NAME,
                refreshToken,
                REFRESH_TOKEN_MAX_AGE,
                secureCookie ? "Secure" : "",
                sameSite
        );
        
        response.addHeader("Set-Cookie", cookieHeader);
        log.debug("Refresh token cookie added");
    }
    
    /**
     * Get refresh token from cookie
     * @param request HTTP request
     * @return Optional containing refresh token if found
     */
    public Optional<String> getRefreshTokenFromCookie(HttpServletRequest request) {
        if (request.getCookies() == null) {
            return Optional.empty();
        }
        
        return Arrays.stream(request.getCookies())
                .filter(cookie -> REFRESH_TOKEN_COOKIE_NAME.equals(cookie.getName()))
                .map(Cookie::getValue)
                .findFirst();
    }
    
    /**
     * Delete refresh token cookie (for logout)
     * @param response HTTP response
     */
    public void deleteRefreshTokenCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie(REFRESH_TOKEN_COOKIE_NAME, "");
        cookie.setHttpOnly(true);
        cookie.setSecure(secureCookie);
        cookie.setPath("/");
        cookie.setMaxAge(0); // Delete immediately
        
        if (cookieDomain != null && !cookieDomain.isEmpty()) {
            cookie.setDomain(cookieDomain);
        }
        
        response.addCookie(cookie);
        log.debug("Refresh token cookie deleted");
    }
    
    /**
     * Check if refresh token cookie exists
     * @param request HTTP request
     * @return true if cookie exists
     */
    public boolean hasRefreshTokenCookie(HttpServletRequest request) {
        return getRefreshTokenFromCookie(request).isPresent();
    }
}

