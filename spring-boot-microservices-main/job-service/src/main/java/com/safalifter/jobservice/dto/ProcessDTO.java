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
public class ProcessDTO {
    
    private Long id;
    private String name;
    private String processKey;
    private String deploymentId;
    private String processDefinitionId;
    private Integer version;
    private LocalDateTime createdAt;
    private LocalDateTime lastModifiedAt;
    private String description;
    private String category;
    private boolean isActive;
}
