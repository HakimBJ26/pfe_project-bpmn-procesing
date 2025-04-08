package com.safalifter.jobservice.config;

import com.safalifter.jobservice.dto.JavaDelegateRequest;
import com.safalifter.jobservice.model.JavaDelegate;
import com.safalifter.jobservice.repository.JavaDelegateRepository;
import com.safalifter.jobservice.service.JavaDelegateService;
import com.safalifter.jobservice.util.JavaDelegateTemplates;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class JavaDelegateInitializer {

    private final JavaDelegateService javaDelegateService;
    private final JavaDelegateRepository javaDelegateRepository;

    @Bean
    public CommandLineRunner initJavaDelegates() {
        return args -> {
            log.info("Initialisation des JavaDelegates par défaut");

            // Création des JavaDelegates par défaut
            List<JavaDelegateRequest> defaultDelegates = Arrays.asList(
                // Logger JavaDelegate
                createDelegateRequest(
                    "com.example.delegates.LoggerJavaDelegate",
                    "Journalisation d'informations pendant l'exécution du processus",
                    JavaDelegateTemplates.getLoggerTemplate("com.example.delegates", "LoggerJavaDelegate")
                ),
                
                // Email Sender JavaDelegate
                createDelegateRequest(
                    "com.example.delegates.EmailSenderDelegate",
                    "Envoi d'emails aux utilisateurs du système",
                    JavaDelegateTemplates.getEmailSenderTemplate("com.example.delegates", "EmailSenderDelegate")
                ),
                
                // Task Assignment JavaDelegate
                createDelegateRequest(
                    "com.example.delegates.TaskAssignmentDelegate",
                    "Assignation automatique de tâches en fonction des règles métier",
                    getTaskAssignmentDelegateSource()
                ),
                
                // Data Validation JavaDelegate
                createDelegateRequest(
                    "com.example.delegates.DataValidationDelegate",
                    "Validation des données saisies dans le processus",
                    getDataValidationDelegateSource()
                ),
                
                // REST Service Caller JavaDelegate
                createDelegateRequest(
                    "com.example.delegates.RestServiceDelegate",
                    "Appel de services REST externes",
                    getRestServiceDelegateSource()
                )
            );

            // Ajout des JavaDelegates dans la base de données
            for (JavaDelegateRequest delegateRequest : defaultDelegates) {
                try {
                    // Vérifier si le JavaDelegate existe déjà
                    Optional<JavaDelegate> existingDelegate = javaDelegateRepository.findByClassName(delegateRequest.getName());
                    
                    if (existingDelegate.isPresent()) {
                        log.info("JavaDelegate {} existe déjà, mise à jour...", delegateRequest.getName());
                        javaDelegateService.updateJavaDelegate(delegateRequest.getName(), delegateRequest);
                    } else {
                        log.info("Création du JavaDelegate: {}", delegateRequest.getName());
                        javaDelegateService.createJavaDelegate(delegateRequest);
                    }
                } catch (Exception e) {
                    log.error("Erreur lors de la création du JavaDelegate {}: {}", delegateRequest.getName(), e.getMessage());
                }
            }

            log.info("Initialisation des JavaDelegates terminée");
        };
    }

    private JavaDelegateRequest createDelegateRequest(String className, String description, String sourceCode) {
        return JavaDelegateRequest.builder()
                .name(className)
                .description(description)
                .sourceCode(sourceCode)
                .build();
    }
    
    private String getTaskAssignmentDelegateSource() {
        return "package com.example.delegates;\n\n" +
                "import org.camunda.bpm.engine.delegate.DelegateExecution;\n" +
                "import org.camunda.bpm.engine.delegate.JavaDelegate;\n" +
                "import org.camunda.bpm.engine.task.Task;\n" +
                "import org.springframework.stereotype.Component;\n" +
                "import org.slf4j.Logger;\n" +
                "import org.slf4j.LoggerFactory;\n\n" +
                "/**\n" +
                " * JavaDelegate qui attribue une tâche à un utilisateur spécifique en fonction\n" +
                " * des variables du processus ou d'une logique d'affaires personnalisée.\n" +
                " */\n" +
                "@Component\n" +
                "public class TaskAssignmentDelegate implements JavaDelegate {\n" +
                "    \n" +
                "    private static final Logger logger = LoggerFactory.getLogger(TaskAssignmentDelegate.class);\n" +
                "    \n" +
                "    @Override\n" +
                "    public void execute(DelegateExecution execution) throws Exception {\n" +
                "        // Récupérer les variables nécessaires\n" +
                "        String department = (String) execution.getVariable(\"department\");\n" +
                "        String priority = (String) execution.getVariable(\"priority\");\n" +
                "        \n" +
                "        // Déterminer l'assigné en fonction des variables\n" +
                "        String assignee = determineAssignee(department, priority);\n" +
                "        \n" +
                "        // Stocker l'assigné comme variable de processus\n" +
                "        execution.setVariable(\"assigneeId\", assignee);\n" +
                "        \n" +
                "        logger.info(\"Tâche assignée à {} pour le processus {}\", assignee, execution.getProcessInstanceId());\n" +
                "    }\n" +
                "    \n" +
                "    /**\n" +
                "     * Détermine l'assigné en fonction du département et de la priorité\n" +
                "     */\n" +
                "    private String determineAssignee(String department, String priority) {\n" +
                "        // Logique d'assignation simplifiée à titre d'exemple\n" +
                "        if (\"HR\".equals(department)) {\n" +
                "            return \"HIGH\".equals(priority) ? \"hr_manager\" : \"hr_specialist\";\n" +
                "        } else if (\"IT\".equals(department)) {\n" +
                "            return \"HIGH\".equals(priority) ? \"it_manager\" : \"it_support\";\n" +
                "        } else if (\"FINANCE\".equals(department)) {\n" +
                "            return \"finance_specialist\";\n" +
                "        }\n" +
                "        \n" +
                "        // Assigné par défaut\n" +
                "        return \"process_admin\";\n" +
                "    }\n" +
                "}";
    }
    
    private String getDataValidationDelegateSource() {
        return "package com.example.delegates;\n\n" +
                "import org.camunda.bpm.engine.delegate.DelegateExecution;\n" +
                "import org.camunda.bpm.engine.delegate.JavaDelegate;\n" +
                "import org.springframework.stereotype.Component;\n" +
                "import org.slf4j.Logger;\n" +
                "import org.slf4j.LoggerFactory;\n" +
                "import java.util.ArrayList;\n" +
                "import java.util.List;\n\n" +
                "/**\n" +
                " * JavaDelegate qui valide les données entrées dans le processus.\n" +
                " * Il collecte les erreurs et définit des variables pour indiquer si la validation a réussi.\n" +
                " */\n" +
                "@Component\n" +
                "public class DataValidationDelegate implements JavaDelegate {\n" +
                "    \n" +
                "    private static final Logger logger = LoggerFactory.getLogger(DataValidationDelegate.class);\n" +
                "    \n" +
                "    @Override\n" +
                "    public void execute(DelegateExecution execution) throws Exception {\n" +
                "        logger.info(\"Validation des données pour le processus {}\", execution.getProcessInstanceId());\n" +
                "        \n" +
                "        // Liste pour stocker les erreurs\n" +
                "        List<String> validationErrors = new ArrayList<>();\n" +
                "        \n" +
                "        // Récupérer et valider les variables\n" +
                "        validateRequiredString(execution, \"name\", validationErrors);\n" +
                "        validateRequiredString(execution, \"email\", validationErrors);\n" +
                "        validateEmail(execution, \"email\", validationErrors);\n" +
                "        validateNumericValue(execution, \"amount\", validationErrors);\n" +
                "        \n" +
                "        // Stocker le résultat de la validation\n" +
                "        boolean isValid = validationErrors.isEmpty();\n" +
                "        execution.setVariable(\"dataValid\", isValid);\n" +
                "        execution.setVariable(\"validationErrors\", validationErrors);\n" +
                "        \n" +
                "        if (isValid) {\n" +
                "            logger.info(\"Validation réussie pour le processus {}\", execution.getProcessInstanceId());\n" +
                "        } else {\n" +
                "            logger.warn(\"Validation échouée pour le processus {}: {}\", \n" +
                "                execution.getProcessInstanceId(), String.join(\", \", validationErrors));\n" +
                "        }\n" +
                "    }\n" +
                "    \n" +
                "    private void validateRequiredString(DelegateExecution execution, String variableName, List<String> errors) {\n" +
                "        Object value = execution.getVariable(variableName);\n" +
                "        if (value == null || (value instanceof String && ((String) value).trim().isEmpty())) {\n" +
                "            errors.add(variableName + \" est requis\");\n" +
                "        }\n" +
                "    }\n" +
                "    \n" +
                "    private void validateEmail(DelegateExecution execution, String variableName, List<String> errors) {\n" +
                "        Object value = execution.getVariable(variableName);\n" +
                "        if (value != null && value instanceof String) {\n" +
                "            String email = (String) value;\n" +
                "            if (!email.isEmpty() && !email.matches(\"^[\\\\w.-]+@([\\\\w-]+\\\\.)+[\\\\w-]{2,4}$\")) {\n" +
                "                errors.add(variableName + \" n'est pas une adresse email valide\");\n" +
                "            }\n" +
                "        }\n" +
                "    }\n" +
                "    \n" +
                "    private void validateNumericValue(DelegateExecution execution, String variableName, List<String> errors) {\n" +
                "        Object value = execution.getVariable(variableName);\n" +
                "        if (value != null) {\n" +
                "            try {\n" +
                "                if (value instanceof String) {\n" +
                "                    Double.parseDouble((String) value);\n" +
                "                } else if (!(value instanceof Number)) {\n" +
                "                    errors.add(variableName + \" doit être une valeur numérique\");\n" +
                "                }\n" +
                "            } catch (NumberFormatException e) {\n" +
                "                errors.add(variableName + \" doit être une valeur numérique\");\n" +
                "            }\n" +
                "        }\n" +
                "    }\n" +
                "}";
    }
    
    private String getRestServiceDelegateSource() {
        return "package com.example.delegates;\n\n" +
                "import org.camunda.bpm.engine.delegate.DelegateExecution;\n" +
                "import org.camunda.bpm.engine.delegate.JavaDelegate;\n" +
                "import org.springframework.stereotype.Component;\n" +
                "import org.slf4j.Logger;\n" +
                "import org.slf4j.LoggerFactory;\n" +
                "import org.springframework.http.HttpEntity;\n" +
                "import org.springframework.http.HttpHeaders;\n" +
                "import org.springframework.http.HttpMethod;\n" +
                "import org.springframework.http.ResponseEntity;\n" +
                "import org.springframework.web.client.RestTemplate;\n\n" +
                "/**\n" +
                " * JavaDelegate pour appeler des services REST externes.\n" +
                " * Il récupère l'URL, la méthode et les données à envoyer à partir des variables du processus,\n" +
                " * effectue l'appel et stocke la réponse comme variable de processus.\n" +
                " */\n" +
                "@Component\n" +
                "public class RestServiceDelegate implements JavaDelegate {\n" +
                "    \n" +
                "    private static final Logger logger = LoggerFactory.getLogger(RestServiceDelegate.class);\n" +
                "    private final RestTemplate restTemplate = new RestTemplate();\n" +
                "    \n" +
                "    @Override\n" +
                "    public void execute(DelegateExecution execution) throws Exception {\n" +
                "        // Récupérer les paramètres d'appel\n" +
                "        String url = (String) execution.getVariable(\"serviceUrl\");\n" +
                "        String method = (String) execution.getVariable(\"httpMethod\");\n" +
                "        Object requestBody = execution.getVariable(\"requestBody\");\n" +
                "        \n" +
                "        if (url == null || url.isEmpty()) {\n" +
                "            throw new IllegalArgumentException(\"L'URL du service est requise\");\n" +
                "        }\n" +
                "        \n" +
                "        // Méthode HTTP par défaut: GET\n" +
                "        HttpMethod httpMethod = HttpMethod.GET;\n" +
                "        if (method != null && !method.isEmpty()) {\n" +
                "            try {\n" +
                "                httpMethod = HttpMethod.valueOf(method.toUpperCase());\n" +
                "            } catch (IllegalArgumentException e) {\n" +
                "                logger.warn(\"Méthode HTTP non reconnue: {}, utilisation de GET par défaut\", method);\n" +
                "            }\n" +
                "        }\n" +
                "        \n" +
                "        try {\n" +
                "            logger.info(\"Appel du service externe: {} {}\", httpMethod, url);\n" +
                "            \n" +
                "            // Configuration des en-têtes\n" +
                "            HttpHeaders headers = new HttpHeaders();\n" +
                "            headers.set(\"Content-Type\", \"application/json\");\n" +
                "            \n" +
                "            // Préparation de la requête\n" +
                "            HttpEntity<?> requestEntity = new HttpEntity<>(requestBody, headers);\n" +
                "            \n" +
                "            // Exécution de l'appel\n" +
                "            ResponseEntity<String> response = restTemplate.exchange(\n" +
                "                url, httpMethod, requestEntity, String.class);\n" +
                "            \n" +
                "            // Stockage de la réponse\n" +
                "            execution.setVariable(\"serviceResponse\", response.getBody());\n" +
                "            execution.setVariable(\"serviceResponseStatus\", response.getStatusCodeValue());\n" +
                "            execution.setVariable(\"serviceCallSuccess\", true);\n" +
                "            \n" +
                "            logger.info(\"Appel du service réussi avec statut: {}\", response.getStatusCodeValue());\n" +
                "            \n" +
                "        } catch (Exception e) {\n" +
                "            logger.error(\"Erreur lors de l'appel du service: {}\", e.getMessage());\n" +
                "            execution.setVariable(\"serviceCallSuccess\", false);\n" +
                "            execution.setVariable(\"serviceCallError\", e.getMessage());\n" +
                "            throw new RuntimeException(\"Erreur lors de l'appel du service externe: \" + e.getMessage(), e);\n" +
                "        }\n" +
                "    }\n" +
                "}";
    }
}
