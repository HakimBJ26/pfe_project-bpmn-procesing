package com.safalifter.jobservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.camunda.bpm.engine.FormService;
import org.camunda.bpm.engine.TaskService;
import org.camunda.bpm.engine.form.FormField;
import org.camunda.bpm.engine.form.TaskFormData;
import org.camunda.bpm.engine.task.Task;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private TaskService taskService;

    @Autowired
    private FormService formService;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Récupère toutes les tâches utilisateur actives
     */
    @GetMapping
    public ResponseEntity<?> getAllTasks() {
        try {
            List<Task> tasks = taskService.createTaskQuery()
                    .active()
                    .initializeFormKeys() // Initialiser les clés de formulaire
                    .orderByTaskCreateTime()
                    .desc()
                    .list();

            List<Map<String, Object>> result = new ArrayList<>();
            for (Task task : tasks) {
                Map<String, Object> taskInfo = new HashMap<>();
                taskInfo.put("id", task.getId());
                taskInfo.put("name", task.getName());
                taskInfo.put("description", task.getDescription());
                taskInfo.put("createTime", task.getCreateTime());
                taskInfo.put("assignee", task.getAssignee());
                taskInfo.put("processInstanceId", task.getProcessInstanceId());
                taskInfo.put("processDefinitionId", task.getProcessDefinitionId());
                taskInfo.put("formKey", task.getFormKey());
                result.add(taskInfo);
            }

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Échec de la récupération des tâches: " + e.getMessage()
            ));
        }
    }

    /**
     * Récupère les détails d'une tâche spécifique
     */
    @GetMapping("/{taskId}")
    public ResponseEntity<?> getTaskById(@PathVariable String taskId) {
        try {
            Task task = taskService.createTaskQuery()
                    .taskId(taskId)
                    .initializeFormKeys() // Initialiser les clés de formulaire
                    .singleResult();

            if (task == null) {
                return ResponseEntity.notFound().build();
            }

            Map<String, Object> taskInfo = new HashMap<>();
            taskInfo.put("id", task.getId());
            taskInfo.put("name", task.getName());
            taskInfo.put("description", task.getDescription());
            taskInfo.put("createTime", task.getCreateTime());
            taskInfo.put("assignee", task.getAssignee());
            taskInfo.put("processInstanceId", task.getProcessInstanceId());
            taskInfo.put("processDefinitionId", task.getProcessDefinitionId());
            taskInfo.put("formKey", task.getFormKey());

            // Récupérer les variables de la tâche
            Map<String, Object> variables = taskService.getVariables(taskId);
            taskInfo.put("variables", variables);

            return ResponseEntity.ok(taskInfo);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Échec de la récupération de la tâche: " + e.getMessage()
            ));
        }
    }

    /**
     * Récupère le formulaire associé à une tâche
     */
    @GetMapping("/{taskId}/form")
    public ResponseEntity<?> getTaskForm(@PathVariable String taskId) {
        try {
            // Vérifier si la tâche existe
            Task task = taskService.createTaskQuery()
                    .taskId(taskId)
                    .initializeFormKeys() // Initialiser les clés de formulaire
                    .singleResult();

            if (task == null) {
                return ResponseEntity.notFound().build();
            }

            // Récupérer les données du formulaire
            TaskFormData formData = formService.getTaskFormData(taskId);

            // Si Camunda a un formulaire standard
            if (formData != null && formData.getFormFields() != null && !formData.getFormFields().isEmpty()) {
                Map<String, Object> result = new HashMap<>();
                result.put("formKey", formData.getFormKey());
                
                List<Map<String, Object>> fields = new ArrayList<>();
                for (FormField field : formData.getFormFields()) {
                    Map<String, Object> fieldInfo = new HashMap<>();
                    fieldInfo.put("id", field.getId());
                    fieldInfo.put("label", field.getLabel());
                    fieldInfo.put("type", field.getTypeName());
                    fieldInfo.put("value", field.getValue() != null ? field.getValue().getValue() : null);
                    String requiredProperty = field.getProperties().get("required");
                    fieldInfo.put("properties", field.getProperties());
                    fields.add(fieldInfo);
                }
                result.put("fields", fields);
                
                return ResponseEntity.ok(result);
            }
            
            // Si pas de formulaire standard, chercher dans notre table personnalisée
            String formKey = task.getFormKey();
            
            // Si on a une formKey personnalisée, on peut récupérer la définition de notre base
            // Ceci est à adapter selon votre implémentation
            if (formKey != null && !formKey.isEmpty()) {
                // Cette partie dépend de comment vous stockez vos formulaires personnalisés
                // Par exemple, via la table UserTaskForm
                Map<String, Object> form = new HashMap<>();
                form.put("formKey", formKey);
                form.put("taskId", taskId);
                
                // Exemple de définition de formulaire (à remplacer par votre logique)
                Map<String, Object> customForm = new HashMap<>();
                customForm.put("fields", getDefaultFormFields());
                form.put("formDefinition", customForm);
                
                return ResponseEntity.ok(form);
            }
            
            // Si aucun formulaire n'est trouvé, retourner un formulaire générique basé sur les variables
            Map<String, Object> variables = taskService.getVariables(taskId);
            Map<String, Object> genericForm = new HashMap<>();
            genericForm.put("taskId", taskId);
            genericForm.put("formKey", "genericForm");
            genericForm.put("fields", convertVariablesToFormFields(variables));
            
            return ResponseEntity.ok(genericForm);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Échec de la récupération du formulaire: " + e.getMessage()
            ));
        }
    }

    /**
     * Réclame (claim) une tâche pour l'utilisateur spécifié
     */
    @PostMapping("/{taskId}/claim")
    public ResponseEntity<?> claimTask(@PathVariable String taskId, @RequestBody Map<String, String> request) {
        try {
            String userId = request.get("userId");
            if (userId == null || userId.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "L'identifiant utilisateur est requis"
                ));
            }

            taskService.claim(taskId, userId);
            return ResponseEntity.ok(Map.of(
                    "message", "Tâche réclamée avec succès par l'utilisateur: " + userId
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Échec de la réclamation de la tâche: " + e.getMessage()
            ));
        }
    }

    /**
     * Libérer (unclaim) une tâche précédemment réclamée
     */
    @PostMapping("/{taskId}/unclaim")
    public ResponseEntity<?> unclaimTask(@PathVariable String taskId) {
        try {
            taskService.setAssignee(taskId, null);
            return ResponseEntity.ok(Map.of(
                    "message", "Tâche libérée avec succès"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Échec de la libération de la tâche: " + e.getMessage()
            ));
        }
    }

    /**
     * Compléter une tâche avec des variables
     */
    @PostMapping("/{taskId}/complete")
    public ResponseEntity<?> completeTask(@PathVariable String taskId, @RequestBody Map<String, Object> variables) {
        try {
            // Vérifier si la tâche existe
            Task task = taskService.createTaskQuery()
                    .taskId(taskId)
                    .initializeFormKeys() // Initialiser les clés de formulaire
                    .singleResult();

            if (task == null) {
                return ResponseEntity.notFound().build();
            }

            // Extraire les variables à passer lors de la complétion
            Map<String, Object> processVariables;

            if (variables.containsKey("variables") && variables.get("variables") instanceof Map) {
                processVariables = (Map<String, Object>) variables.get("variables");
            } else {
                processVariables = new HashMap<>();
                variables.forEach((key, value) -> {
                    if (!key.equals("taskId")) {
                        processVariables.put(key, value);
                    }
                });
            }

            // Compléter la tâche
            taskService.complete(taskId, processVariables);

            return ResponseEntity.ok(Map.of(
                    "message", "Tâche complétée avec succès",
                    "taskId", taskId
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Échec de la complétion de la tâche: " + e.getMessage()
            ));
        }
    }

    /**
     * Méthode utilitaire pour convertir des variables en champs de formulaire génériques
     */
    private List<Map<String, Object>> convertVariablesToFormFields(Map<String, Object> variables) {
        return variables.entrySet().stream()
                .map(entry -> {
                    Map<String, Object> field = new HashMap<>();
                    field.put("id", entry.getKey());
                    field.put("label", capitalizeFirstLetter(entry.getKey()));
                    field.put("value", entry.getValue());
                    
                    // Déterminer le type en fonction de la valeur
                    String type = "string";
                    if (entry.getValue() instanceof Number) {
                        type = entry.getValue() instanceof Integer ? "integer" : "number";
                    } else if (entry.getValue() instanceof Boolean) {
                        type = "boolean";
                    } else if (entry.getValue() instanceof java.util.Date) {
                        type = "date";
                    }
                    field.put("type", type);
                    
                    return field;
                })
                .collect(Collectors.toList());
    }

    /**
     * Méthode utilitaire pour capitaliser la première lettre d'une chaîne
     */
    private String capitalizeFirstLetter(String input) {
        if (input == null || input.isEmpty()) {
            return input;
        }
        return input.substring(0, 1).toUpperCase() + input.substring(1);
    }

    /**
     * Fournit des champs de formulaire par défaut
     */
    private List<Map<String, Object>> getDefaultFormFields() {
        List<Map<String, Object>> fields = new ArrayList<>();
        
        Map<String, Object> nameField = new HashMap<>();
        nameField.put("id", "name");
        nameField.put("label", "Nom");
        nameField.put("type", "string");
        nameField.put("required", true);
        fields.add(nameField);
        
        Map<String, Object> emailField = new HashMap<>();
        emailField.put("id", "email");
        emailField.put("label", "Email");
        emailField.put("type", "string");
        emailField.put("required", true);
        fields.add(emailField);
        
        Map<String, Object> commentField = new HashMap<>();
        commentField.put("id", "comment");
        commentField.put("label", "Commentaire");
        commentField.put("type", "string");
        commentField.put("required", false);
        fields.add(commentField);
        
        return fields;
    }
}
