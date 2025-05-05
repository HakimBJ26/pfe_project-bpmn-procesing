package com.example.workflow;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(properties = {
    "spring.cloud.config.enabled=false",
    "eureka.client.enabled=false",
    "spring.flyway.enabled=false",
    "camunda.bpm.enabled=false" // Désactiver Camunda pour les tests unitaires simples
})
@ActiveProfiles("test")
@ExtendWith(SpringExtension.class)
public class ApplicationTests {

    @Autowired
    private ApplicationContext context;

    @Test
    void contextLoads() {
        // Vérifie que le contexte Spring se charge correctement
        assertNotNull(context);
    }
    
    @Test
    void controllerComponentsExist() {
        // Vérifie que les composants de controller principaux sont présents
        assertTrue(context.containsBean("processController"), 
                "ProcessController devrait être présent");
        assertTrue(context.containsBean("taskController"), 
                "TaskController devrait être présent");
        assertTrue(context.containsBean("workflowController"), 
                "WorkflowController devrait être présent");
    }
    
    @Test
    void repositoryComponentsExist() {
        // Vérifie que les composants de repository sont présents
        assertTrue(context.containsBean("formRepository"), 
                "FormRepository devrait être présent");
        assertTrue(context.containsBean("workflowRepository"), 
                "WorkflowRepository devrait être présent");
    }
    
    @Test
    void serviceComponentsExist() {
        // Vérifie que les composants de service sont présents
        assertTrue(context.containsBean("formsService"), 
                "FormsService devrait être présent");
        assertTrue(context.containsBean("workflowService"), 
                "WorkflowService devrait être présent");
        assertTrue(context.containsBean("processService"), 
                "ProcessService devrait être présent");
    }
}
