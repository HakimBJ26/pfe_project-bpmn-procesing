package com.example.workflow.service;

import com.example.workflow.client.UserServiceClient;
import com.example.workflow.dto.UserDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserIntegrationService {
    private final UserServiceClient userServiceClient;

    public UserDto getUserById(String userId) {
        try {
            ResponseEntity<UserDto> response = userServiceClient.getUserById(userId);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            }
            log.error("Failed to get user by ID: {}", userId);
            throw new RuntimeException("Failed to get user by ID: " + userId);
        } catch (Exception e) {
            log.error("Error getting user by ID: {}", userId, e);
            throw new RuntimeException("Error getting user by ID: " + userId, e);
        }
    }

    public UserDto getUserByUsername(String username) {
        try {
            ResponseEntity<UserDto> response = userServiceClient.getUserByUsername(username);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            }
            log.error("Failed to get user by username: {}", username);
            throw new RuntimeException("Failed to get user by username: " + username);
        } catch (Exception e) {
            log.error("Error getting user by username: {}", username, e);
            throw new RuntimeException("Error getting user by username: " + username, e);
        }
    }
}
