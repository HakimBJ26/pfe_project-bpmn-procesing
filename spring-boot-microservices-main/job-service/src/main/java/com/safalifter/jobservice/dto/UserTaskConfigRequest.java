package com.safalifter.jobservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserTaskConfigRequest {
    
    private String assignee;
    private String candidateGroups;
    private String candidateUsers;
    private String formKey;
    private String formDefinition;  // Définition du formulaire en JSON
    private Integer dueDate;        // Délai en heures
    private Integer followUpDate;   // Délai de suivi en heures
    private Integer priority;       // Priorité
}
