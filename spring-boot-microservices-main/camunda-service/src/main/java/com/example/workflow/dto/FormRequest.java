package com.example.workflow.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.Map;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Getter
@Setter
public class FormRequest {
    @NotBlank(message = "title is required")
    private String title;
    
    @NotBlank(message = "formKey is required")
    private String formKey;

    @NotNull(message = "content is required")
    private Map<String, Object> content;
}