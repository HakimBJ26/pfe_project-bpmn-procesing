package com.example.workflow.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.Map;

import javax.validation.constraints.NotBlank;

@Getter
@Setter
public class FormUpdateRequest {
    private String title;
    private Map<String, Object> content;
} 