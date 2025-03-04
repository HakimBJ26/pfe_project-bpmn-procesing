package com.safalifter.jobservice.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DynamicFormDto {
    private String id;
    private String name;
    private JsonNode schema;
    private JsonNode uiSchema;
    private String processDefinitionKey;
    private String taskDefinitionKey;
}
