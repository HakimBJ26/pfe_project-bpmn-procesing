package com.safalifter.jobservice.service;

import com.safalifter.jobservice.dto.DmnDefinitionDto;
import com.safalifter.jobservice.dto.DmnDeploymentResponseDto;
import com.safalifter.jobservice.dto.DmnRequestDto;
import com.safalifter.jobservice.dto.DmnXmlUpdateDto;
import com.safalifter.jobservice.model.DmnDefinition;
import com.safalifter.jobservice.repository.DmnDefinitionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.dmn.engine.DmnEngine;
import org.camunda.bpm.dmn.engine.DmnEngineConfiguration;
import org.camunda.bpm.engine.RepositoryService;
import org.camunda.bpm.engine.repository.Deployment;
import org.camunda.bpm.engine.repository.DeploymentBuilder;
import org.camunda.bpm.model.dmn.Dmn;
import org.camunda.bpm.model.dmn.DmnModelInstance;
import org.camunda.bpm.model.dmn.HitPolicy;
import org.camunda.bpm.model.dmn.instance.Decision;
import org.camunda.bpm.model.dmn.instance.DecisionTable;
import org.camunda.bpm.model.dmn.instance.Definitions;
import org.camunda.bpm.model.dmn.instance.Input;
import org.camunda.bpm.model.dmn.instance.InputEntry;
import org.camunda.bpm.model.dmn.instance.InputExpression;
import org.camunda.bpm.model.dmn.instance.Output;
import org.camunda.bpm.model.dmn.instance.OutputEntry;
import org.camunda.bpm.model.dmn.instance.Rule;
import org.camunda.bpm.model.dmn.instance.Text;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.persistence.EntityNotFoundException;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DmnService {

    private final DmnDefinitionRepository dmnDefinitionRepository;
    private final RepositoryService repositoryService;

    /**
     * Crée un nouveau modèle DMN vide avec un exemple de table de décision
     * Cette méthode évite les problèmes de référence de modèle en:
     * 1. Créant tous les éléments et les ajoutant au modèle initial
     * 2. Puis convertissant en XML et reconvertissant en modèle si nécessaire
     */
    public DmnModelInstance createEmptyDmnModel(String decisionId, String decisionName) {
        log.info("Création d'un modèle DMN vide pour la décision: {}", decisionName);
        
        try {
            // Créer un modèle DMN vide avec tous les namespaces nécessaires
            DmnModelInstance modelInstance = Dmn.createEmptyModel();
            Definitions definitions = modelInstance.newInstance(Definitions.class);
            
            definitions.setId("Definitions_" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
            definitions.setName("DMN Definition");
            definitions.setNamespace("http://camunda.org/schema/1.0/dmn");
            
            // Ajouter les namespaces requis
            definitions.setAttributeValueNs("http://www.w3.org/2000/xmlns/", "xmlns", "https://www.omg.org/spec/DMN/20191111/MODEL/");
            definitions.setAttributeValueNs("http://www.w3.org/2000/xmlns/", "xmlns:dmndi", "https://www.omg.org/spec/DMN/20191111/DMNDI/");
            definitions.setAttributeValueNs("http://www.w3.org/2000/xmlns/", "xmlns:dc", "http://www.omg.org/spec/DMN/20180521/DC/");
            definitions.setAttributeValueNs("http://www.w3.org/2000/xmlns/", "xmlns:camunda", "http://camunda.org/schema/1.0/dmn");
            
            modelInstance.setDefinitions(definitions);
            
            // Créer une décision
            Decision decision = modelInstance.newInstance(Decision.class);
            decision.setId(decisionId);
            decision.setName(decisionName);
            definitions.addChildElement(decision);
            
            // Créer une table de décision
            DecisionTable decisionTable = modelInstance.newInstance(DecisionTable.class);
            decisionTable.setId("decisionTable_" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
            decisionTable.setHitPolicy(HitPolicy.FIRST);
            decision.addChildElement(decisionTable);
            
            // Créer une entrée (input)
            Input input = modelInstance.newInstance(Input.class);
            input.setId("input_1");
            
            InputExpression inputExpression = modelInstance.newInstance(InputExpression.class);
            inputExpression.setId("inputExpression_1");
            inputExpression.setTypeRef("string");
            
            Text text = modelInstance.newInstance(Text.class);
            text.setTextContent("input1");
            
            inputExpression.setText(text);
            input.setInputExpression(inputExpression);
            decisionTable.getInputs().add(input);  // Utiliser getInputs().add() au lieu de addInput
            
            // Créer une sortie (output)
            Output output = modelInstance.newInstance(Output.class);
            output.setId("output_1");
            output.setTypeRef("string");
            decisionTable.getOutputs().add(output);  // Utiliser getOutputs().add() au lieu de addOutput
            
            // Créer une règle exemple
            Rule rule = modelInstance.newInstance(Rule.class);
            rule.setId("rule_1");
            
            InputEntry inputEntry = modelInstance.newInstance(InputEntry.class);
            inputEntry.setId("inputEntry_1");
            Text inputEntryText = modelInstance.newInstance(Text.class);
            inputEntryText.setTextContent("\"value\"");
            inputEntry.setText(inputEntryText);
            rule.addChildElement(inputEntry);
            
            OutputEntry outputEntry = modelInstance.newInstance(OutputEntry.class);
            outputEntry.setId("outputEntry_1");
            Text outputEntryText = modelInstance.newInstance(Text.class);
            outputEntryText.setTextContent("\"result\"");
            outputEntry.setText(outputEntryText);
            rule.addChildElement(outputEntry);
            
            decisionTable.getRules().add(rule);  // Utiliser getRules().add() au lieu de addRule
            
            // Pour éviter les problèmes de référence de modèle, convertir en XML puis re-importer
            String xml = Dmn.convertToString(modelInstance);
            return Dmn.readModelFromStream(new ByteArrayInputStream(xml.getBytes(StandardCharsets.UTF_8)));
            
        } catch (Exception e) {
            log.error("Erreur lors de la création du modèle DMN vide: {}", e.getMessage(), e);
            throw new RuntimeException("Erreur lors de la création du modèle DMN: " + e.getMessage(), e);
        }
    }

    /**
     * Crée une nouvelle définition DMN vide
     */
    @Transactional
    public DmnDefinitionDto createEmptyDmn(DmnRequestDto requestDto) {
        log.info("Création d'une nouvelle définition DMN vide: {}", requestDto.getName());
        
        String decisionKey = generateDecisionKey(requestDto.getName());
        String decisionId = "Decision_" + UUID.randomUUID().toString().replace("-", "").substring(0, 8);
        
        // Utiliser la nouvelle méthode pour créer un modèle DMN correctement formé
        DmnModelInstance dmnModel = createEmptyDmnModel(decisionId, requestDto.getName());
        String xml = Dmn.convertToString(dmnModel);
        
        DmnDefinition dmnDefinition = DmnDefinition.builder()
                .name(requestDto.getName())
                .description(requestDto.getDescription())
                .category(requestDto.getCategory())
                .decisionKey(decisionId)  // Utiliser l'ID généré comme clé de décision
                .version("1")
                .deployed(false)
                .xml(xml)  // Stocker le XML complet
                .build();
                
        DmnDefinition savedDefinition = dmnDefinitionRepository.save(dmnDefinition);
        return convertToDto(savedDefinition);
    }
    
    /**
     * Récupère toutes les définitions DMN
     */
    public List<DmnDefinitionDto> getAllDmnDefinitions() {
        log.info("Récupération de toutes les définitions DMN");
        return dmnDefinitionRepository.findAll()
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Récupère une définition DMN par ID
     */
    public DmnDefinitionDto getDmnDefinitionById(String id) {
        log.info("Récupération de la définition DMN avec l'ID: {}", id);
        DmnDefinition dmnDefinition = dmnDefinitionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("DMN définition non trouvée avec l'ID: " + id));
        return convertToDto(dmnDefinition);
    }
    
    /**
     * Récupère une définition DMN par clé de décision
     */
    public DmnDefinitionDto getDmnDefinitionByKey(String decisionKey) {
        log.info("Récupération de la définition DMN avec la clé: {}", decisionKey);
        DmnDefinition dmnDefinition = dmnDefinitionRepository.findByDecisionKey(decisionKey)
                .orElseThrow(() -> new EntityNotFoundException("DMN définition non trouvée avec la clé: " + decisionKey));
        return convertToDto(dmnDefinition);
    }
    
    /**
     * Met à jour le XML d'une définition DMN
     */
    @Transactional
    public DmnDefinitionDto updateDmnXml(String id, DmnXmlUpdateDto updateDto) {
        log.info("Mise à jour du XML pour la définition DMN ID: {}", id);
        
        DmnDefinition dmnDefinition = dmnDefinitionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("DMN définition non trouvée avec l'ID: " + id));
        
        validateDmnXml(updateDto.getXml());
        
        dmnDefinition.setXml(updateDto.getXml());
        dmnDefinition.setUpdatedAt(LocalDateTime.now());
        
        DmnDefinition updatedDefinition = dmnDefinitionRepository.save(dmnDefinition);
        return convertToDto(updatedDefinition);
    }
    
    /**
     * Supprime une définition DMN
     */
    @Transactional
    public void deleteDmnDefinition(String id) {
        log.info("Suppression de la définition DMN avec l'ID: {}", id);
        
        DmnDefinition dmnDefinition = dmnDefinitionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("DMN définition non trouvée avec l'ID: " + id));
                
        dmnDefinitionRepository.delete(dmnDefinition);
    }
    
    /**
     * Déploie un fichier DMN
     */
    @Transactional
    public DmnDeploymentResponseDto deployDmnFile(MultipartFile file) throws IOException {
        log.info("Déploiement du fichier DMN: {}", file.getOriginalFilename());
        
        byte[] fileBytes = file.getBytes();
        String xmlContent = new String(fileBytes, StandardCharsets.UTF_8);
        
        // Valider le XML
        DmnModelInstance dmnModel = validateDmnXml(xmlContent);
        
        // Extraire la clé de décision et le nom
        String decisionKey = extractDecisionKey(dmnModel);
        String decisionName = extractDecisionName(dmnModel);
        
        // Incrémentation de la version
        String version = "1";
        Optional<DmnDefinition> latestVersion = dmnDefinitionRepository.findTopByDecisionKeyOrderByVersionDesc(decisionKey);
        if (latestVersion.isPresent()) {
            int versionNum = Integer.parseInt(latestVersion.get().getVersion());
            version = String.valueOf(versionNum + 1);
        }
        
        // Déployer avec Camunda
        DeploymentBuilder deploymentBuilder = repositoryService.createDeployment()
                .addString(file.getOriginalFilename() != null ? file.getOriginalFilename() : "decision.dmn", xmlContent)
                .name(decisionName);
                
        Deployment deployment = deploymentBuilder.deploy();
        
        // Sauvegarder dans la base de données
        DmnDefinition dmnDefinition = DmnDefinition.builder()
                .name(decisionName)
                .decisionKey(decisionKey)
                .xml(xmlContent)
                .deploymentId(deployment.getId())
                .version(version)
                .deployed(true)
                .deployedAt(LocalDateTime.now())
                .build();
                
        dmnDefinitionRepository.save(dmnDefinition);
        
        return DmnDeploymentResponseDto.builder()
                .deploymentId(deployment.getId())
                .decisionKey(decisionKey)
                .name(decisionName)
                .version(version)
                .message("Déploiement DMN réussi")
                .build();
    }
    
    /**
     * Évalue une décision DMN en fonction des variables d'entrée
     */
    public Map<String, Object> evaluateDecision(String decisionKey, Map<String, Object> variables) {
        log.info("Évaluation de la décision DMN avec la clé: {} et les variables: {}", decisionKey, variables);
        
        // Récupérer la dernière version déployée en utilisant la méthode qui trie par version
        DmnDefinition dmnDefinition = dmnDefinitionRepository.findTopByDecisionKeyOrderByVersionDesc(decisionKey)
                .orElseThrow(() -> new EntityNotFoundException("DMN définition non trouvée avec la clé: " + decisionKey));
                
        if (!dmnDefinition.isDeployed()) {
            throw new IllegalStateException("La décision DMN n'est pas déployée: " + decisionKey);
        }
        
        // Créer un moteur DMN pour évaluer la décision
        DmnEngine dmnEngine = DmnEngineConfiguration
                .createDefaultDmnEngineConfiguration()
                .buildEngine();
                
        DmnModelInstance dmnModelInstance = Dmn.readModelFromStream(
                new ByteArrayInputStream(dmnDefinition.getXml().getBytes(StandardCharsets.UTF_8)));
                
        // Extraire l'ID de la décision depuis le modèle au lieu d'utiliser directement la clé
        String actualDecisionId = extractDecisionKey(dmnModelInstance);
        log.info("ID de décision utilisé pour l'évaluation: {}", actualDecisionId);
        
        // Évaluer la décision avec l'ID réel de la décision dans le XML
        org.camunda.bpm.dmn.engine.DmnDecision decision = dmnEngine.parseDecision(actualDecisionId, dmnModelInstance);
        org.camunda.bpm.dmn.engine.DmnDecisionResult result = dmnEngine.evaluateDecision(decision, variables);
        
        // Convertir le résultat en Map
        Map<String, Object> resultMap = new HashMap<>();
        
        if (!result.isEmpty()) {
            // Pour chaque ligne de résultat
            for (int i = 0; i < result.size(); i++) {
                Map<String, Object> rowMap = new HashMap<>();
                org.camunda.bpm.dmn.engine.DmnDecisionResultEntries row = result.get(i);
                
                // Pour chaque colonne de résultat
                for (String outputName : row.keySet()) {
                    rowMap.put(outputName, row.get(outputName));
                }
                
                resultMap.put("result_" + i, rowMap);
            }
            
            // Ajouter aussi la première ligne comme résultat principal
            if (result.getSingleResult() != null) {
                for (String key : result.getSingleResult().keySet()) {
                    resultMap.put(key, result.getSingleResult().get(key));
                }
            }
        }
        
        // Ajouter des méta-informations
        resultMap.put("decisionKey", decisionKey);
        resultMap.put("resultCount", result.size());
        
        return resultMap;
    }
    
    /**
     * Génère une clé de décision unique à partir du nom
     */
    private String generateDecisionKey(String name) {
        String baseKey = name
                .toLowerCase()
                .replaceAll("[^a-z0-9]", "_")
                .replaceAll("_+", "_")
                .replaceAll("^_|_$", "");
                
        return baseKey + "_" + UUID.randomUUID().toString().substring(0, 8);
    }
    
    /**
     * Valide le XML DMN et retourne le modèle
     */
    private DmnModelInstance validateDmnXml(String xml) {
        try {
            ByteArrayInputStream inputStream = new ByteArrayInputStream(xml.getBytes(StandardCharsets.UTF_8));
            return Dmn.readModelFromStream(inputStream);
        } catch (Exception e) {
            log.error("Erreur de validation XML DMN: {}", e.getMessage());
            throw new IllegalArgumentException("XML DMN invalide: " + e.getMessage());
        }
    }
    
    /**
     * Extrait la clé de décision du modèle DMN
     */
    private String extractDecisionKey(DmnModelInstance dmnModelInstance) {
        Collection<Decision> decisions = dmnModelInstance.getModelElementsByType(Decision.class);
        
        if (decisions.isEmpty()) {
            throw new IllegalArgumentException("Aucune décision trouvée dans le DMN");
        }
        
        // Utiliser la première décision trouvée
        return decisions.iterator().next().getId();
    }
    
    /**
     * Extrait le nom de la décision du modèle DMN
     */
    private String extractDecisionName(DmnModelInstance dmnModelInstance) {
        Collection<Decision> decisions = dmnModelInstance.getModelElementsByType(Decision.class);
        
        if (decisions.isEmpty()) {
            throw new IllegalArgumentException("Aucune décision trouvée dans le DMN");
        }
        
        // Utiliser la première décision trouvée
        Decision decision = decisions.iterator().next();
        return decision.getName() != null ? decision.getName() : decision.getId();
    }
    
    /**
     * Convertit une entité DmnDefinition en DTO
     */
    private DmnDefinitionDto convertToDto(DmnDefinition dmnDefinition) {
        return DmnDefinitionDto.builder()
                .id(dmnDefinition.getId())
                .name(dmnDefinition.getName())
                .decisionKey(dmnDefinition.getDecisionKey())
                .description(dmnDefinition.getDescription())
                .category(dmnDefinition.getCategory())
                .version(dmnDefinition.getVersion())
                .deploymentId(dmnDefinition.getDeploymentId())
                .deployed(dmnDefinition.isDeployed())
                .createdAt(dmnDefinition.getCreatedAt())
                .updatedAt(dmnDefinition.getUpdatedAt())
                .deployedAt(dmnDefinition.getDeployedAt())
                .build();
    }
}
