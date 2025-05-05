package com.safalifter.gateway;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.context.ApplicationContext;
import org.springframework.core.env.Environment;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(properties = {
    "spring.cloud.config.enabled=false",
    "eureka.client.enabled=false"
})
@ActiveProfiles("test")
class GatewayApplicationTests {

    @Autowired
    private ApplicationContext context;
    
    @Autowired
    private Environment environment;
    
    @Autowired(required = false)
    private RouteLocator routeLocator;

	@Test
	void contextLoads() {
        // Vérifie que le contexte Spring se charge correctement
        assertNotNull(context);
	}
    
    @Test
    void applicationNameIsCorrect() {
        // Vérifie que le nom de l'application est correctement configuré
        String applicationName = environment.getProperty("spring.application.name");
        assertEquals("gateway", applicationName);
    }
    
    @Test
    void routeLocatorExists() {
        // Vérifie que le RouteLocator est initialisé
        assertNotNull(routeLocator, "RouteLocator devrait être initialisé");
    }
    
    @Test
    void securityComponentsExist() {
        // Vérifie que les composants de sécurité sont présents
        assertTrue(context.containsBean("jwtAuthenticationFilter"),
                "Le filtre d'authentification JWT devrait être présent");
        assertTrue(context.containsBean("jwtUtil"),
                "L'utilitaire JWT devrait être présent");
    }
}
