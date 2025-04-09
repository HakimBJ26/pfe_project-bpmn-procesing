package com.safalifter.jobservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DmnDefinitionDto {
    private String id;
    private String name;
    private String decisionKey;
    private String description;
    private String category;
    private String version;
    private String deploymentId;
    private boolean deployed;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deployedAt;
}
