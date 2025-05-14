package com.example.workflow.delegate;

import com.example.workflow.dto.UserDto;
import com.example.workflow.service.UserIntegrationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserTaskDelegate implements JavaDelegate {
    private final UserIntegrationService userIntegrationService;

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        log.info("Executing UserTaskDelegate");
        
        // Get the user ID from the process variables
        String userId = (String) execution.getVariable("userId");
        if (userId == null || userId.isEmpty()) {
            log.error("User ID is missing in process variables");
            throw new IllegalArgumentException("User ID is required");
        }
        
        try {
            // Get user information from the user service
            UserDto user = userIntegrationService.getUserById(userId);
            log.info("Retrieved user: {}", user);
            
            // Store user information in process variables
            execution.setVariable("user", user);
            execution.setVariable("username", user.getUsername());
            execution.setVariable("email", user.getEmail());
            
            if (user.getUserDetails() != null) {
                execution.setVariable("firstName", user.getUserDetails().getFirstName());
                execution.setVariable("lastName", user.getUserDetails().getLastName());
            }
            
            log.info("User information stored in process variables");
        } catch (Exception e) {
            log.error("Error retrieving user information", e);
            execution.setVariable("userError", e.getMessage());
            throw e;
        }
    }
}
