package com.example.workflow.controller;

import com.example.workflow.dto.NotificationDto;
import com.example.workflow.dto.UserDto;
import com.example.workflow.service.NotificationIntegrationService;
import com.example.workflow.service.UserIntegrationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/integration")
@RequiredArgsConstructor
@Slf4j
public class IntegrationController {
    private final UserIntegrationService userIntegrationService;
    private final NotificationIntegrationService notificationIntegrationService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<UserDto> getUserById(@PathVariable String userId) {
        log.info("Getting user by ID: {}", userId);
        UserDto user = userIntegrationService.getUserById(userId);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/user/username/{username}")
    public ResponseEntity<UserDto> getUserByUsername(@PathVariable String username) {
        log.info("Getting user by username: {}", username);
        UserDto user = userIntegrationService.getUserByUsername(username);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/notifications/{userId}")
    public ResponseEntity<List<NotificationDto>> getNotificationsByUserId(@PathVariable String userId) {
        log.info("Getting notifications for user: {}", userId);
        List<NotificationDto> notifications = notificationIntegrationService.getAllNotificationsByUserId(userId);
        return ResponseEntity.ok(notifications);
    }
}
