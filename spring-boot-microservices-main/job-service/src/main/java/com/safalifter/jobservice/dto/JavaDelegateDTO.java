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
public class JavaDelegateDTO {
    private Long id;
    private String className;
    private String description;
    private String packageName;
    private boolean compiled;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
