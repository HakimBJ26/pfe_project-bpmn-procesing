package com.safalifter.jobservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserTaskDTO {
    
    private Long id;
    private String taskId;
    private String taskName;
    private String formDefinition;
    private String assignee;
    private String candidateGroups;
    private String candidateUsers;
    private Integer dueDate;
    private Integer followUpDate;
    private Integer priority;
    private LocalDateTime createdAt;
    private LocalDateTime lastModifiedAt;
}
