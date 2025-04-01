package com.safalifter.jobservice.controller;

import com.safalifter.jobservice.dto.*;
import com.safalifter.jobservice.model.BpmnProcess;
import com.safalifter.jobservice.service.BpmnModelService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.engine.RepositoryService;
import org.camunda.bpm.engine.RuntimeService;
import org.camunda.bpm.engine.runtime.ProcessInstance;
import org.camunda.bpm.model.bpmn.Bpmn;
import org.camunda.bpm.model.bpmn.BpmnModelInstance;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/bpmn")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class BpmnDesignerController {

    private final BpmnModelService bpmnModelService;
    private final RepositoryService repositoryService;
    private final RuntimeService runtimeService;

    /**
     * Crée un nouveau processus BPMN vide
     */
    @PostMapping("/create")
    public ResponseEntity<BpmnModelResponse> createEmptyProcess(@RequestBody ProcessCreateRequest request) {
        try {
            log.info("Début de createEmptyProcess avec request: {}", request);
            
            // Valider les données de la requête
            if (request.getName() == null || request.getName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(
                    BpmnModelResponse.builder()
                        .success(false)
                        .message("Le nom du processus est obligatoire")
                        .build()
                );
            }
            
            // Créer un modèle BPMN vide
            BpmnModelInstance modelInstance = bpmnModelService.createEmptyBpmnModel(request.getName());
            
            // Enregistrer et déployer le modèle
            BpmnProcess process = bpmnModelService.saveAndDeployBpmnModel(
                modelInstance, 
                request.getName(), 
                request.getCategory() != null ? request.getCategory() : "",
                request.getDescription() != null ? request.getDescription() : ""
            );
            
            log.info("Processus créé avec succès, id: {}", process.getId());
            
            // Convertir le modèle en XML pour le renvoyer au client
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            Bpmn.writeModelToStream(outputStream, modelInstance);
            String bpmnXml = outputStream.toString();
            
            return ResponseEntity.ok(
                BpmnModelResponse.builder()
                    .id(process.getId())
                    .processKey(process.getProcessKey())
                    .name(process.getName())
                    .xml(bpmnXml)
                    .success(true)
                    .message("Processus créé avec succès")
                    .build()
            );
        } catch (Exception e) {
            log.error("Erreur lors de la création du modèle ou sauvegarde", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(
                    BpmnModelResponse.builder()
                        .success(false)
                        .message("Erreur lors de la création du processus: " + e.getMessage())
                        .build()
                );
        }
    }

    /**
     * Récupère tous les processus actifs
     */
    @GetMapping("/processes")
    public ResponseEntity<?> getAllActiveProcesses() {
        try {
            List<BpmnProcess> processes = bpmnModelService.getAllActiveProcesses();
            List<ProcessDTO> processDTOs = processes.stream()
                .map(this::convertToProcessDTO)
                .collect(Collectors.toList());
                
            return ResponseEntity.ok(processDTOs);
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des processus", e);
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Échec de la récupération: " + e.getMessage()
            ));
        }
    }

    /**
     * Récupère un processus par ID
     */
    @GetMapping("/processes/{id}")
    public ResponseEntity<?> getProcessById(@PathVariable Long id) {
        try {
            BpmnProcess process = bpmnModelService.getProcessById(id);
            return ResponseEntity.ok(convertToProcessDTO(process));
        } catch (Exception e) {
            log.error("Erreur lors de la récupération du processus", e);
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Processus non trouvé: " + e.getMessage()
            ));
        }
    }

    /**
     * Récupère toutes les versions d'un processus
     */
    @GetMapping("/processes/{processKey}/versions")
    public ResponseEntity<?> getProcessVersions(@PathVariable String processKey) {
        try {
            List<BpmnProcess> versions = bpmnModelService.getAllVersionsByProcessKey(processKey);
            List<ProcessDTO> versionDTOs = versions.stream()
                .map(this::convertToProcessDTO)
                .collect(Collectors.toList());
                
            return ResponseEntity.ok(versionDTOs);
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des versions", e);
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Échec de la récupération: " + e.getMessage()
            ));
        }
    }

    /**
     * Ajoute un élément au processus BPMN
     */
    @PostMapping("/processes/{id}/elements")
    public ResponseEntity<?> addElement(@PathVariable Long id, @RequestBody ElementRequest request) {
        try {
            BpmnProcess process = bpmnModelService.getProcessById(id);
            BpmnModelInstance modelInstance = bpmnModelService.loadBpmnModel(process.getBpmnXml());
            
            switch (request.getType()) {
                case "userTask":
                    modelInstance = bpmnModelService.addUserTask(modelInstance, 
                                    request.getElementId(), 
                                    request.getName(), 
                                    request.getSourceId(), 
                                    request.getTargetId());
                    break;
                    
                case "serviceTask":
                    modelInstance = bpmnModelService.addServiceTask(modelInstance, 
                                    request.getElementId(), 
                                    request.getName(), 
                                    request.getImplementation(), 
                                    request.getSourceId(), 
                                    request.getTargetId());
                    break;
                    
                case "exclusiveGateway":
                    modelInstance = bpmnModelService.addExclusiveGateway(modelInstance, 
                                    request.getElementId(), 
                                    request.getName(), 
                                    request.getSourceId(), 
                                    request.getTargetIds(), 
                                    request.getConditions(), 
                                    request.getDefaultTargetId());
                    break;
                    
                default:
                    return ResponseEntity.badRequest().body(Map.of(
                        "error", "Type d'élément non supporté: " + request.getType()
                    ));
            }
            
            // Sauvegarder et déployer la nouvelle version
            BpmnProcess updatedProcess = bpmnModelService.saveAndDeployBpmnModel(
                    modelInstance, 
                    process.getName(), 
                    process.getCategory(), 
                    process.getDescription()
            );
            
            return ResponseEntity.ok(Map.of(
                "message", "Élément ajouté avec succès",
                "processId", updatedProcess.getId(),
                "version", updatedProcess.getVersion()
            ));
        } catch (Exception e) {
            log.error("Erreur lors de l'ajout de l'élément", e);
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Échec de l'ajout: " + e.getMessage()
            ));
        }
    }

    /**
     * Configure une tâche utilisateur
     */
    @PutMapping("/processes/{id}/user-tasks/{taskId}")
    public ResponseEntity<?> configureUserTask(@PathVariable Long id, @PathVariable String taskId, 
                                              @RequestBody UserTaskConfigRequest request) {
        try {
            BpmnProcess process = bpmnModelService.getProcessById(id);
            BpmnModelInstance modelInstance = bpmnModelService.loadBpmnModel(process.getBpmnXml());
            
            modelInstance = bpmnModelService.configureUserTask(modelInstance, 
                          taskId, 
                          request.getAssignee(), 
                          request.getCandidateGroups(), 
                          request.getCandidateUsers(), 
                          request.getFormKey());
            
            // Sauvegarder la configuration du formulaire
            bpmnModelService.saveUserTaskFormConfiguration(process, taskId, request);
            
            // Sauvegarder et déployer la nouvelle version
            BpmnProcess updatedProcess = bpmnModelService.saveAndDeployBpmnModel(
                    modelInstance, 
                    process.getName(), 
                    process.getCategory(), 
                    process.getDescription()
            );
            
            return ResponseEntity.ok(Map.of(
                "message", "Tâche utilisateur configurée avec succès",
                "processId", updatedProcess.getId(),
                "version", updatedProcess.getVersion()
            ));
        } catch (Exception e) {
            log.error("Erreur lors de la configuration de la tâche utilisateur", e);
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Échec de la configuration: " + e.getMessage()
            ));
        }
    }

    /**
     * Configure une tâche de service
     */
    @PutMapping("/processes/{id}/service-tasks/{taskId}")
    public ResponseEntity<?> configureServiceTask(@PathVariable Long id, @PathVariable String taskId, 
                                                @RequestBody ServiceTaskConfigRequest request) {
        try {
            BpmnProcess process = bpmnModelService.getProcessById(id);
            BpmnModelInstance modelInstance = bpmnModelService.loadBpmnModel(process.getBpmnXml());
            
            modelInstance = bpmnModelService.configureServiceTask(modelInstance, 
                          taskId, 
                          request.getImplementation(), 
                          request.getAsyncBefore(), 
                          request.getAsyncAfter(), 
                          request.getExclusive());
            
            // Sauvegarder la configuration de la tâche
            bpmnModelService.saveServiceTaskConfiguration(process, taskId, request);
            
            // Sauvegarder et déployer la nouvelle version
            BpmnProcess updatedProcess = bpmnModelService.saveAndDeployBpmnModel(
                    modelInstance, 
                    process.getName(), 
                    process.getCategory(), 
                    process.getDescription()
            );
            
            return ResponseEntity.ok(Map.of(
                "message", "Tâche de service configurée avec succès",
                "processId", updatedProcess.getId(),
                "version", updatedProcess.getVersion()
            ));
        } catch (Exception e) {
            log.error("Erreur lors de la configuration de la tâche de service", e);
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Échec de la configuration: " + e.getMessage()
            ));
        }
    }

    /**
     * Supprime un élément du processus
     */
    @DeleteMapping("/processes/{id}/elements/{elementId}")
    public ResponseEntity<?> removeElement(@PathVariable Long id, @PathVariable String elementId) {
        try {
            BpmnProcess process = bpmnModelService.getProcessById(id);
            BpmnModelInstance modelInstance = bpmnModelService.loadBpmnModel(process.getBpmnXml());
            
            modelInstance = bpmnModelService.removeElement(modelInstance, elementId);
            
            // Sauvegarder et déployer la nouvelle version
            BpmnProcess updatedProcess = bpmnModelService.saveAndDeployBpmnModel(
                    modelInstance, 
                    process.getName(), 
                    process.getCategory(), 
                    process.getDescription()
            );
            
            return ResponseEntity.ok(Map.of(
                "message", "Élément supprimé avec succès",
                "processId", updatedProcess.getId(),
                "version", updatedProcess.getVersion()
            ));
        } catch (Exception e) {
            log.error("Erreur lors de la suppression de l'élément", e);
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Échec de la suppression: " + e.getMessage()
            ));
        }
    }

    /**
     * Démarre une instance de processus
     */
    @PostMapping("/processes/{processKey}/start")
    public ResponseEntity<?> startProcess(@PathVariable String processKey, @RequestBody Map<String, Object> variables) {
        try {
            ProcessInstance processInstance = runtimeService.startProcessInstanceByKey(processKey, variables);
            
            return ResponseEntity.ok(Map.of(
                "message", "Processus démarré avec succès",
                "processInstanceId", processInstance.getId(),
                "businessKey", processInstance.getBusinessKey() != null ? processInstance.getBusinessKey() : "",
                "processDefinitionId", processInstance.getProcessDefinitionId()
            ));
        } catch (Exception e) {
            log.error("Erreur lors du démarrage du processus", e);
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Échec du démarrage: " + e.getMessage()
            ));
        }
    }

    /**
     * Récupère les tâches utilisateur d'un processus
     */
    @GetMapping("/processes/{id}/user-tasks")
    public ResponseEntity<?> getUserTasks(@PathVariable Long id) {
        try {
            List<UserTaskDTO> userTasks = bpmnModelService.getUserTasksByProcessId(id);
            return ResponseEntity.ok(userTasks);
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des tâches utilisateur", e);
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Échec de la récupération: " + e.getMessage()
            ));
        }
    }

    /**
     * Récupère les tâches de service d'un processus
     */
    @GetMapping("/processes/{id}/service-tasks")
    public ResponseEntity<?> getServiceTasks(@PathVariable Long id) {
        try {
            List<ServiceTaskDTO> serviceTasks = bpmnModelService.getServiceTasksByProcessId(id);
            return ResponseEntity.ok(serviceTasks);
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des tâches de service", e);
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Échec de la récupération: " + e.getMessage()
            ));
        }
    }

    /**
     * Récupère les gateways d'un processus
     */
    @GetMapping("/processes/{id}/gateways")
    public ResponseEntity<?> getGateways(@PathVariable Long id) {
        try {
            List<GatewayDTO> gateways = bpmnModelService.getGatewaysByProcessId(id);
            return ResponseEntity.ok(gateways);
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des gateways", e);
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Échec de la récupération: " + e.getMessage()
            ));
        }
    }

    /**
     * Met à jour le XML d'un processus BPMN
     */
    @PutMapping("/processes/{id}/xml")
    public ResponseEntity<?> updateProcessXml(@PathVariable Long id, @RequestBody Map<String, String> xmlData) {
        try {
            log.info("Début de updateProcessXml pour processus ID={}", id);
            
            // Validation des entrées
            String xml = xmlData.get("xml");
            if (xml == null || xml.isEmpty()) {
                log.warn("XML manquant ou vide pour processus ID={}", id);
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Le XML est requis"
                ));
            }
            
            log.info("Recherche du processus ID={}", id);
            BpmnProcess process = bpmnModelService.getProcessById(id);
            if (process == null) {
                log.warn("Processus non trouvé avec ID={}", id);
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Processus non trouvé avec l'ID: " + id
                ));
            }
            
            log.info("Processus trouvé: nom={}, clé={}", process.getName(), process.getProcessKey());
            
            try {
                // Charger le XML en tant que modèle BPMN
                log.info("Chargement du XML en modèle BPMN, taille={} caractères", xml.length());
                BpmnModelInstance modelInstance = bpmnModelService.loadBpmnModel(xml);
                
                // Sauvegarder et déployer la nouvelle version
                log.info("Sauvegarde et déploiement du modèle");
                BpmnProcess updatedProcess = bpmnModelService.saveAndDeployBpmnModel(
                        modelInstance, 
                        process.getName(), 
                        process.getCategory(), 
                        process.getDescription()
                );
                
                log.info("Processus mis à jour: ID={}, version={}", updatedProcess.getId(), updatedProcess.getVersion());
                
                return ResponseEntity.ok(Map.of(
                    "id", updatedProcess.getId(),
                    "message", "Processus mis à jour avec succès",
                    "processKey", updatedProcess.getProcessKey(),
                    "version", updatedProcess.getVersion()
                ));
            } catch (Exception e) {
                log.error("Erreur lors du traitement du XML", e);
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Erreur lors du traitement du XML: " + e.getMessage()
                ));
            }
        } catch (Exception e) {
            log.error("Erreur lors de la mise à jour du XML du processus", e);
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Échec de la mise à jour: " + e.getMessage()
            ));
        }
    }

    /**
     * Convertit un BpmnProcess en ProcessDTO
     */
    private ProcessDTO convertToProcessDTO(BpmnProcess process) {
        return ProcessDTO.builder()
                .id(process.getId())
                .name(process.getName())
                .processKey(process.getProcessKey())
                .deploymentId(process.getDeploymentId())
                .processDefinitionId(process.getProcessDefinitionId())
                .version(process.getVersion())
                .createdAt(process.getCreatedAt())
                .lastModifiedAt(process.getLastModifiedAt())
                .description(process.getDescription())
                .category(process.getCategory())
                .isActive(process.isActive())
                .build();
    }
}
