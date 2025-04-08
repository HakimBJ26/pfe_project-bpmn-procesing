package com.safalifter.jobservice.util;

/**
 * Classe utilitaire qui fournit des modèles pour la création de JavaDelegates
 */
public class JavaDelegateTemplates {

    /**
     * Retourne un modèle de base pour un nouveau JavaDelegate
     * @param packageName le nom du package
     * @param className le nom simple de la classe
     * @return le code source du modèle
     */
    public static String getBasicTemplate(String packageName, String className) {
        StringBuilder template = new StringBuilder();
        
        // Ajouter la déclaration de package si nécessaire
        if (packageName != null && !packageName.isEmpty()) {
            template.append("package ").append(packageName).append(";\n\n");
        }
        
        // Ajouter les imports nécessaires
        template.append("import org.camunda.bpm.engine.delegate.DelegateExecution;\n");
        template.append("import org.camunda.bpm.engine.delegate.JavaDelegate;\n");
        template.append("import org.slf4j.Logger;\n");
        template.append("import org.slf4j.LoggerFactory;\n\n");
        
        // Ajouter le commentaire de classe
        template.append("/**\n");
        template.append(" * JavaDelegate qui [description de la fonctionnalité]\n");
        template.append(" */\n");
        
        // Ajouter la déclaration de classe
        template.append("public class ").append(className).append(" implements JavaDelegate {\n\n");
        
        // Ajouter le logger
        template.append("    private static final Logger logger = LoggerFactory.getLogger(")
               .append(className).append(".class);\n\n");
        
        // Ajouter la méthode execute
        template.append("    @Override\n");
        template.append("    public void execute(DelegateExecution execution) throws Exception {\n");
        template.append("        // Log de début d'exécution\n");
        template.append("        logger.info(\"Exécution du JavaDelegate: ").append(className).append("\");\n\n");
        
        template.append("        // Récupérer des variables du processus si nécessaire\n");
        template.append("        // String variable = (String) execution.getVariable(\"nomVariable\");\n\n");
        
        template.append("        try {\n");
        template.append("            // Logique métier à implémenter ici\n");
        template.append("            logger.info(\"Implémentez votre logique métier ici\");\n\n");
        
        template.append("            // Définir des variables de processus si nécessaire\n");
        template.append("            // execution.setVariable(\"resultat\", \"valeur\");\n");
        template.append("        } catch (Exception e) {\n");
        template.append("            logger.error(\"Erreur lors de l'exécution du JavaDelegate: \" + e.getMessage(), e);\n");
        template.append("            throw e; // ou gérer l'erreur autrement\n");
        template.append("        }\n\n");
        
        template.append("        logger.info(\"Fin de l'exécution du JavaDelegate: ").append(className).append("\");\n");
        template.append("    }\n");
        template.append("}\n");
        
        return template.toString();
    }
    
    /**
     * Retourne un modèle de JavaDelegate pour envoyer un email
     * @param packageName le nom du package
     * @param className le nom simple de la classe
     * @return le code source du modèle
     */
    public static String getEmailSenderTemplate(String packageName, String className) {
        StringBuilder template = new StringBuilder();
        
        // Ajouter la déclaration de package si nécessaire
        if (packageName != null && !packageName.isEmpty()) {
            template.append("package ").append(packageName).append(";\n\n");
        }
        
        // Ajouter les imports nécessaires
        template.append("import org.camunda.bpm.engine.delegate.DelegateExecution;\n");
        template.append("import org.camunda.bpm.engine.delegate.JavaDelegate;\n");
        template.append("import org.slf4j.Logger;\n");
        template.append("import org.slf4j.LoggerFactory;\n\n");
        template.append("import javax.mail.*;\n");
        template.append("import javax.mail.internet.*;\n");
        template.append("import java.util.Properties;\n\n");
        
        // Ajouter le commentaire de classe
        template.append("/**\n");
        template.append(" * JavaDelegate qui envoie un email\n");
        template.append(" */\n");
        
        // Ajouter la déclaration de classe
        template.append("public class ").append(className).append(" implements JavaDelegate {\n\n");
        
        // Ajouter le logger
        template.append("    private static final Logger logger = LoggerFactory.getLogger(")
               .append(className).append(".class);\n\n");
        
        // Ajouter les constantes pour la configuration SMTP
        template.append("    // Configuration SMTP - à modifier selon votre environnement\n");
        template.append("    private static final String SMTP_HOST = \"smtp.example.com\";\n");
        template.append("    private static final int SMTP_PORT = 587;\n");
        template.append("    private static final String SMTP_USERNAME = \"username\";\n");
        template.append("    private static final String SMTP_PASSWORD = \"password\";\n\n");
        
        // Ajouter la méthode execute
        template.append("    @Override\n");
        template.append("    public void execute(DelegateExecution execution) throws Exception {\n");
        template.append("        logger.info(\"Exécution du JavaDelegate d'envoi d'email\");\n\n");
        
        template.append("        // Récupérer les variables du processus\n");
        template.append("        String to = (String) execution.getVariable(\"emailTo\");\n");
        template.append("        String subject = (String) execution.getVariable(\"emailSubject\");\n");
        template.append("        String body = (String) execution.getVariable(\"emailBody\");\n\n");
        
        template.append("        // Valider les paramètres\n");
        template.append("        if (to == null || to.isEmpty()) {\n");
        template.append("            throw new IllegalArgumentException(\"La variable 'emailTo' est requise\");\n");
        template.append("        }\n\n");
        
        template.append("        if (subject == null) subject = \"Notification automatique\";\n");
        template.append("        if (body == null) body = \"Message généré automatiquement par le processus BPMN.\";\n\n");
        
        template.append("        try {\n");
        template.append("            // Configurer les propriétés SMTP\n");
        template.append("            Properties props = new Properties();\n");
        template.append("            props.put(\"mail.smtp.auth\", \"true\");\n");
        template.append("            props.put(\"mail.smtp.starttls.enable\", \"true\");\n");
        template.append("            props.put(\"mail.smtp.host\", SMTP_HOST);\n");
        template.append("            props.put(\"mail.smtp.port\", SMTP_PORT);\n\n");
        
        template.append("            // Créer une session avec authentification\n");
        template.append("            Session session = Session.getInstance(props, new Authenticator() {\n");
        template.append("                @Override\n");
        template.append("                protected PasswordAuthentication getPasswordAuthentication() {\n");
        template.append("                    return new PasswordAuthentication(SMTP_USERNAME, SMTP_PASSWORD);\n");
        template.append("                }\n");
        template.append("            });\n\n");
        
        template.append("            // Créer le message\n");
        template.append("            Message message = new MimeMessage(session);\n");
        template.append("            message.setFrom(new InternetAddress(SMTP_USERNAME));\n");
        template.append("            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(to));\n");
        template.append("            message.setSubject(subject);\n");
        template.append("            message.setText(body);\n\n");
        
        template.append("            // Envoyer le message\n");
        template.append("            Transport.send(message);\n");
        template.append("            logger.info(\"Email envoyé avec succès à {}\", to);\n\n");
        
        template.append("            // Définir une variable de processus pour indiquer le succès\n");
        template.append("            execution.setVariable(\"emailSent\", true);\n");
        template.append("            execution.setVariable(\"emailError\", null);\n");
        template.append("        } catch (Exception e) {\n");
        template.append("            logger.error(\"Erreur lors de l'envoi de l'email: \" + e.getMessage(), e);\n");
        template.append("            execution.setVariable(\"emailSent\", false);\n");
        template.append("            execution.setVariable(\"emailError\", e.getMessage());\n");
        template.append("            throw e;\n");
        template.append("        }\n\n");
        
        template.append("        logger.info(\"Fin de l'exécution du JavaDelegate d'envoi d'email\");\n");
        template.append("    }\n");
        template.append("}\n");
        
        return template.toString();
    }

    /**
     * Retourne un modèle de JavaDelegate pour journaliser des informations
     * @param packageName le nom du package
     * @param className le nom simple de la classe
     * @return le code source du modèle
     */
    public static String getLoggerTemplate(String packageName, String className) {
        StringBuilder template = new StringBuilder();
        
        // Ajouter la déclaration de package si nécessaire
        if (packageName != null && !packageName.isEmpty()) {
            template.append("package ").append(packageName).append(";\n\n");
        }
        
        // Ajouter les imports nécessaires
        template.append("import org.camunda.bpm.engine.delegate.DelegateExecution;\n");
        template.append("import org.camunda.bpm.engine.delegate.JavaDelegate;\n");
        template.append("import org.slf4j.Logger;\n");
        template.append("import org.slf4j.LoggerFactory;\n\n");
        template.append("import java.util.HashMap;\n");
        template.append("import java.util.Map;\n\n");
        
        // Ajouter le commentaire de classe
        template.append("/**\n");
        template.append(" * JavaDelegate qui journalise les variables d'un processus\n");
        template.append(" */\n");
        
        // Ajouter la déclaration de classe
        template.append("public class ").append(className).append(" implements JavaDelegate {\n\n");
        
        // Ajouter le logger
        template.append("    private static final Logger logger = LoggerFactory.getLogger(")
               .append(className).append(".class);\n\n");
        
        // Ajouter la méthode execute
        template.append("    @Override\n");
        template.append("    public void execute(DelegateExecution execution) throws Exception {\n");
        template.append("        String processInstanceId = execution.getProcessInstanceId();\n");
        template.append("        String businessKey = execution.getProcessBusinessKey();\n");
        template.append("        String activityId = execution.getCurrentActivityId();\n\n");
        
        template.append("        logger.info(\"=== Exécution du JavaDelegate de journalisation ===\");\n");
        template.append("        logger.info(\"Processus: {} (Instance: {})\", execution.getProcessDefinitionId(), processInstanceId);\n");
        template.append("        logger.info(\"Business Key: {}\", businessKey != null ? businessKey : \"Non définie\");\n");
        template.append("        logger.info(\"Activité courante: {}\", activityId);\n\n");
        
        template.append("        // Récupérer et journaliser toutes les variables du processus\n");
        template.append("        logger.info(\"Variables du processus:\");\n");
        template.append("        Map<String, Object> variables = execution.getVariables();\n");
        template.append("        if (variables.isEmpty()) {\n");
        template.append("            logger.info(\"  Aucune variable définie\");\n");
        template.append("        } else {\n");
        template.append("            variables.forEach((key, value) -> {\n");
        template.append("                String valueStr = (value != null) ? value.toString() : \"null\";\n");
        template.append("                logger.info(\"  {} = {} ({})\", key, valueStr, value != null ? value.getClass().getSimpleName() : \"null\");\n");
        template.append("            });\n");
        template.append("        }\n\n");
        
        template.append("        // Définir une variable pour indiquer que la journalisation a été effectuée\n");
        template.append("        execution.setVariable(\"loggingExecuted\", true);\n");
        template.append("        execution.setVariable(\"loggingTimestamp\", System.currentTimeMillis());\n\n");
        
        template.append("        // Créer un résumé des variables journalisées\n");
        template.append("        Map<String, Object> summary = new HashMap<>();\n");
        template.append("        summary.put(\"processInstanceId\", processInstanceId);\n");
        template.append("        summary.put(\"activityId\", activityId);\n");
        template.append("        summary.put(\"variableCount\", variables.size());\n");
        template.append("        execution.setVariable(\"loggingSummary\", summary);\n\n");
        
        template.append("        logger.info(\"=== Fin de l'exécution du JavaDelegate de journalisation ===\");\n");
        template.append("    }\n");
        template.append("}\n");
        
        return template.toString();
    }
}
