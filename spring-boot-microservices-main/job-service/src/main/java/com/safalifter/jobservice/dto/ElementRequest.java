package com.safalifter.jobservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ElementRequest {
    
    private String type;            // userTask, serviceTask, exclusiveGateway, etc.
    private String elementId;       // ID de l'élément à ajouter
    private String name;            // Nom de l'élément
    private String sourceId;        // ID de l'élément source pour la connexion
    private String targetId;        // ID de l'élément cible pour la connexion
    private List<String> targetIds; // Liste des IDs des éléments cibles (pour les gateways)
    private List<String> conditions; // Conditions pour les flux sortants (pour les gateways)
    private String defaultTargetId; // ID de l'élément cible par défaut (pour les gateways)
    private String implementation;  // Implémentation pour les serviceTask
}
