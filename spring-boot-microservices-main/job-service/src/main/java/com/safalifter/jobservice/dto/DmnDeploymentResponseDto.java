package com.safalifter.jobservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DmnDeploymentResponseDto {
    private String deploymentId;
    private String decisionKey;
    private String name;
    private String version;
    private String message;
}
