package com.safalifter.jobservice.util;

import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.model.bpmn.Bpmn;
import org.camunda.bpm.model.bpmn.BpmnModelInstance;
import org.camunda.bpm.model.bpmn.instance.BaseElement;
import org.camunda.bpm.model.xml.instance.DomElement;
import org.camunda.bpm.model.xml.instance.ModelElementInstance;

import java.io.ByteArrayInputStream;

/**
 * Classe utilitaire pour la manipulation des éléments XML BPMN
 * Gère les namespaces et attributs avec namespace
 */
@Slf4j
public class BpmnXmlHelper {

    /**
     * Ajoute tous les namespaces nécessaires à un élément de définitions BPMN
     * en utilisant l'approche recommandée par Camunda
     * 
     * @param definitions L'élément Definitions auquel ajouter les namespaces
     */
    public static void addRequiredNamespaces(ModelElementInstance definitions) {
        try {
            // Nous récupérons le modèle parent
            BpmnModelInstance modelInstance = (BpmnModelInstance) definitions.getModelInstance();
            
            // On ajoute les attributs standards aux définitions
            DomElement domElement = definitions.getDomElement();
            domElement.setAttribute("targetNamespace", "http://camunda.org/schema/1.0/bpmn");
            domElement.setAttribute("expressionLanguage", "http://www.w3.org/1999/XPath");
            domElement.setAttribute("typeLanguage", "http://www.w3.org/2001/XMLSchema");
            
            // On n'essaie pas de définir manuellement les namespaces XML (xmlns, xmlns:camunda, etc.)
            // car ils sont gérés par l'API Camunda lors de l'écriture du modèle en XML
            
            log.info("Configuration des attributs de définitions réussie");
        } catch (Exception e) {
            log.error("Erreur lors de la configuration des définitions BPMN: {}", e.getMessage(), e);
            throw e;
        }
    }
    
    /**
     * Définit un attribut avec namespace sur un élément BPMN
     * 
     * @param element L'élément sur lequel définir l'attribut
     * @param namespaceUri L'URI du namespace
     * @param attributeName Le nom de l'attribut
     * @param value La valeur de l'attribut
     */
    public static void setAttributeWithNamespace(ModelElementInstance element, String namespaceUri, String attributeName, String value) {
        try {
            DomElement domElement = element.getDomElement();
            String prefixedName = getPrefixedAttributeName(namespaceUri, attributeName);
            
            // Utiliser la méthode standard de l'API Camunda, qui gère correctement les namespaces en interne
            domElement.setAttribute(prefixedName, value);
            log.debug("Attribut avec namespace défini: {} = {}", prefixedName, value);
        } catch (Exception e) {
            log.error("Erreur lors de la définition d'un attribut avec namespace: {}:{} = {}", 
                    namespaceUri, attributeName, value, e);
            throw e;
        }
    }
    
    /**
     * Récupère la valeur d'un attribut avec namespace
     * 
     * @param element L'élément où chercher l'attribut
     * @param namespaceUri L'URI du namespace
     * @param attributeName Le nom de l'attribut
     * @return La valeur de l'attribut ou null si non trouvé
     */
    public static String getAttributeWithNamespace(ModelElementInstance element, String namespaceUri, String attributeName) {
        try {
            DomElement domElement = element.getDomElement();
            String prefixedName = getPrefixedAttributeName(namespaceUri, attributeName);
            
            return domElement.getAttribute(prefixedName);
        } catch (Exception e) {
            log.error("Erreur lors de la récupération d'un attribut avec namespace: {}:{}", 
                    namespaceUri, attributeName, e);
            return null;
        }
    }
    
    /**
     * Obtient le nom d'attribut préfixé pour un namespace donné
     * 
     * @param namespaceUri L'URI du namespace
     * @param attributeName Le nom de l'attribut
     * @return Le nom d'attribut avec préfixe ou tel quel si namespace par défaut
     */
    private static String getPrefixedAttributeName(String namespaceUri, String attributeName) {
        if (namespaceUri == null) return attributeName;
        
        switch (namespaceUri) {
            case "http://www.omg.org/spec/BPMN/20100524/MODEL":
                return attributeName; // Namespace par défaut, pas de préfixe
            case "http://www.omg.org/spec/BPMN/20100524/DI":
                return "bpmndi:" + attributeName;
            case "http://www.omg.org/spec/DD/20100524/DC":
                return "dc:" + attributeName;
            case "http://www.omg.org/spec/DD/20100524/DI":
                return "di:" + attributeName;
            case "http://camunda.org/schema/1.0/bpmn":
                return "camunda:" + attributeName;
            case "http://camunda.org/schema/modeler/1.0":
                return "modeler:" + attributeName;
            default:
                log.warn("Namespace non reconnu: {}, utilisation du nom d'attribut sans préfixe", namespaceUri);
                return attributeName;
        }
    }
    
    /**
     * Définit la clé de processus (processKey) sur un élément Process BPMN
     * Méthode simplifiée pour éviter les erreurs de namespace
     * 
     * @param process L'élément Process
     * @param processKey La clé de processus à définir
     */
    public static void setProcessKey(BaseElement process, String processKey) {
        // On ne fait rien - temporairement désactivé pour résoudre l'erreur de namespace
        log.info("Configuration de processKey ignorée pour tester: {}", processKey);
    }
    
    /**
     * Récupère la clé de processus (processKey) d'un élément Process BPMN
     * 
     * @param process L'élément Process
     * @return La clé de processus ou null si non définie
     */
    public static String getProcessKey(BaseElement process) {
        // Puisque nous avons désactivé setProcessKey, nous retournons l'ID du processus
        try {
            return process.getId();
        } catch (Exception e) {
            log.error("Erreur lors de la récupération du processKey: {}", e.getMessage(), e);
            return null;
        }
    }
    
    /**
     * Méthode de conversion d'un modèle BPMN en XML puis reconversion en modèle 
     * pour s'assurer que tous les namespaces sont correctement configurés.
     * 
     * @param modelInstance Le modèle BPMN à normaliser
     * @return Le même modèle avec les namespaces correctement configurés
     */
    public static BpmnModelInstance normalizeNamespaces(BpmnModelInstance modelInstance) {
        try {
            // Convertir le modèle en XML
            String xml = Bpmn.convertToString(modelInstance);
            
            // Reconvertir le XML en modèle - Camunda ajoutera automatiquement tous les namespaces nécessaires
            return Bpmn.readModelFromStream(new ByteArrayInputStream(xml.getBytes()));
        } catch (Exception e) {
            log.error("Erreur lors de la normalisation des namespaces: {}", e.getMessage(), e);
            return modelInstance; // En cas d'erreur, retourner le modèle d'origine
        }
    }
}
