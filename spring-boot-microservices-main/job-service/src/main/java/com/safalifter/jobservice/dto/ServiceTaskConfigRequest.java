package com.safalifter.jobservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceTaskConfigRequest {
    
    private String implementation;
    private String implementationType;  // class, delegateExpression, expression
    private String inputParameters;     // Paramètres d'entrée en JSON
    private String outputParameters;    // Paramètres de sortie en JSON
    private Integer retries;
    private String retryTimeout;
    private Boolean asyncBefore;
    private Boolean asyncAfter;
    private Boolean exclusive;
}
