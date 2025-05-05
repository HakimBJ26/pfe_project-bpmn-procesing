package com.safalifter.userservice;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(properties = {
    "spring.cloud.config.enabled=false",
    "eureka.client.enabled=false"
})
@ActiveProfiles("test")
class UserServiceApplicationTests {

    @Autowired
    private ApplicationContext context;

	@Test
	void contextLoads() {
        // Vérifie que le contexte Spring se charge correctement
        assertNotNull(context);
	}
    
    @Test
    void securityComponentsExist() {
        // Vérifie que les composants de sécurité sont présents
        assertTrue(context.containsBean("passwordEncoder"), 
                "PasswordEncoder devrait être présent");
        assertTrue(context.containsBean("jwtUtil"), 
                "JwtUtil devrait être présent");
    }
    
    @Test
    void repositoryComponentsExist() {
        // Vérifie que les composants de repository sont présents
        assertTrue(context.containsBean("userRepository"), 
                "UserRepository devrait être présent");
    }
    
    @Test
    void serviceComponentsExist() {
        // Vérifie que les composants de service sont présents
        assertTrue(context.containsBean("userService"), 
                "UserService devrait être présent");
    }
    
    @Test
    void controllerComponentsExist() {
        // Vérifie que les composants de controller sont présents
        assertTrue(context.containsBean("userController"), 
                "UserController devrait être présent");
    }
}
