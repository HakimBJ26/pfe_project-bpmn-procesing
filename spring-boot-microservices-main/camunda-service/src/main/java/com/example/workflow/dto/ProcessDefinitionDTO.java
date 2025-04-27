package com.example.workflow.dto;

import lombok.Data;

@Data
public class ProcessDefinitionDTO {
    private String id;
    private String key;
    private String name;
    private int version;
    private String resourceName;
    private String deploymentId;
    private String description;
    private String diagramResourceName;
    private boolean isSuspended;
    private String bpmnXml;
    private byte[] diagramBytes;
}