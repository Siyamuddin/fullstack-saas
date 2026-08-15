package com.siyamuddin.saas;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;

import static org.mockito.Mockito.mock;

@SpringBootTest(properties = {
		"spring.datasource.url=jdbc:h2:mem:testdb;MODE=MySQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE;NON_KEYWORDS=USER",
		"spring.datasource.driverClassName=org.h2.Driver",
		"spring.datasource.username=sa",
		"spring.datasource.password=",
		"spring.jpa.hibernate.ddl-auto=update",
		"spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
		"spring.jpa.properties.hibernate.globally_quoted_identifiers=true",
		"spring.flyway.enabled=false",
		"spring.cache.type=none",
		"spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration,org.springframework.boot.autoconfigure.data.redis.RedisRepositoriesAutoConfiguration,org.springframework.boot.autoconfigure.data.redis.RedisReactiveAutoConfiguration",
		"app.jwt.secret=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEF",
		"app.caching.enabled=false",
		"management.health.redis.enabled=false"
})
@Import(SaasStarterApplicationTests.RedisTestConfig.class)
class SaasStarterApplicationTests {

	@TestConfiguration
	static class RedisTestConfig {
		@Bean
		RedisConnectionFactory redisConnectionFactory() {
			return mock(RedisConnectionFactory.class);
		}

		@Bean
		@SuppressWarnings("unchecked")
		RedisTemplate<String, String> redisTemplate() {
			return mock(RedisTemplate.class);
		}
	}

	@Test
	void contextLoads() {
	}

}
