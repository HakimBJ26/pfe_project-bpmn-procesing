package com.example.workflow.delegate;

import com.example.workflow.dto.UserDto;
import com.example.workflow.service.NotificationIntegrationService;
import com.example.workflow.service.UserIntegrationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationTaskDelegate implements JavaDelegate {
    private final UserIntegrationService userIntegrationService;
    private final NotificationIntegrationService notificationIntegrationService;

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        log.info("Executing NotificationTaskDelegate");
        
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
            
            // Get notifications for the user
            var notifications = notificationIntegrationService.getAllNotificationsByUserId(userId);
            log.info("Retrieved {} notifications for user {}", notifications.size(), userId);
            
            // Store notification count in process variables
            execution.setVariable("notificationCount", notifications.size());
            execution.setVariable("hasUnreadNotifications", 
                notifications.stream().anyMatch(n -> !n.isRead()));
            
            log.info("Notification information stored in process variables");
        } catch (Exception e) {
            log.error("Error retrieving notification information", e);
            execution.setVariable("notificationError", e.getMessage());
            throw e;
        }
    }
}
