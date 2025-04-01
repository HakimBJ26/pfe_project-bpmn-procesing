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
public class ServiceTaskDTO {
    
    private Long id;
    private String taskId;
    private String taskName;
    private String implementation;
    private String implementationType;
    private String inputParameters;
    private String outputParameters;
    private Integer retries;
    private String retryTimeout;
    private Boolean asyncBefore;
    private Boolean asyncAfter;
    private Boolean exclusive;
    private LocalDateTime createdAt;
    private LocalDateTime lastModifiedAt;
}
