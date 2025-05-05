package com.safalifter.configserver;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cloud.config.server.EnableConfigServer;
import org.springframework.context.ApplicationContext;
import org.springframework.core.env.Environment;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(properties = {
    "spring.cloud.config.server.git.uri=file:///tmp/config-repo-temp",
    "spring.cloud.config.server.git.clone-on-start=false",
    "spring.profiles.active=native",
    "spring.cloud.config.server.native.search-locations=classpath:/config"
})
class ConfigServerApplicationTests {

    @Autowired
    private ApplicationContext context;
    
    @Autowired
    private Environment environment;

    @Test
    void contextLoads() {
        // Vérifie que le contexte Spring se charge correctement
        assertNotNull(context);
    }
    
    @Test
    void applicationHasConfigServerAnnotation() {
        // Vérifie que l'application est bien configurée avec @EnableConfigServer
        assertTrue(ConfigServerApplication.class.isAnnotationPresent(EnableConfigServer.class));
    }
    
    @Test
    void applicationNameIsCorrect() {
        // Vérifie que le nom de l'application est correctement configuré
        String applicationName = environment.getProperty("spring.application.name");
        assertEquals("config-server", applicationName);
    }
    
    @Test
    void configServerPortIsSet() {
        // Vérifie que le port du serveur de configuration est configuré
        String serverPort = environment.getProperty("server.port");
        assertNotNull(serverPort);
    }
}
