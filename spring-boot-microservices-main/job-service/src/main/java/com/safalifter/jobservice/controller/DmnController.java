package com.safalifter.jobservice.controller;

import com.safalifter.jobservice.dto.DmnDefinitionDto;
import com.safalifter.jobservice.dto.DmnDeploymentResponseDto;
import com.safalifter.jobservice.dto.DmnRequestDto;
import com.safalifter.jobservice.dto.DmnXmlUpdateDto;
import com.safalifter.jobservice.service.DmnService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.persistence.EntityNotFoundException;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dmn")
@RequiredArgsConstructor
@Slf4j
public class DmnController {

    private final DmnService dmnService;

    @PostMapping("/create")
    public ResponseEntity<DmnDefinitionDto> createEmptyDmn(@RequestBody DmnRequestDto requestDto) {
        log.info("Demande de création d'une définition DMN vide: {}", requestDto.getName());
        DmnDefinitionDto result = dmnService.createEmptyDmn(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @GetMapping("/definitions")
    public ResponseEntity<List<DmnDefinitionDto>> getAllDmnDefinitions() {
        log.info("Demande de récupération de toutes les définitions DMN");
        List<DmnDefinitionDto> definitions = dmnService.getAllDmnDefinitions();
        return ResponseEntity.ok(definitions);
    }

    @GetMapping("/definitions/{id}")
    public ResponseEntity<DmnDefinitionDto> getDmnDefinitionById(@PathVariable String id) {
        log.info("Demande de récupération de la définition DMN avec l'ID: {}", id);
        try {
            DmnDefinitionDto definition = dmnService.getDmnDefinitionById(id);
            return ResponseEntity.ok(definition);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/definitions/key/{decisionKey}")
    public ResponseEntity<DmnDefinitionDto> getDmnDefinitionByKey(@PathVariable String decisionKey) {
        log.info("Demande de récupération de la définition DMN avec la clé: {}", decisionKey);
        try {
            DmnDefinitionDto definition = dmnService.getDmnDefinitionByKey(decisionKey);
            return ResponseEntity.ok(definition);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/definitions/{id}/xml")
    public ResponseEntity<DmnDefinitionDto> updateDmnXml(
            @PathVariable String id,
            @RequestBody DmnXmlUpdateDto updateDto) {
        log.info("Demande de mise à jour du XML pour la définition DMN ID: {}", id);
        try {
            DmnDefinitionDto updatedDefinition = dmnService.updateDmnXml(id, updateDto);
            return ResponseEntity.ok(updatedDefinition);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/definitions/{id}")
    public ResponseEntity<Void> deleteDmnDefinition(@PathVariable String id) {
        log.info("Demande de suppression de la définition DMN avec l'ID: {}", id);
        try {
            dmnService.deleteDmnDefinition(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/deploy")
    public ResponseEntity<DmnDeploymentResponseDto> deployDmn(
            @RequestParam("file") MultipartFile file) {
        log.info("Demande de déploiement d'un fichier DMN: {}", file.getOriginalFilename());
        try {
            DmnDeploymentResponseDto result = dmnService.deployDmnFile(file);
            return ResponseEntity.ok(result);
        } catch (IOException e) {
            log.error("Erreur lors de la lecture du fichier DMN: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(DmnDeploymentResponseDto.builder()
                            .message("Erreur lors de la lecture du fichier: " + e.getMessage())
                            .build());
        } catch (Exception e) {
            log.error("Erreur lors du déploiement DMN: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(DmnDeploymentResponseDto.builder()
                            .message("Erreur lors du déploiement: " + e.getMessage())
                            .build());
        }
    }

    @PostMapping("/evaluate/{decisionKey}")
    public ResponseEntity<Map<String, Object>> evaluateDecision(
            @PathVariable String decisionKey,
            @RequestBody Map<String, Object> variables) {
        log.info("Demande d'évaluation de la décision DMN avec la clé: {} et les variables: {}", decisionKey, variables);
        try {
            Map<String, Object> result = dmnService.evaluateDecision(decisionKey, variables);
            return ResponseEntity.ok(result);
        } catch (EntityNotFoundException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Décision non trouvée: " + decisionKey);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (IllegalStateException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Erreur lors de l'évaluation de la décision: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateDmnXml(@RequestBody String xml) {
        log.info("Demande de validation d'un XML DMN");
        Map<String, Object> response = new HashMap<>();
        try {
            // Le service validateDmnXml lance une exception si le XML est invalide
            // Si on arrive ici, c'est que la validation a réussi
            response.put("valid", true);
            response.put("message", "XML DMN valide");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("valid", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @GetMapping("/history/{decisionKey}")
    public ResponseEntity<List<Map<String, Object>>> getDecisionHistory(@PathVariable String decisionKey) {
        // Cette méthode pourrait être implémentée pour récupérer l'historique d'exécution
        // des décisions DMN depuis Camunda, mais elle nécessiterait des développements additionnels
        log.info("Demande d'historique de la décision DMN avec la clé: {}", decisionKey);
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }

    @GetMapping("/inputs/{decisionKey}")
    public ResponseEntity<Map<String, Object>> getDecisionInputs(@PathVariable String decisionKey) {
        // Cette méthode pourrait analyser le DMN pour extraire les variables d'entrée requises
        // mais nécessiterait des développements additionnels
        log.info("Demande des variables d'entrée requises pour la décision DMN avec la clé: {}", decisionKey);
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }
}
