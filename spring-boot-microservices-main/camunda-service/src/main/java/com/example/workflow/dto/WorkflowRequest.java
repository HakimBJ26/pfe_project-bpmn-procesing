package com.example.workflow.dto;
import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Getter
@Setter
public class WorkflowRequest {
    @NotBlank(message = "Workflow title is required")
    private String title;
    
    @NotNull(message = "Workflow content is required")
    private String content;
}
