package com.safalifter.jobservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JavaDelegateRequest {
    private String name; // Full class name including package
    private String sourceCode; // Java source code
    private String description; // Description of what this delegate does
}
