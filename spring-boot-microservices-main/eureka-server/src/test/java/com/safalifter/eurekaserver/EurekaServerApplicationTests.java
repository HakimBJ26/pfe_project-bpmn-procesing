package com.safalifter.eurekaserver;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(properties = {
    "spring.cloud.config.enabled=false",
    "eureka.client.register-with-eureka=false",
    "eureka.client.fetch-registry=false"
})
@ActiveProfiles("test")
class EurekaServerApplicationTests {

    @Autowired
    private ApplicationContext context;

    @Test
    void contextLoads() {
        // Vérifie que le contexte Spring se charge correctement
        assertNotNull(context);
    }
    
    @Test
    void applicationHasEurekaServerAnnotation() {
        // Vérifie que l'application est bien configurée avec @EnableEurekaServer
        assertTrue(EurekaServerApplication.class.isAnnotationPresent(EnableEurekaServer.class));
    }
    
    @Test
    void applicationNameIsCorrect() {
        // Vérifie que le nom de l'application est correctement configuré
        String applicationName = context.getEnvironment().getProperty("spring.application.name");
        assertEquals("eureka-server", applicationName);
    }
}
