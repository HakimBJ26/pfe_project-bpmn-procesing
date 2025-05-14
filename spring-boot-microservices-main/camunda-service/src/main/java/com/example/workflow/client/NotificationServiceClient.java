package com.example.workflow.client;

import com.example.workflow.dto.NotificationDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@FeignClient(name = "notification-service", path = "/v1/notification")
public interface NotificationServiceClient {
    @GetMapping("/getAllByUserId/{userId}")
    ResponseEntity<List<NotificationDto>> getAllByUserId(@PathVariable String userId);
}
