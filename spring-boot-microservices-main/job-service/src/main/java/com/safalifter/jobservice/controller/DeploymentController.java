package com.safalifter.jobservice.controller;

import org.camunda.bpm.engine.RepositoryService;
import org.camunda.bpm.engine.RuntimeService;
import org.camunda.bpm.engine.repository.Deployment;
import org.camunda.bpm.engine.repository.ProcessDefinition;
import org.camunda.bpm.engine.runtime.ProcessInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/process")
public class DeploymentController {

    @Autowired
    private RepositoryService repositoryService;
    
    @Autowired
    private RuntimeService runtimeService;

    @PostMapping("/deploy")
    public ResponseEntity<?> deployProcess(@RequestParam("file") MultipartFile file) {
        try {
            // Déploiement du processus
            Deployment deployment = repositoryService.createDeployment()
                .addInputStream(file.getOriginalFilename(), file.getInputStream())
                .deploy();

            // Récupération de la clé du processus
            ProcessDefinition processDefinition = repositoryService
                .createProcessDefinitionQuery()
                .deploymentId(deployment.getId())
                .singleResult();

            return ResponseEntity.ok(Map.of(
                "message", "Processus déployé avec succès",
                "processKey", processDefinition.getKey(),
                "deploymentId", deployment.getId()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Échec du déploiement: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/start")
    public ResponseEntity<?> startProcess(@RequestBody Map<String, Object> request) {
        try {
            String processKey = (String) request.get("processKey");
            Map<String, Object> variables = request.containsKey("variables") 
                ? (Map<String, Object>) request.get("variables") 
                : new HashMap<>();
            
            // Vérification de l'existence du processus
            ProcessDefinition processDefinition = repositoryService
                .createProcessDefinitionQuery()
                .processDefinitionKey(processKey)
                .latestVersion()
                .singleResult();
                
            if (processDefinition == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Processus introuvable avec la clé: " + processKey
                ));
            }
            
            // Démarrage de l'instance de processus
            ProcessInstance processInstance = runtimeService
                .startProcessInstanceByKey(processKey, variables);
                
            return ResponseEntity.ok(Map.of(
                "message", "Processus démarré avec succès",
                "processInstanceId", processInstance.getId(),
                "businessKey", processInstance.getBusinessKey() != null ? processInstance.getBusinessKey() : "",
                "processDefinitionId", processInstance.getProcessDefinitionId()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Échec du démarrage: " + e.getMessage()
            ));
        }
    }
}