package com.example.workflow.request.notification;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SendNotificationRequest {
    private String userId;
    private String taskId;
    private String message;
}
