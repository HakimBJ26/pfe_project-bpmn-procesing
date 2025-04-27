package com.example.workflow.dto;

import lombok.Data;

@Data
public class TaskDTO {
    private String id;
    private String name;
    private String assignee;
    
    public TaskDTO(String id, String name, String assignee) {
        this.id = id;
        this.name = name;
        this.assignee = assignee;
    }

}