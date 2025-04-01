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
public class GatewayDTO {
    
    private Long id;
    private String gatewayId;
    private String gatewayName;
    private String gatewayType;
    private String conditions;
    private String defaultFlow;
    private LocalDateTime createdAt;
    private LocalDateTime lastModifiedAt;
}
