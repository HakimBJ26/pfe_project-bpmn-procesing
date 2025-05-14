package com.example.workflow.service;

import com.example.workflow.client.NotificationServiceClient;
import com.example.workflow.dto.NotificationDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationIntegrationService {
    private final NotificationServiceClient notificationServiceClient;

    public List<NotificationDto> getAllNotificationsByUserId(String userId) {
        try {
            ResponseEntity<List<NotificationDto>> response = notificationServiceClient.getAllByUserId(userId);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            }
            log.error("Failed to get notifications for user: {}", userId);
            return Collections.emptyList();
        } catch (Exception e) {
            log.error("Error getting notifications for user: {}", userId, e);
            return Collections.emptyList();
        }
    }
}
