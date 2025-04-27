package com.example.workflow.model;


import javax.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity(name = "workflow")
@NoArgsConstructor
@Getter
@Setter
public class Workflow extends BaseEntity {


    @Column(name = "title", nullable = false, unique = true)
    private String title;

    @Column(name = "workflow_content", nullable = false, columnDefinition = "TEXT")
    private String workflowContent;

    @Column(name = "ready_to_deploy", nullable = false, columnDefinition = "boolean default false")
    private Boolean readyToDeploy;

}