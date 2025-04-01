package com.safalifter.jobservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Réponse pour les opérations de création/modification de modèles BPMN
 * Format standardisé pour les réponses de l'API
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BpmnModelResponse {
    private Long id;            // ID du processus en base de données
    private String processKey;  // Clé unique du processus
    private String name;        // Nom du processus
    private String xml;         // XML BPMN (optionnel, peut être null)
    private boolean success;    // Indique si l'opération a réussi
    private String message;     // Message informatif ou d'erreur
}
