package com.safalifter.jobservice.controller;

import com.safalifter.jobservice.dto.JavaDelegateDTO;
import com.safalifter.jobservice.dto.JavaDelegateRequest;
import com.safalifter.jobservice.service.JavaDelegateService;
import com.safalifter.jobservice.util.JavaDelegateTemplates;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bpmn/java-delegates")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class JavaDelegateController {

    private final JavaDelegateService javaDelegateService;

    /**
     * Récupère tous les JavaDelegates disponibles
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllJavaDelegates() {
        try {
            log.info("Récupération de tous les JavaDelegates");
            List<JavaDelegateDTO> delegates = javaDelegateService.getAllJavaDelegates();
            
            Map<String, Object> response = new HashMap<>();
            response.put("data", delegates);
            response.put("success", true);
            response.put("message", "JavaDelegates récupérés avec succès");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des JavaDelegates", e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Erreur lors de la récupération des JavaDelegates: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Récupère les modèles disponibles pour les JavaDelegates
     */
    @GetMapping("/templates")
    public ResponseEntity<Map<String, Object>> getJavaDelegateTemplates(
            @RequestParam(required = false) String packageName,
            @RequestParam(required = false, defaultValue = "MyJavaDelegate") String className) {
        try {
            log.info("Récupération des modèles de JavaDelegate");
            
            Map<String, String> templates = new HashMap<>();
            templates.put("basic", JavaDelegateTemplates.getBasicTemplate(packageName, className));
            templates.put("logger", JavaDelegateTemplates.getLoggerTemplate(packageName, className));
            templates.put("emailSender", JavaDelegateTemplates.getEmailSenderTemplate(packageName, className));
            
            Map<String, Object> response = new HashMap<>();
            response.put("data", templates);
            response.put("success", true);
            response.put("message", "Modèles de JavaDelegate récupérés avec succès");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des modèles de JavaDelegate", e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Erreur lors de la récupération des modèles de JavaDelegate: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Récupère un JavaDelegate par son nom de classe
     */
    @GetMapping("/{className}")
    public ResponseEntity<Map<String, Object>> getJavaDelegateByClassName(@PathVariable String className) {
        try {
            log.info("Récupération du JavaDelegate: {}", className);
            JavaDelegateDTO delegate = javaDelegateService.getJavaDelegateByClassName(className);
            
            Map<String, Object> response = new HashMap<>();
            response.put("data", delegate);
            response.put("success", true);
            response.put("message", "JavaDelegate récupéré avec succès");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Erreur lors de la récupération du JavaDelegate", e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Erreur lors de la récupération du JavaDelegate: " + e.getMessage());
            
            int status = e instanceof java.util.NoSuchElementException ? 
                HttpStatus.NOT_FOUND.value() : HttpStatus.INTERNAL_SERVER_ERROR.value();
            
            return ResponseEntity.status(status).body(response);
        }
    }

    /**
     * Crée un nouveau JavaDelegate
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createJavaDelegate(@RequestBody JavaDelegateRequest request) {
        try {
            log.info("Création d'un nouveau JavaDelegate: {}", request.getName());
            JavaDelegateDTO createdDelegate = javaDelegateService.createJavaDelegate(request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("data", createdDelegate);
            response.put("success", true);
            response.put("message", "JavaDelegate créé avec succès");
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("Erreur lors de la création du JavaDelegate", e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Erreur lors de la création du JavaDelegate: " + e.getMessage());
            
            int status = e instanceof IllegalArgumentException ? 
                HttpStatus.BAD_REQUEST.value() : HttpStatus.INTERNAL_SERVER_ERROR.value();
            
            return ResponseEntity.status(status).body(response);
        }
    }

    /**
     * Met à jour un JavaDelegate existant
     */
    @PutMapping("/{className}")
    public ResponseEntity<Map<String, Object>> updateJavaDelegate(
            @PathVariable String className, 
            @RequestBody JavaDelegateRequest request) {
        try {
            log.info("Mise à jour du JavaDelegate: {}", className);
            JavaDelegateDTO updatedDelegate = javaDelegateService.updateJavaDelegate(className, request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("data", updatedDelegate);
            response.put("success", true);
            response.put("message", "JavaDelegate mis à jour avec succès");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Erreur lors de la mise à jour du JavaDelegate", e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Erreur lors de la mise à jour du JavaDelegate: " + e.getMessage());
            
            int status = HttpStatus.INTERNAL_SERVER_ERROR.value();
            
            if (e instanceof java.util.NoSuchElementException) {
                status = HttpStatus.NOT_FOUND.value();
            } else if (e instanceof IllegalArgumentException) {
                status = HttpStatus.BAD_REQUEST.value();
            }
            
            return ResponseEntity.status(status).body(response);
        }
    }

    /**
     * Supprime un JavaDelegate
     */
    @DeleteMapping("/{className}")
    public ResponseEntity<Map<String, Object>> deleteJavaDelegate(@PathVariable String className) {
        try {
            log.info("Suppression du JavaDelegate: {}", className);
            javaDelegateService.deleteJavaDelegate(className);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "JavaDelegate supprimé avec succès");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Erreur lors de la suppression du JavaDelegate", e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Erreur lors de la suppression du JavaDelegate: " + e.getMessage());
            
            int status = e instanceof java.util.NoSuchElementException ? 
                HttpStatus.NOT_FOUND.value() : HttpStatus.INTERNAL_SERVER_ERROR.value();
            
            return ResponseEntity.status(status).body(response);
        }
    }
    
    /**
     * Teste un JavaDelegate
     */
    @PostMapping("/{className}/test")
    public ResponseEntity<Map<String, Object>> testJavaDelegate(
            @PathVariable String className,
            @RequestBody Map<String, Object> testData) {
        try {
            log.info("Test du JavaDelegate: {}", className);
            
            // Pour l'instant, nous simulons simplement un succès de test
            // Une implémentation réelle nécessiterait de charger et d'exécuter le délégué
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Test réussi pour le JavaDelegate: " + className);
            response.put("results", Map.of(
                "executed", true,
                "executionTime", 42, // milliseconds
                "output", "Exécution simulée réussie"
            ));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Erreur lors du test du JavaDelegate", e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Erreur lors du test du JavaDelegate: " + e.getMessage());
            
            int status = e instanceof java.util.NoSuchElementException ? 
                HttpStatus.NOT_FOUND.value() : HttpStatus.INTERNAL_SERVER_ERROR.value();
            
            return ResponseEntity.status(status).body(response);
        }
    }
}
