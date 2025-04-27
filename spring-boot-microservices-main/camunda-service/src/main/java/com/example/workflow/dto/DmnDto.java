package com.example.workflow.dto;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DmnDto {
    private String id;
    private String name;
    private String key;
    private String version;
    private String content;
    private String deploymentId;
} 