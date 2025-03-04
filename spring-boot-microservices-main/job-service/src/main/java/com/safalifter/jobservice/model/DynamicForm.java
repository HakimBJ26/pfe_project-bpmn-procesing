package com.safalifter.jobservice.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;

@Entity
@Table(name = "dynamic_forms")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DynamicForm {
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(name = "form_schema", columnDefinition = "TEXT")
    private String schema;  // JSON schema du formulaire

    @Column(name = "form_ui_schema", columnDefinition = "TEXT")
    private String uiSchema; // Configuration UI du formulaire

    @Column(name = "process_definition_key")
    private String processDefinitionKey; // Clé du processus BPMN associé

    @Column(name = "task_definition_key")
    private String taskDefinitionKey; // Clé de la tâche BPMN associée
}
