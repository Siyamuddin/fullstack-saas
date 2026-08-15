package com.siyamuddin.saas.Config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;

@OpenAPIDefinition(
        info = @Info(
                title = "BlockChain Monitoring System API",
                description = "A production-ready blockchain monitoring system with advanced user management, authentication, and security features. Endpoints are organized into Admin and User categories for better clarity.",
                version = "1.0.0",
                termsOfService = "Terms of Service",
                contact = @Contact(
                        name = "BlockChain Monitoring System Team",
                        email = "support@blockchainmonitoring.com"
                )
        ),
        servers = {
                @Server(
                        description = "Development Environment",
                        url = "http://localhost:9090"
                ),
                @Server(
                        description = "Production Environment",
                        url = "https://api.saasstarter.com"
                )
        }
)
@SecurityScheme(
        name = "JWT-Auth",
        description = "JWT Authentication using Bearer Token. Include 'Bearer {token}' in the Authorization header.",
        scheme = "bearer",
        type = SecuritySchemeType.HTTP,
        bearerFormat = "JWT",
        in = SecuritySchemeIn.HEADER
)
public class OpenApiConfiguration {
}
