package com.safalifter.jobservice.service;

import com.safalifter.jobservice.model.BpmnProcess;
import com.safalifter.jobservice.model.GatewayConfig;
import com.safalifter.jobservice.model.ServiceTaskConfig;
import com.safalifter.jobservice.model.UserTaskForm;
import com.safalifter.jobservice.repository.BpmnProcessRepository;
import com.safalifter.jobservice.util.BpmnXmlHelper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.engine.RepositoryService;
import org.camunda.bpm.engine.RuntimeService;
import org.camunda.bpm.engine.repository.Deployment;
import org.camunda.bpm.engine.repository.ProcessDefinition;
import org.camunda.bpm.model.bpmn.Bpmn;
import org.camunda.bpm.model.bpmn.BpmnModelInstance;
import org.camunda.bpm.model.bpmn.instance.*;
import org.camunda.bpm.model.bpmn.instance.Process;
import org.camunda.bpm.model.bpmn.instance.bpmndi.*;
import org.camunda.bpm.model.bpmn.instance.dc.Bounds;
import org.camunda.bpm.model.bpmn.instance.di.Waypoint;
import org.camunda.bpm.model.xml.ModelInstance;
import org.camunda.bpm.model.xml.instance.ModelElementInstance;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import com.safalifter.jobservice.dto.GatewayDTO;
import com.safalifter.jobservice.dto.ServiceTaskDTO;
import com.safalifter.jobservice.dto.UserTaskConfigRequest;
import com.safalifter.jobservice.dto.UserTaskDTO;
import com.safalifter.jobservice.dto.ServiceTaskConfigRequest;
import com.safalifter.jobservice.repository.GatewayConfigRepository;
import com.safalifter.jobservice.repository.ServiceTaskConfigRepository;
import com.safalifter.jobservice.repository.UserTaskFormRepository;

@Service
@RequiredArgsConstructor
@Slf4j
public class BpmnModelService {

    private final BpmnProcessRepository bpmnProcessRepository;
    private final UserTaskFormRepository userTaskFormRepository;
    private final ServiceTaskConfigRepository serviceTaskConfigRepository;
    private final GatewayConfigRepository gatewayConfigRepository;
    private final RepositoryService repositoryService;
    private final RuntimeService runtimeService;

    /**
     * Crée un modèle BPMN vide avec un processus de base
     * 
     * @param processName Nom du processus
     * @return Un modèle BPMN avec un processus vide
     */
    public BpmnModelInstance createEmptyBpmnModel(String processName) {
        log.info("Création d'un modèle BPMN vide avec le nom: {}", processName);
        
        // Nettoyer le nom pour avoir un ID valide
        String cleanProcessName = processName.replaceAll("[^a-zA-Z0-9]", "_").toLowerCase();
        
        // Créer un modèle vide
        BpmnModelInstance modelInstance = Bpmn.createEmptyModel();
        
        // Créer l'élément Definitions (racine du modèle BPMN)
        Definitions definitions = modelInstance.newInstance(Definitions.class);
        modelInstance.setDefinitions(definitions);
        definitions.setId("Definitions_" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
        
        // Ajouter les attributs standards (pas les namespaces XML, qui seront ajoutés automatiquement)
        BpmnXmlHelper.addRequiredNamespaces(definitions);
        
        // Créer un processus vide
        Process process = modelInstance.newInstance(Process.class);
        definitions.addChildElement(process);
        
        // Configurer le processus
        String processId = cleanProcessName + "_" + UUID.randomUUID().toString().replace("-", "").substring(0, 8);
        process.setId(processId);
        process.setName(processName);
        process.setExecutable(true);
        
        // Définir la clé du processus pour Camunda
        BpmnXmlHelper.setProcessKey(process, processId);
        
        // Créer un événement de début
        StartEvent startEvent = modelInstance.newInstance(StartEvent.class);
        process.addChildElement(startEvent);
        String startEventId = "StartEvent_" + UUID.randomUUID().toString().replace("-", "").substring(0, 8);
        startEvent.setId(startEventId);
        startEvent.setName("Début");
        
        // Créer un événement de fin
        EndEvent endEvent = modelInstance.newInstance(EndEvent.class);
        process.addChildElement(endEvent);
        String endEventId = "EndEvent_" + UUID.randomUUID().toString().replace("-", "").substring(0, 8);
        endEvent.setId(endEventId);
        endEvent.setName("Fin");
        
        // Relier les événements de début et de fin
        SequenceFlow flow = modelInstance.newInstance(SequenceFlow.class);
        process.addChildElement(flow);
        flow.setId("Flow_" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
        flow.setSource(startEvent);
        flow.setTarget(endEvent);
        
        // Normaliser les namespaces en convertissant en XML puis en rechargeant
        // Cela garantit que tous les namespaces nécessaires sont correctement ajoutés
        BpmnModelInstance normalizedModel = BpmnXmlHelper.normalizeNamespaces(modelInstance);
        
        // Ajouter des éléments de diagramme BPMN pour permettre l'affichage graphique
        addBpmnDiagram(normalizedModel, process, startEvent, endEvent, flow);
        
        return normalizedModel;
    }

    /**
     * Sauvegarde et déploie un modèle BPMN
     * @param modelInstance Le modèle BPMN à sauvegarder
     * @param name Nom du processus
     * @return Le processus sauvegardé en base de données
     */
    @Transactional
    public BpmnProcess saveAndDeployBpmnModel(BpmnModelInstance modelInstance, String name, String category, String description) {
        try {
            log.info("Début de saveAndDeployBpmnModel pour le processus: {}", name);
            
            // Obtenir l'élément de processus
            Process process = modelInstance.getModelElementsByType(Process.class).iterator().next();
            String processId = process.getId();
            
            // Vérifier si le processus a un ID valide
            if (processId == null || processId.trim().isEmpty()) {
                log.warn("Processus sans ID valide, génération d'un nouvel ID");
                processId = "Process_" + UUID.randomUUID().toString().replace("-", "").substring(0, 8);
                process.setId(processId);
            }
            
            // Définir l'attribut isExecutable
            process.setExecutable(true);
            
            // Exporter le modèle en XML
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            Bpmn.writeModelToStream(outputStream, modelInstance);
            String bpmnXml = outputStream.toString();
            
            log.info("XML généré pour le processus: {}, taille: {} caractères", processId, bpmnXml.length());
            
            // Créer/mettre à jour l'entité de processus
            BpmnProcess bpmnProcess = null;
            
            // Chercher le processus par clé si disponible
            String processKey = BpmnXmlHelper.getProcessKey(process);
            
            // Vérifier également attribut id comme solution de secours
            if (processKey == null || processKey.trim().isEmpty()) {
                // Essayer d'utiliser l'id du processus comme processKey
                processKey = process.getId();
            }
            
            if (processKey == null || processKey.trim().isEmpty()) {
                processKey = "process_" + UUID.randomUUID().toString().replace("-", "").substring(0, 8);
                try {
                    // Utiliser notre méthode setProcessKey qui gère correctement le namespace
                    BpmnXmlHelper.setProcessKey(process, processKey);
                    log.info("Attribut processKey défini avec succès: {}", processKey);
                } catch (Exception e) {
                    log.error("Erreur lors de la définition de l'attribut processKey: {}", e.getMessage());
                    // Continuer sans définir l'attribut - on garde la valeur pour la BD
                }
            }
            
            if (processKey != null && !processKey.trim().isEmpty()) {
                log.info("Recherche du processus avec la clé: {}", processKey);
                Optional<BpmnProcess> optionalProcess = bpmnProcessRepository.findLatestVersionByProcessKey(processKey);
                bpmnProcess = optionalProcess.orElse(null);
            }
            
            // Si pas de processus existant, en créer un nouveau
            if (bpmnProcess == null) {
                log.info("Création d'un nouveau processus");
                // Générer une clé de processus unique si pas déjà définie
                if (processKey == null || processKey.trim().isEmpty()) {
                    processKey = "process_" + UUID.randomUUID().toString().replace("-", "").substring(0, 8);
                    try {
                        // Utiliser notre méthode setProcessKey qui gère correctement le namespace
                        BpmnXmlHelper.setProcessKey(process, processKey);
                        log.info("Attribut processKey défini avec succès: {}", processKey);
                    } catch (Exception e) {
                        log.error("Erreur lors de la définition de l'attribut processKey: {}", e.getMessage());
                        // Continuer sans définir l'attribut - on garde la valeur pour la BD
                    }
                }
                
                bpmnProcess = new BpmnProcess();
                bpmnProcess.setProcessKey(processKey);
                bpmnProcess.setCreatedAt(LocalDateTime.now());
                bpmnProcess.setVersion(1);
                bpmnProcess.setDeploymentId(""); // Initialiser avec une valeur vide
                bpmnProcess.setProcessDefinitionId(""); // Initialiser avec une valeur vide
            } else {
                log.info("Mise à jour du processus existant: {}, version actuelle: {}", 
                         bpmnProcess.getProcessKey(), bpmnProcess.getVersion());
                // Incrémenter la version
                bpmnProcess.setVersion(bpmnProcess.getVersion() + 1);
            }
            
            // Mettre à jour les propriétés
            bpmnProcess.setName(name);
            bpmnProcess.setCategory(category);
            bpmnProcess.setDescription(description);
            bpmnProcess.setBpmnXml(bpmnXml);
            bpmnProcess.setLastModifiedAt(LocalDateTime.now());
            
            // Sauvegarder en base de données
            log.info("Sauvegarde du processus en base de données");
            BpmnProcess savedProcess = bpmnProcessRepository.save(bpmnProcess);
            
            try {
                // Déployer le processus
                log.info("Déploiement du processus dans Camunda");
                Deployment deployment = repositoryService.createDeployment()
                        .addModelInstance(processId + ".bpmn", modelInstance)
                        .name(name)
                        .source("bpmn-designer")
                        .deploy();
                
                // Récupérer la définition du processus déployé
                log.info("Récupération de la définition du processus déployé");
                ProcessDefinition processDefinition = repositoryService.createProcessDefinitionQuery()
                        .deploymentId(deployment.getId())
                        .singleResult();
                
                log.info("Déploiement réussi: deploymentId={}, processDefinitionId={}", 
                         deployment.getId(), processDefinition.getId());
                
                // Mettre à jour avec les IDs Camunda
                savedProcess.setDeploymentId(deployment.getId());
                savedProcess.setProcessDefinitionId(processDefinition.getId());
                savedProcess = bpmnProcessRepository.save(savedProcess);
            } catch (Exception e) {
                log.error("Erreur lors du déploiement Camunda", e);
                // Ne pas faire échouer l'opération si seul le déploiement échoue
                // Le processus est toujours sauvegardé en base
                log.warn("Le processus a été sauvegardé en base mais pas déployé dans Camunda");
                
                // Si l'erreur est liée au format XML, sauvegardons le XML problématique dans un fichier de log
                try {
                    // Utiliser java.text.SimpleDateFormat avec l'import correct
                    String timestamp = new java.text.SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
                    String filename = "error_bpmn_" + timestamp + ".xml";
                    java.nio.file.Files.write(
                        java.nio.file.Paths.get(System.getProperty("java.io.tmpdir"), filename),
                        bpmnXml.getBytes()
                    );
                    log.info("XML problématique sauvegardé dans: {}", 
                             System.getProperty("java.io.tmpdir") + java.io.File.separator + filename);
                } catch (Exception logError) {
                    log.error("Impossible de sauvegarder le XML problématique", logError);
                }
            }
            
            return savedProcess;
        } catch (Exception e) {
            log.error("Erreur lors de la sauvegarde et du déploiement du modèle BPMN", e);
            throw new RuntimeException("Échec de l'opération: " + e.getMessage(), e);
        }
    }
    
    /**
     * Extrait et sauvegarde les configurations des tâches du modèle BPMN
     * @param modelInstance Le modèle BPMN
     * @param bpmnProcess Le processus associé
     */
    private void extractAndSaveTaskConfigurations(BpmnModelInstance modelInstance, BpmnProcess bpmnProcess) {
        // Extraire les userTasks
        Collection<UserTask> userTasks = modelInstance.getModelElementsByType(UserTask.class);
        for (UserTask userTask : userTasks) {
            UserTaskForm userTaskForm = UserTaskForm.builder()
                    .taskId(userTask.getId())
                    .taskName(userTask.getName())
                    .process(bpmnProcess)
                    .assignee(userTask.getCamundaAssignee())
                    .candidateGroups(userTask.getCamundaCandidateGroups())
                    .candidateUsers(userTask.getCamundaCandidateUsers())
                    .build();
            
            userTaskFormRepository.save(userTaskForm);
        }
        
        // Extraire les serviceTasks
        Collection<ServiceTask> serviceTasks = modelInstance.getModelElementsByType(ServiceTask.class);
        for (ServiceTask serviceTask : serviceTasks) {
            ServiceTaskConfig serviceTaskConfig = ServiceTaskConfig.builder()
                    .taskId(serviceTask.getId())
                    .taskName(serviceTask.getName())
                    .process(bpmnProcess)
                    .implementation(serviceTask.getCamundaClass())
                    .implementationType("class") // ou "delegateExpression", "expression" selon le cas
                    .asyncBefore(serviceTask.isCamundaAsyncBefore())
                    .asyncAfter(serviceTask.isCamundaAsyncAfter())
                    .exclusive(serviceTask.isCamundaExclusive())
                    .build();
            
            serviceTaskConfigRepository.save(serviceTaskConfig);
        }
        
        // Extraire les gateways (exclusiveGateway, inclusiveGateway, parallelGateway)
        Collection<ExclusiveGateway> exclusiveGateways = modelInstance.getModelElementsByType(ExclusiveGateway.class);
        for (ExclusiveGateway gateway : exclusiveGateways) {
            GatewayConfig gatewayConfig = GatewayConfig.builder()
                    .gatewayId(gateway.getId())
                    .gatewayName(gateway.getName())
                    .gatewayType("exclusive")
                    .process(bpmnProcess)
                    .defaultFlow(gateway.getDefault() != null ? gateway.getDefault().getId() : null)
                    .build();
            
            gatewayConfigRepository.save(gatewayConfig);
        }
        
        // Répéter pour les autres types de gateways...
    }
    
    /**
     * Charge un modèle BPMN à partir d'une chaîne XML
     * @param bpmnXml Le XML BPMN
     * @return Le modèle BPMN chargé
     */
    public BpmnModelInstance loadBpmnModel(String bpmnXml) {
        try {
            log.info("Chargement du modèle BPMN à partir d'une chaîne XML de taille: {} caractères", bpmnXml.length());
            // Vérifier que le XML n'est pas vide
            if (bpmnXml == null || bpmnXml.trim().isEmpty()) {
                throw new IllegalArgumentException("Le XML BPMN est vide ou nul");
            }
            
            // Vérifier la présence d'éléments de base BPMN
            if (!bpmnXml.contains("<bpmn:") && !bpmnXml.contains("<bpmn2:") && !bpmnXml.contains("<semantic:")) {
                log.warn("Le XML ne semble pas contenir d'éléments BPMN standard, tentative de correction");
                // Si le XML ne contient pas les namespaces BPMN, utilisons un modèle par défaut
                bpmnXml = getDefaultBpmnXml();
            }
            
            // Si le XML commence par <?xml, c'est bon, sinon, ajoutons la déclaration
            if (!bpmnXml.trim().startsWith("<?xml")) {
                log.warn("Ajout de la déclaration XML manquante");
                bpmnXml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" + bpmnXml;
            }
            
            log.debug("XML à charger: {}", bpmnXml);
            
            // Charger le modèle
            return Bpmn.readModelFromStream(new ByteArrayInputStream(bpmnXml.getBytes()));
        } catch (Exception e) {
            log.error("Erreur lors du chargement du modèle BPMN", e);
            // En cas d'erreur, créer un modèle par défaut
            log.info("Création d'un modèle BPMN par défaut en raison de l'erreur");
            return Bpmn.readModelFromStream(new ByteArrayInputStream(getDefaultBpmnXml().getBytes()));
        }
    }
    
    /**
     * Fournit un XML BPMN minimal par défaut
     * @return XML BPMN par défaut
     */
    private String getDefaultBpmnXml() {
        return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
               "<bpmn:definitions xmlns:bpmn=\"http://www.omg.org/spec/BPMN/20100524/MODEL\" " +
               "xmlns:bpmndi=\"http://www.omg.org/spec/BPMN/20100524/DI\" " +
               "xmlns:dc=\"http://www.omg.org/spec/DD/20100524/DC\" " +
               "xmlns:di=\"http://www.omg.org/spec/DD/20100524/DI\" " +
               "id=\"Definitions_" + UUID.randomUUID().toString().replace("-", "").substring(0, 8) + "\" " +
               "targetNamespace=\"http://bpmn.io/schema/bpmn\">\n" +
               "  <bpmn:process id=\"Process_" + UUID.randomUUID().toString().replace("-", "").substring(0, 8) + "\" isExecutable=\"true\">\n" +
               "    <bpmn:startEvent id=\"StartEvent_1\" name=\"Début\">\n" +
               "      <bpmn:outgoing>Flow_1</bpmn:outgoing>\n" +
               "    </bpmn:startEvent>\n" +
               "    <bpmn:endEvent id=\"EndEvent_1\" name=\"Fin\">\n" +
               "      <bpmn:incoming>Flow_1</bpmn:incoming>\n" +
               "    </bpmn:endEvent>\n" +
               "    <bpmn:sequenceFlow id=\"Flow_1\" sourceRef=\"StartEvent_1\" targetRef=\"EndEvent_1\" />\n" +
               "  </bpmn:process>\n" +
               "  <bpmndi:BPMNDiagram id=\"BPMNDiagram_1\">\n" +
               "    <bpmndi:BPMNPlane id=\"BPMNPlane_1\" bpmnElement=\"Process_" + UUID.randomUUID().toString().replace("-", "").substring(0, 8) + "\">\n" +
               "      <bpmndi:BPMNShape id=\"_BPMNShape_StartEvent_1\" bpmnElement=\"StartEvent_1\">\n" +
               "        <dc:Bounds x=\"179\" y=\"79\" width=\"36\" height=\"36\" />\n" +
               "        <bpmndi:BPMNLabel>\n" +
               "          <dc:Bounds x=\"182\" y=\"122\" width=\"31\" height=\"14\" />\n" +
               "        </bpmndi:BPMNLabel>\n" +
               "      </bpmndi:BPMNShape>\n" +
               "      <bpmndi:BPMNShape id=\"_BPMNShape_EndEvent_1\" bpmnElement=\"EndEvent_1\">\n" +
               "        <dc:Bounds x=\"432\" y=\"79\" width=\"36\" height=\"36\" />\n" +
               "        <bpmndi:BPMNLabel>\n" +
               "          <dc:Bounds x=\"440\" y=\"122\" width=\"19\" height=\"14\" />\n" +
               "        </bpmndi:BPMNLabel>\n" +
               "      </bpmndi:BPMNShape>\n" +
               "      <bpmndi:BPMNEdge id=\"Flow_1_di\" bpmnElement=\"Flow_1\">\n" +
               "        <di:waypoint x=\"215\" y=\"97\" />\n" +
               "        <di:waypoint x=\"432\" y=\"97\" />\n" +
               "      </bpmndi:BPMNEdge>\n" +
               "    </bpmndi:BPMNPlane>\n" +
               "  </bpmndi:BPMNDiagram>\n" +
               "</bpmn:definitions>";
    }
    
    /**
     * Récupère un processus par son ID
     * @param processId ID du processus
     * @return Le processus récupéré
     */
    public BpmnProcess getProcessById(Long processId) {
        return bpmnProcessRepository.findById(processId)
                .orElseThrow(() -> new RuntimeException("Processus non trouvé avec l'ID: " + processId));
    }
    
    /**
     * Récupère la dernière version d'un processus par sa clé
     * @param processKey Clé du processus
     * @return La dernière version du processus
     */
    public BpmnProcess getLatestProcessByKey(String processKey) {
        return bpmnProcessRepository.findLatestVersionByProcessKey(processKey)
                .orElseThrow(() -> new RuntimeException("Processus non trouvé avec la clé: " + processKey));
    }
    
    /**
     * Récupère toutes les versions d'un processus par sa clé
     * @param processKey Clé du processus
     * @return Toutes les versions du processus
     */
    public List<BpmnProcess> getAllVersionsByProcessKey(String processKey) {
        return bpmnProcessRepository.findByProcessKeyOrderByVersionDesc(processKey);
    }
    
    /**
     * Ajoute une tâche utilisateur au modèle BPMN
     * @param modelInstance Le modèle BPMN
     * @param taskId ID de la tâche
     * @param taskName Nom de la tâche
     * @param sourceId ID de l'élément source
     * @param targetId ID de l'élément cible (null si nouvel élément)
     * @return Le modèle BPMN modifié
     */
    public BpmnModelInstance addUserTask(BpmnModelInstance modelInstance, String taskId, String taskName, 
                                       String sourceId, String targetId) {
        // Récupérer le processus
        Process process = modelInstance.getModelElementsByType(Process.class).iterator().next();
        
        // Créer la tâche utilisateur
        UserTask userTask = modelInstance.newInstance(UserTask.class);
        userTask.setId(taskId);
        userTask.setName(taskName);
        process.addChildElement(userTask);
        
        // Récupérer l'élément source
        FlowNode source = modelInstance.getModelElementById(sourceId);
        
        // Créer un flux entre la source et la tâche
        SequenceFlow flowToTask = modelInstance.newInstance(SequenceFlow.class);
        flowToTask.setId("flow_" + sourceId + "_" + taskId);
        flowToTask.setSource(source);
        flowToTask.setTarget(userTask);
        process.addChildElement(flowToTask);
        
        // Si un élément cible est spécifié, connecter la tâche à cet élément
        if (targetId != null) {
            FlowNode target = modelInstance.getModelElementById(targetId);
            
            SequenceFlow flowFromTask = modelInstance.newInstance(SequenceFlow.class);
            flowFromTask.setId("flow_" + taskId + "_" + targetId);
            flowFromTask.setSource(userTask);
            flowFromTask.setTarget(target);
            process.addChildElement(flowFromTask);
        }
        
        return modelInstance;
    }
    
    /**
     * Ajoute une tâche de service au modèle BPMN
     * @param modelInstance Le modèle BPMN
     * @param taskId ID de la tâche
     * @param taskName Nom de la tâche
     * @param implementation Implémentation (classe, expression, etc.)
     * @param sourceId ID de l'élément source
     * @param targetId ID de l'élément cible (null si nouvel élément)
     * @return Le modèle BPMN modifié
     */
    public BpmnModelInstance addServiceTask(BpmnModelInstance modelInstance, String taskId, String taskName, 
                                          String implementation, String sourceId, String targetId) {
        // Récupérer le processus
        Process process = modelInstance.getModelElementsByType(Process.class).iterator().next();
        
        // Créer la tâche de service
        ServiceTask serviceTask = modelInstance.newInstance(ServiceTask.class);
        serviceTask.setId(taskId);
        serviceTask.setName(taskName);
        serviceTask.setCamundaClass(implementation);
        process.addChildElement(serviceTask);
        
        // Récupérer l'élément source
        FlowNode source = modelInstance.getModelElementById(sourceId);
        
        // Créer un flux entre la source et la tâche
        SequenceFlow flowToTask = modelInstance.newInstance(SequenceFlow.class);
        flowToTask.setId("flow_" + sourceId + "_" + taskId);
        flowToTask.setSource(source);
        flowToTask.setTarget(serviceTask);
        process.addChildElement(flowToTask);
        
        // Si un élément cible est spécifié, connecter la tâche à cet élément
        if (targetId != null) {
            FlowNode target = modelInstance.getModelElementById(targetId);
            
            SequenceFlow flowFromTask = modelInstance.newInstance(SequenceFlow.class);
            flowFromTask.setId("flow_" + taskId + "_" + targetId);
            flowFromTask.setSource(serviceTask);
            flowFromTask.setTarget(target);
            process.addChildElement(flowFromTask);
        }
        
        return modelInstance;
    }
    
    /**
     * Ajoute une gateway exclusive au modèle BPMN
     * @param modelInstance Le modèle BPMN
     * @param gatewayId ID de la gateway
     * @param gatewayName Nom de la gateway
     * @param sourceId ID de l'élément source
     * @param targetIds Liste des IDs des éléments cibles
     * @param conditions Liste des conditions pour chaque flux (peut être null)
     * @param defaultTargetId ID de l'élément cible par défaut (peut être null)
     * @return Le modèle BPMN modifié
     */
    public BpmnModelInstance addExclusiveGateway(BpmnModelInstance modelInstance, String gatewayId, String gatewayName, 
                                               String sourceId, List<String> targetIds, List<String> conditions, 
                                               String defaultTargetId) {
        // Récupérer le processus
        Process process = modelInstance.getModelElementsByType(Process.class).iterator().next();
        
        // Créer la gateway exclusive
        ExclusiveGateway gateway = modelInstance.newInstance(ExclusiveGateway.class);
        gateway.setId(gatewayId);
        gateway.setName(gatewayName);
        process.addChildElement(gateway);
        
        // Récupérer l'élément source
        FlowNode source = modelInstance.getModelElementById(sourceId);
        
        // Créer un flux entre la source et la gateway
        SequenceFlow flowToGateway = modelInstance.newInstance(SequenceFlow.class);
        flowToGateway.setId("flow_" + sourceId + "_" + gatewayId);
        flowToGateway.setSource(source);
        flowToGateway.setTarget(gateway);
        process.addChildElement(flowToGateway);
        
        // Pour chaque cible, créer un flux sortant
        for (int i = 0; i < targetIds.size(); i++) {
            String targetId = targetIds.get(i);
            FlowNode target = modelInstance.getModelElementById(targetId);
            
            SequenceFlow flowFromGateway = modelInstance.newInstance(SequenceFlow.class);
            flowFromGateway.setId("flow_" + gatewayId + "_" + targetId);
            flowFromGateway.setSource(gateway);
            flowFromGateway.setTarget(target);
            
            // Si des conditions sont spécifiées, ajouter la condition
            if (conditions != null && i < conditions.size() && conditions.get(i) != null) {
                ConditionExpression conditionExpression = modelInstance.newInstance(ConditionExpression.class);
                conditionExpression.setTextContent(conditions.get(i));
                flowFromGateway.setConditionExpression(conditionExpression);
            }
            
            // Si c'est le flux par défaut
            if (defaultTargetId != null && defaultTargetId.equals(targetId)) {
                gateway.setDefault(flowFromGateway);
            }
            
            process.addChildElement(flowFromGateway);
        }
        
        return modelInstance;
    }
    
    /**
     * Configure une tâche utilisateur dans le modèle BPMN
     * @param modelInstance Le modèle BPMN
     * @param taskId ID de la tâche
     * @param assignee Assigné
     * @param candidateGroups Groupes candidats
     * @param candidateUsers Utilisateurs candidats
     * @param formKey Clé du formulaire
     * @return Le modèle BPMN modifié
     */
    public BpmnModelInstance configureUserTask(BpmnModelInstance modelInstance, String taskId, String assignee,
                                             String candidateGroups, String candidateUsers, String formKey) {
        // Récupérer la tâche utilisateur
        UserTask userTask = modelInstance.getModelElementById(taskId);
        
        if (userTask != null) {
            if (assignee != null && !assignee.isEmpty()) {
                userTask.setCamundaAssignee(assignee);
            }
            
            if (candidateGroups != null && !candidateGroups.isEmpty()) {
                userTask.setCamundaCandidateGroups(candidateGroups);
            }
            
            if (candidateUsers != null && !candidateUsers.isEmpty()) {
                userTask.setCamundaCandidateUsers(candidateUsers);
            }
            
            if (formKey != null && !formKey.isEmpty()) {
                userTask.setCamundaFormKey(formKey);
            }
        }
        
        return modelInstance;
    }
    
    /**
     * Configure une tâche de service dans le modèle BPMN
     * @param modelInstance Le modèle BPMN
     * @param taskId ID de la tâche
     * @param implementation Implémentation (classe, expression, etc.)
     * @param asyncBefore Asynchrone avant
     * @param asyncAfter Asynchrone après
     * @param exclusive Exclusif
     * @return Le modèle BPMN modifié
     */
    public BpmnModelInstance configureServiceTask(BpmnModelInstance modelInstance, String taskId, String implementation,
                                               Boolean asyncBefore, Boolean asyncAfter, Boolean exclusive) {
        // Récupérer la tâche de service
        ServiceTask serviceTask = modelInstance.getModelElementById(taskId);
        
        if (serviceTask != null) {
            if (implementation != null && !implementation.isEmpty()) {
                serviceTask.setCamundaClass(implementation);
            }
            
            if (asyncBefore != null) {
                serviceTask.setCamundaAsyncBefore(asyncBefore);
            }
            
            if (asyncAfter != null) {
                serviceTask.setCamundaAsyncAfter(asyncAfter);
            }
            
            if (exclusive != null) {
                serviceTask.setCamundaExclusive(exclusive);
            }
        }
        
        return modelInstance;
    }
    
    /**
     * Supprime un élément du modèle BPMN
     * @param modelInstance Le modèle BPMN
     * @param elementId ID de l'élément à supprimer
     * @return Le modèle BPMN modifié
     */
    public BpmnModelInstance removeElement(BpmnModelInstance modelInstance, String elementId) {
        // Récupérer l'élément à supprimer
        ModelElementInstance element = modelInstance.getModelElementById(elementId);
        
        if (element != null && element instanceof FlowNode) {
            FlowNode flowNode = (FlowNode) element;
            
            // Récupérer les flux entrants et sortants
            Collection<SequenceFlow> incoming = flowNode.getIncoming();
            Collection<SequenceFlow> outgoing = flowNode.getOutgoing();
            
            // Supprimer les flux entrants et sortants
            for (SequenceFlow flow : new ArrayList<>(incoming)) {
                flow.getParentElement().removeChildElement(flow);
            }
            
            for (SequenceFlow flow : new ArrayList<>(outgoing)) {
                flow.getParentElement().removeChildElement(flow);
            }
            
            // Supprimer l'élément lui-même
            flowNode.getParentElement().removeChildElement(flowNode);
        }
        
        return modelInstance;
    }

    /**
     * Récupère tous les processus actifs
     * @return Liste des processus actifs
     */
    public List<BpmnProcess> getAllActiveProcesses() {
        return bpmnProcessRepository.findByIsActiveTrue();
    }

    /**
     * Sauvegarde la configuration du formulaire d'une tâche utilisateur
     * @param process Le processus BPMN
     * @param taskId L'ID de la tâche utilisateur
     * @param request La requête de configuration
     */
    @Transactional
    public void saveUserTaskFormConfiguration(BpmnProcess process, String taskId, UserTaskConfigRequest request) {
        // Rechercher une configuration existante
        Optional<UserTaskForm> existingFormOpt = userTaskFormRepository.findByProcessAndTaskId(process, taskId).stream()
                .findFirst();
        
        if (existingFormOpt.isPresent()) {
            // Mettre à jour la configuration existante
            UserTaskForm existingForm = existingFormOpt.get();
            existingForm.setAssignee(request.getAssignee());
            existingForm.setCandidateGroups(request.getCandidateGroups());
            existingForm.setCandidateUsers(request.getCandidateUsers());
            // setFormKey n'existe pas dans l'entité UserTaskForm, nous utilisons donc une autre approche
            // Si vous avez besoin d'ajouter formKey, ajoutez-le à l'entité UserTaskForm
            existingForm.setDueDate(request.getDueDate());
            existingForm.setFollowUpDate(request.getFollowUpDate());
            existingForm.setPriority(request.getPriority());
            existingForm.setFormDefinition(request.getFormDefinition());
            userTaskFormRepository.save(existingForm);
        } else {
            // Créer une nouvelle configuration
            UserTaskForm newForm = UserTaskForm.builder()
                    .process(process)
                    .taskId(taskId)
                    .taskName(taskId) // Comme taskName n'est pas disponible dans la requête, nous utilisons taskId
                    .assignee(request.getAssignee())
                    .candidateGroups(request.getCandidateGroups())
                    .candidateUsers(request.getCandidateUsers())
                    .dueDate(request.getDueDate())
                    .followUpDate(request.getFollowUpDate())
                    .priority(request.getPriority())
                    .formDefinition(request.getFormDefinition())
                    .build();
            userTaskFormRepository.save(newForm);
        }
    }

    /**
     * Sauvegarde la configuration d'une tâche de service
     * @param process Le processus BPMN
     * @param taskId L'ID de la tâche de service
     * @param request La requête de configuration
     */
    @Transactional
    public void saveServiceTaskConfiguration(BpmnProcess process, String taskId, ServiceTaskConfigRequest request) {
        // Rechercher une configuration existante
        Optional<ServiceTaskConfig> existingConfigOpt = serviceTaskConfigRepository.findByProcessAndTaskId(process, taskId).stream()
                .findFirst();
        
        if (existingConfigOpt.isPresent()) {
            // Mettre à jour la configuration existante
            ServiceTaskConfig existingConfig = existingConfigOpt.get();
            existingConfig.setImplementation(request.getImplementation());
            existingConfig.setImplementationType(request.getImplementationType());
            existingConfig.setInputParameters(request.getInputParameters());
            existingConfig.setOutputParameters(request.getOutputParameters());
            existingConfig.setRetries(request.getRetries());
            existingConfig.setRetryTimeout(request.getRetryTimeout());
            existingConfig.setAsyncBefore(request.getAsyncBefore());
            existingConfig.setAsyncAfter(request.getAsyncAfter());
            existingConfig.setExclusive(request.getExclusive());
            serviceTaskConfigRepository.save(existingConfig);
        } else {
            // Créer une nouvelle configuration
            ServiceTaskConfig newConfig = ServiceTaskConfig.builder()
                    .process(process)
                    .taskId(taskId)
                    .taskName(taskId) // Comme taskName n'est pas disponible dans la requête, nous utilisons taskId
                    .implementation(request.getImplementation())
                    .implementationType(request.getImplementationType())
                    .inputParameters(request.getInputParameters())
                    .outputParameters(request.getOutputParameters())
                    .retries(request.getRetries())
                    .retryTimeout(request.getRetryTimeout())
                    .asyncBefore(request.getAsyncBefore())
                    .asyncAfter(request.getAsyncAfter())
                    .exclusive(request.getExclusive())
                    .build();
            serviceTaskConfigRepository.save(newConfig);
        }
    }

    /**
     * Récupère les tâches utilisateur d'un processus
     * @param processId ID du processus
     * @return Liste des tâches utilisateur
     */
    public List<UserTaskDTO> getUserTasksByProcessId(Long processId) {
        // D'abord, récupérer le processus
        BpmnProcess process = bpmnProcessRepository.findById(processId)
                .orElseThrow(() -> new RuntimeException("Processus non trouvé avec l'ID: " + processId));
        
        // Ensuite, récupérer les tâches utilisateur pour ce processus
        List<UserTaskForm> userTaskForms = userTaskFormRepository.findByProcess(process);
        
        return userTaskForms.stream().map(form -> 
            UserTaskDTO.builder()
                .id(form.getId())
                .taskId(form.getTaskId())
                .taskName(form.getTaskName())
                .assignee(form.getAssignee())
                .candidateGroups(form.getCandidateGroups())
                .candidateUsers(form.getCandidateUsers())
                .dueDate(form.getDueDate())
                .followUpDate(form.getFollowUpDate())
                .priority(form.getPriority())
                .formDefinition(form.getFormDefinition())
                .createdAt(form.getCreatedAt())
                .lastModifiedAt(form.getLastModifiedAt())
                .build()
        ).collect(Collectors.toList());
    }

    /**
     * Récupère les tâches de service d'un processus
     * @param processId ID du processus
     * @return Liste des tâches de service
     */
    public List<ServiceTaskDTO> getServiceTasksByProcessId(Long processId) {
        // D'abord, récupérer le processus
        BpmnProcess process = bpmnProcessRepository.findById(processId)
                .orElseThrow(() -> new RuntimeException("Processus non trouvé avec l'ID: " + processId));
        
        // Ensuite, récupérer les tâches de service pour ce processus
        List<ServiceTaskConfig> serviceTasks = serviceTaskConfigRepository.findByProcess(process);
        
        return serviceTasks.stream().map(task -> 
            ServiceTaskDTO.builder()
                .id(task.getId())
                .taskId(task.getTaskId())
                .taskName(task.getTaskName())
                .implementation(task.getImplementation())
                .implementationType(task.getImplementationType())
                .inputParameters(task.getInputParameters())
                .outputParameters(task.getOutputParameters())
                .retries(task.getRetries())
                .retryTimeout(task.getRetryTimeout())
                .asyncBefore(task.getAsyncBefore())
                .asyncAfter(task.getAsyncAfter())
                .exclusive(task.getExclusive())
                .createdAt(task.getCreatedAt())
                .lastModifiedAt(task.getLastModifiedAt())
                .build()
        ).collect(Collectors.toList());
    }

    /**
     * Récupère les gateways d'un processus
     * @param processId ID du processus
     * @return Liste des gateways
     */
    public List<GatewayDTO> getGatewaysByProcessId(Long processId) {
        // D'abord, récupérer le processus
        BpmnProcess process = bpmnProcessRepository.findById(processId)
                .orElseThrow(() -> new RuntimeException("Processus non trouvé avec l'ID: " + processId));
        
        // Ensuite, récupérer les passerelles pour ce processus
        List<GatewayConfig> gateways = gatewayConfigRepository.findByProcess(process);
        
        return gateways.stream().map(gateway -> 
            GatewayDTO.builder()
                .id(gateway.getId())
                .gatewayId(gateway.getGatewayId())
                .gatewayName(gateway.getGatewayName())
                .gatewayType(gateway.getGatewayType())
                .defaultFlow(gateway.getDefaultFlow())
                .conditions(gateway.getConditions())
                .createdAt(gateway.getCreatedAt())
                .lastModifiedAt(gateway.getLastModifiedAt())
                .build()
        ).collect(Collectors.toList());
    }
    
    private void addBpmnDiagram(BpmnModelInstance modelInstance, Process process, StartEvent startEvent, EndEvent endEvent, SequenceFlow flow) {
        // Créer le diagramme BPMN (représentation visuelle)
        BpmnDiagram diagram = modelInstance.newInstance(BpmnDiagram.class);
        modelInstance.getDefinitions().addChildElement(diagram);
        diagram.setId("BPMNDiagram_1");
        
        BpmnPlane plane = modelInstance.newInstance(BpmnPlane.class);
        diagram.addChildElement(plane);
        plane.setId("BPMNPlane_1");
        plane.setBpmnElement(process);
        
        // Ajouter les formes graphiques pour chaque élément
        // StartEvent shape
        BpmnShape startEventShape = modelInstance.newInstance(BpmnShape.class);
        plane.addChildElement(startEventShape);
        startEventShape.setId("_BPMNShape_StartEvent_1");
        startEventShape.setBpmnElement(startEvent);
        
        Bounds startEventBounds = modelInstance.newInstance(Bounds.class);
        startEventShape.addChildElement(startEventBounds);
        startEventBounds.setX(180);
        startEventBounds.setY(100);
        startEventBounds.setWidth(36);
        startEventBounds.setHeight(36);
        
        // EndEvent shape
        BpmnShape endEventShape = modelInstance.newInstance(BpmnShape.class);
        plane.addChildElement(endEventShape);
        endEventShape.setId("_BPMNShape_EndEvent_1");
        endEventShape.setBpmnElement(endEvent);
        
        Bounds endEventBounds = modelInstance.newInstance(Bounds.class);
        endEventShape.addChildElement(endEventBounds);
        endEventBounds.setX(430);
        endEventBounds.setY(100);
        endEventBounds.setWidth(36);
        endEventBounds.setHeight(36);
        
        // SequenceFlow edge
        BpmnEdge flowEdge = modelInstance.newInstance(BpmnEdge.class);
        plane.addChildElement(flowEdge);
        flowEdge.setId("Flow_1_di");
        flowEdge.setBpmnElement(flow);
        
        // Waypoints pour flow
        Waypoint flowWaypoint1 = modelInstance.newInstance(Waypoint.class);
        flowEdge.addChildElement(flowWaypoint1);
        flowWaypoint1.setX(216);
        flowWaypoint1.setY(118);
        
        Waypoint flowWaypoint2 = modelInstance.newInstance(Waypoint.class);
        flowEdge.addChildElement(flowWaypoint2);
        flowWaypoint2.setX(430);
        flowWaypoint2.setY(118);
    }
}
