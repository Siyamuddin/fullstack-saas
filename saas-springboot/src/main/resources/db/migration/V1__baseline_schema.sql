-- Baseline schema for SaaS starter (MySQL-compatible)
-- Roles
CREATE TABLE IF NOT EXISTS role (
    id INT NOT NULL PRIMARY KEY,
    name VARCHAR(255)
);

INSERT INTO role (id, name) VALUES (1, 'ROLE_ADMIN')
    ON DUPLICATE KEY UPDATE name = VALUES(name);
INSERT INTO role (id, name) VALUES (2, 'ROLE_NORMAL')
    ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Users
CREATE TABLE IF NOT EXISTS user (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    about VARCHAR(255),
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    email_verification_token_expiry DATETIME,
    password_reset_token VARCHAR(255),
    password_reset_token_expiry DATETIME,
    failed_login_attempts INT DEFAULT 0,
    account_locked_until DATETIME,
    last_login_date DATETIME,
    profile_image_url VARCHAR(512),
    profile_image_storage_key VARCHAR(512),
    phone_number VARCHAR(255),
    timezone VARCHAR(255),
    locale VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS user_role (
    user INT NOT NULL,
    role INT NOT NULL,
    PRIMARY KEY (user, role),
    CONSTRAINT fk_user_role_user FOREIGN KEY (user) REFERENCES user (id),
    CONSTRAINT fk_user_role_role FOREIGN KEY (role) REFERENCES role (id)
);

CREATE TABLE IF NOT EXISTS refresh_token (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(500) NOT NULL UNIQUE,
    user_id INT NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_refresh_token_user FOREIGN KEY (user_id) REFERENCES user (id)
);

CREATE TABLE IF NOT EXISTS user_session (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL UNIQUE,
    user_id INT NOT NULL,
    ip_address VARCHAR(255),
    user_agent VARCHAR(500),
    login_time DATETIME NOT NULL,
    last_activity DATETIME,
    expires_at DATETIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_user_session_user FOREIGN KEY (user_id) REFERENCES user (id)
);

CREATE TABLE IF NOT EXISTS token_blacklist (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(500) NOT NULL UNIQUE,
    user_id INT,
    expires_at DATETIME NOT NULL,
    blacklisted_at DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_log (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    timestamp DATETIME NOT NULL,
    success BOOLEAN NOT NULL DEFAULT TRUE,
    error_message VARCHAR(1000)
);

CREATE TABLE IF NOT EXISTS oauth_accounts (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    provider VARCHAR(50) NOT NULL,
    provider_id VARCHAR(255) NOT NULL,
    provider_email VARCHAR(255),
    provider_name VARCHAR(255),
    provider_picture_url VARCHAR(512),
    linked_at DATETIME NOT NULL,
    last_used_at DATETIME,
    access_token VARCHAR(512),
    refresh_token VARCHAR(512),
    token_expires_at DATETIME,
    CONSTRAINT fk_oauth_accounts_user FOREIGN KEY (user_id) REFERENCES user (id),
    CONSTRAINT uk_oauth_provider UNIQUE (provider, provider_id)
);

CREATE TABLE IF NOT EXISTS app_settings (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value VARCHAR(4000),
    setting_category VARCHAR(50) NOT NULL,
    description VARCHAR(500),
    data_type VARCHAR(20) NOT NULL,
    is_sensitive BOOLEAN DEFAULT FALSE,
    created_at DATETIME,
    updated_at DATETIME,
    updated_by INT
);
