package com.safalifter.jobservice.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProcessDefinitionDto {
    private String id;
    private String key;
    private String name;
    private int version;
}