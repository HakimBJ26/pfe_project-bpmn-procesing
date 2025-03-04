package com.safalifter.jobservice.dto;

// src/main/java/com/safalifter/jobservice/dto/ProcessInstanceDto.java

import lombok.Builder;
import lombok.Data;

import java.util.Date;

@Data
@Builder
public class ProcessInstanceDto {
    private String id;
    private String processDefinitionId;
    private Date startTime;
    private boolean ended;
}
