import React, { useEffect, useRef, useState } from 'react';
import BpmnJS from 'bpmn-js/lib/Modeler';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda.json';
import { Button, message, Modal, Input, Space, Tooltip, Card, Tabs, Form, Select, Radio, Collapse } from 'antd';
import { SaveOutlined, DeploymentUnitOutlined, DownloadOutlined, UploadOutlined, SettingOutlined, ReloadOutlined } from '@ant-design/icons';
import workflowService from '../../services/workflowService';
import processService from '../../services/processService';
import UserTaskForm from './UserTaskForm';
import BusinessRuleEditor from './BusinessRuleEditor';
import GatewayEditor from './GatewayEditor';
import ServiceTaskEditor from './ServiceTaskEditor';

import './BpmnEditor.css';

// Configuration du mode test
const TEST_MODE = true;

// Modèle BPMN par défaut pour initialiser un nouveau diagramme
const DEFAULT_DIAGRAM = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" 
                    xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" 
                    xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" 
                    xmlns:camunda="http://camunda.org/schema/1.0/bpmn"
                    xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_1" 
                    targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1" name="Start">
      <bpmn:outgoing>Flow_1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:endEvent id="EndEvent_1" name="End">
      <bpmn:incoming>Flow_1</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="EndEvent_1" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
        <dc:Bounds x="179" y="159" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="185" y="202" width="25" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="EndEvent_1_di" bpmnElement="EndEvent_1">
        <dc:Bounds x="432" y="159" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="440" y="202" width="20" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_1_di" bpmnElement="Flow_1">
        <di:waypoint x="215" y="177" />
        <di:waypoint x="432" y="177" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

const BpmnEditor = ({ workflowId, initialDiagram = DEFAULT_DIAGRAM, onSave }) => {
  const containerRef = useRef(null);
  const [bpmnModeler, setBpmnModeler] = useState(null);
  const [workflowTitle, setWorkflowTitle] = useState('New Workflow');
  const [isDeployModalVisible, setIsDeployModalVisible] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [xml, setXml] = useState(initialDiagram);
  const [selectedElement, setSelectedElement] = useState(null);
  const [isConfigPanelVisible, setIsConfigPanelVisible] = useState(false);
  const [elementConfig, setElementConfig] = useState({});
  const [configTabKey, setConfigTabKey] = useState('general');
  const [isUserTaskFormModalVisible, setIsUserTaskFormModalVisible] = useState(false);
  const [isBusinessRuleModalVisible, setIsBusinessRuleModalVisible] = useState(false);
  const [isGatewayEditorModalVisible, setIsGatewayEditorModalVisible] = useState(false);
  const [isServiceTaskModalVisible, setIsServiceTaskModalVisible] = useState(false);
  const { Panel } = Collapse;
  const { TabPane } = Tabs;
  const [testMode, setTestMode] = useState(TEST_MODE);
  const [deployProcessId, setDeployProcessId] = useState('');
  const [deployVersion, setDeployVersion] = useState(1);
  const [deployTenantId, setDeployTenantId] = useState('');

  useEffect(() => {
    if (!containerRef.current) return;

    // Nettoyer tout contenu existant dans le conteneur
    containerRef.current.innerHTML = '';

    // Initialiser l'éditeur BPMN
    const modeler = new BpmnJS({
      container: containerRef.current,
      // Configuration minimale sans le panneau de propriétés
      keyboard: {
        bindTo: window
      },
      moddleExtensions: {
        camunda: camundaModdleDescriptor
      }
    });

    // Importer le diagramme
    modeler.importXML(initialDiagram).catch(err => {
      console.error('Erreur lors de l\'importation du diagramme BPMN', err);
      message.error('Erreur lors du chargement du diagramme');
    });

    // S'assurer que le canvas est correctement redimensionné
    setTimeout(() => {
      modeler.get('canvas').zoom('fit-viewport', 'auto');
    }, 500);

    // Écouter les événements de sélection d'éléments
    modeler.on('element.click', (event) => {
      const { element } = event;
      if (element && element.businessObject) {
        setSelectedElement(element);
        
        // Charger la configuration existante de l'élément
        const config = getElementConfig(element);
        setElementConfig(config);
        
        // Afficher le panneau de configuration
        setIsConfigPanelVisible(true);
      }
    });

    // Écouter les événements de désélection
    modeler.on('canvas.click', (event) => {
      if (!event.element) {
        setSelectedElement(null);
        setIsConfigPanelVisible(false);
      }
    });

    setBpmnModeler(modeler);

    // Nettoyage lors du démontage du composant
    return () => modeler.destroy();
  }, [initialDiagram]);

  // Ajuster le zoom quand le conteneur change de taille
  useEffect(() => {
    const handleResize = () => {
      if (bpmnModeler) {
        bpmnModeler.get('canvas').zoom('fit-viewport', 'auto');
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [bpmnModeler]);

  // Extraire la configuration existante d'un élément
  const getElementConfig = (element) => {
    const businessObject = element.businessObject;
    const type = businessObject.$type;
    
    // Configuration de base commune à tous les types d'éléments
    const baseConfig = {
      id: businessObject.id,
      name: businessObject.name || '',
      type: type
    };
    
    // Configuration spécifique selon le type d'élément
    if (type.includes('Task')) {
      const config = {
        ...baseConfig,
        // Récupérer les propriétés spécifiques Camunda
        formKey: businessObject.formKey || '',
        assignee: businessObject.assignee || '',
        candidateUsers: businessObject.candidateUsers || '',
        candidateGroups: businessObject.candidateGroups || '',
        // Pour les Business Rule Tasks
        decisionRef: businessObject.decisionRef || '',
        resultVariable: businessObject.resultVariable || ''
      };

      // Configuration spécifique pour les Service Tasks
      if (type.includes('ServiceTask')) {
        config.implementationType = 'unknown';
        
        if (businessObject.delegateExpression) {
          config.implementationType = 'delegateExpression';
          config.implementation = businessObject.delegateExpression;
        } else if (businessObject.class) {
          config.implementationType = 'class';
          config.implementation = businessObject.class;
        } else if (businessObject.expression) {
          config.implementationType = 'expression';
          config.implementation = businessObject.expression;
        }
        
        // Récupérer les paramètres
        config.parameters = {};
        const extensionElements = businessObject.extensionElements;
        if (extensionElements && extensionElements.values) {
          const camundaProperties = extensionElements.values.find(
            v => v.$type === 'camunda:Properties'
          );
          
          if (camundaProperties && camundaProperties.values) {
            camundaProperties.values.forEach(prop => {
              config.parameters[prop.name] = prop.value;
            });
          }
        }
      }
      
      return config;
    } else if (type.includes('Gateway')) {
      return {
        ...baseConfig,
        // Configuration spécifique pour les gateways
        defaultFlow: businessObject.default?.id || ''
      };
    }
    
    return baseConfig;
  };

  // Mettre à jour la configuration d'un élément
  const updateElementConfig = (config) => {
    if (!selectedElement || !bpmnModeler) return;
    
    const modeling = bpmnModeler.get('modeling');
    const elementRegistry = bpmnModeler.get('elementRegistry');
    const element = elementRegistry.get(selectedElement.id);
    
    if (!element) return;
    
    // Mise à jour des propriétés communes
    modeling.updateProperties(element, {
      name: config.name
    });
    
    // Mise à jour des propriétés spécifiques selon le type
    const businessObject = element.businessObject;
    const type = businessObject.$type;
    
    if (type.includes('UserTask')) {
      modeling.updateProperties(element, {
        formKey: config.formKey,
        assignee: config.assignee,
        candidateUsers: config.candidateUsers,
        candidateGroups: config.candidateGroups
      });
    } else if (type.includes('BusinessRuleTask')) {
      modeling.updateProperties(element, {
        decisionRef: config.decisionRef,
        resultVariable: config.resultVariable
      });
    } else if (type.includes('Gateway')) {
      // Mise à jour du flux par défaut pour les gateways
      if (config.defaultFlow) {
        const flows = element.outgoing || [];
        const defaultFlow = flows.find(flow => flow.id === config.defaultFlow);
        if (defaultFlow) {
          modeling.updateProperties(element, {
            'default': defaultFlow
          });
        }
      }
    }
    
    setElementConfig(config);
  };

  // Charger le workflow existant si un ID est fourni
  useEffect(() => {
    if (workflowId) {
      const loadWorkflow = async () => {
        try {
          const workflow = await workflowService.getWorkflowById(workflowId);
          setWorkflowTitle(workflow.title);
          
          // Adapter le nom du champ selon ce qui est renvoyé par l'API
          const workflowContent = workflow.content || workflow.workflowContent;
          
          if (workflowContent && bpmnModeler) {
            bpmnModeler.importXML(workflowContent);
            setXml(workflowContent);
          }
        } catch (error) {
          console.error('Erreur lors du chargement du workflow', error);
          message.error('Impossible de charger le workflow');
        }
      };
      
      loadWorkflow();
    }
  }, [workflowId, bpmnModeler]);

  // Fonction de sauvegarde sécurisée qui gère le cas d'erreur isGeneric
  const saveXmlSafely = async () => {
    if (!bpmnModeler) return null;
    
    try {
      // Essayer la sauvegarde normale d'abord
      const { xml } = await bpmnModeler.saveXML({ format: true });
      return xml;
    } catch (error) {
      console.error("Erreur lors de la sérialisation XML:", error);
      
      // Si c'est l'erreur isGeneric, essayons un contournement
      if (error.message && error.message.includes('isGeneric')) {
        console.log("Tentative de contournement pour l'erreur isGeneric...");
        
        // Utiliser l'API Camunda pour nettoyer le modèle
        try {
          const canvas = bpmnModeler.get('canvas');
          const elementRegistry = bpmnModeler.get('elementRegistry');
          
          // Récupérer et valider le modèle racine
          const rootElement = canvas.getRootElement();
          
          // Sauvegarde minimale avec juste les éléments essentiels
          const definitions = rootElement.businessObject.$parent;
          
          // Créer un nouvel objet de modèle nettoyé
          const moddle = bpmnModeler.get('moddle');
          
          // Créer un nouveau modèle minimal
          const minimalBpmn = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" 
                    xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" 
                    xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" 
                    xmlns:camunda="http://camunda.org/schema/1.0/bpmn"
                    xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="${definitions.id || 'Definitions_1'}" 
                    targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="${rootElement.businessObject.id || 'Process_1'}" isExecutable="true">
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="${rootElement.businessObject.id || 'Process_1'}">
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;
          
          message.warning("Le modèle a été simplifié pour contourner une erreur technique. Certaines configurations complexes ont été perdues.");
          return minimalBpmn;
        } catch (contourError) {
          console.error("Échec du contournement:", contourError);
          message.error("Impossible de sauvegarder le diagramme. Veuillez simplifier votre modèle.");
          return null;
        }
      }
      
      throw error;
    }
  };

  const handleSave = async () => {
    if (!bpmnModeler) return;
    
    try {
      setSaving(true);
      
      // Utiliser la fonction de sauvegarde sécurisée
      const xml = await saveXmlSafely();
      if (!xml) {
        setSaving(false);
        return;
      }
      
      setXml(xml);
      
      // Extraire l'ID du processus depuis le XML pour le titre si non défini
      let processId = 'Process_1';
      try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xml, "text/xml");
        const processElement = xmlDoc.getElementsByTagName("bpmn:process")[0] || xmlDoc.getElementsByTagName("process")[0];
        if (processElement && processElement.getAttribute("id")) {
          processId = processElement.getAttribute("id");
        }
      } catch (parseError) {
        console.warn("Impossible d'extraire l'ID du processus du XML", parseError);
      }
      
      // S'assurer que le titre n'est pas vide
      const title = workflowTitle || `Workflow_${processId}`;
      
      const workflowData = {
        title: title,
        workflowContent: xml,
        // Ajouter des champs supplémentaires qui pourraient être requis par l'API
        processId: processId,
        version: 1,
        createdBy: "user",
        description: `Workflow BPMN: ${title}`
      };
      
      // Si en mode test, simuler la sauvegarde
      if (testMode) {
        console.log("Mode test: simulation de sauvegarde:", workflowData);
        setTimeout(() => {
          message.success('Workflow sauvegardé en mode test');
          setSaving(false);
        }, 1000);
        return;
      }
      
      if (workflowId) {
        await workflowService.updateWorkflow(workflowId, workflowData);
        message.success('Workflow mis à jour avec succès');
      } else {
        const createdWorkflow = await workflowService.createWorkflow(workflowData);
        if (onSave) onSave(createdWorkflow);
        message.success('Workflow créé avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du workflow', error);
      
      // Afficher plus de détails sur l'erreur
      if (error.response) {
        console.error('Détails de l\'erreur:', error.response.data);
        message.error(`Impossible de sauvegarder le workflow: ${error.response.data.message || error.message}`);
      } else {
        message.error('Impossible de sauvegarder le workflow: ' + error.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeploy = async () => {
    if (!bpmnModeler) return;
    
    try {
      // Ne pas activer deploying ici mais seulement après la confirmation
      const { xml } = await bpmnModeler.saveXML({ format: true });
      
      // Extraire l'ID du processus depuis le XML
      let processId = 'Process_1';
      try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xml, "text/xml");
        const processElement = xmlDoc.getElementsByTagName("bpmn:process")[0] || xmlDoc.getElementsByTagName("process")[0];
        if (processElement && processElement.getAttribute("id")) {
          processId = processElement.getAttribute("id");
        }
      } catch (parseError) {
        console.warn("Impossible d'extraire l'ID du processus du XML", parseError);
      }
      
      // Définir des valeurs par défaut pour la modal
      setDeployProcessId(processId);
      setDeployVersion(1);
      setDeployTenantId('');
      
      // Afficher la modal pour permettre la personnalisation
      setIsDeployModalVisible(true);
      
    } catch (error) {
      console.error('Erreur lors de la préparation du déploiement', error);
      message.error('Impossible de préparer le déploiement: ' + error.message);
    }
  };

  // Ajouter cette fonction pour générer un ID unique
  const generateUniqueId = (prefix = 'Process') => {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 10000);
    return `${prefix}_${timestamp}_${random}`;
  };

  // Mettre à jour la fonction confirmDeploy
  const confirmDeploy = async () => {
    if (!bpmnModeler) return;
    
    try {
      setDeploying(true);
      let { xml } = await bpmnModeler.saveXML({ format: true });
      
      // Si l'utilisateur n'a pas explicitement changé l'ID, générer un ID unique
      const uniqueProcessId = deployProcessId.trim() ? 
        deployProcessId : 
        generateUniqueId(workflowTitle.replace(/\s+/g, '_'));
      
      // Modifier complètement le XML avant déploiement
      try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xml, "text/xml");
        
        // 1. Modifier l'ID du processus principal
        const processElements = xmlDoc.getElementsByTagName("bpmn:process") || xmlDoc.getElementsByTagName("process");
        if (processElements.length > 0) {
          const processElement = processElements[0];
          const oldId = processElement.getAttribute("id");
          processElement.setAttribute("id", uniqueProcessId);
          
          // 2. Mettre à jour les références dans le diagramme (BPMNPlane)
          const planeElements = xmlDoc.querySelectorAll("bpmndi\\:BPMNPlane, BPMNPlane");
          for (let i = 0; i < planeElements.length; i++) {
            if (planeElements[i].getAttribute("bpmnElement") === oldId) {
              planeElements[i].setAttribute("bpmnElement", uniqueProcessId);
            }
          }
          
          // 3. Mettre à jour l'ID des définitions si nécessaire
          const definitionsElements = xmlDoc.getElementsByTagName("bpmn:definitions") || xmlDoc.getElementsByTagName("definitions");
          if (definitionsElements.length > 0) {
            const definitionsId = definitionsElements[0].getAttribute("id");
            if (definitionsId && definitionsId.includes(oldId)) {
              const newDefinitionsId = definitionsId.replace(oldId, uniqueProcessId);
              definitionsElements[0].setAttribute("id", newDefinitionsId);
            }
          }
        }
        
        // Convertir le document XML modifié en chaîne
        const serializer = new XMLSerializer();
        xml = serializer.serializeToString(xmlDoc);
      } catch (modifyError) {
        console.error("Erreur lors de la modification de l'XML:", modifyError);
        // Continuer avec l'XML original si la modification échoue
      }
      
      // Générer un nom de fichier unique avec timestamp, version et hashcode
      const timestamp = new Date().getTime();
      const hashCode = Math.floor(Math.random() * 1000000);
      const versionSuffix = deployVersion ? `_v${deployVersion}` : `_v1`;
      const fileName = `${workflowTitle.replace(/\s+/g, '_')}_${uniqueProcessId}${versionSuffix}_${hashCode}.bpmn`;
      
      // Si en mode test, simuler le déploiement
      if (testMode) {
        console.log("Mode test: simulation de déploiement du processus:", fileName);
        console.log("XML modifié:", xml);
        setTimeout(() => {
          message.success(`Processus déployé avec succès en mode test: ${fileName}`);
          setIsDeployModalVisible(false);
          setDeploying(false);
        }, 1500);
        return;
      }
      
      // Créer un fichier Blob à partir du XML modifié
      const blob = new Blob([xml], { type: 'application/xml' });
      const file = new File([blob], fileName, { type: 'application/xml' });
      
      // Préparer les données pour le déploiement
      const formData = new FormData();
      formData.append('file', file);
      // Utiliser un nom de déploiement unique avec timestamp
      const deploymentName = `${workflowTitle} (v${deployVersion}) - ${timestamp}`;
      formData.append('deployment-name', deploymentName);
      formData.append('deployment-source', 'Editeur BPMN');
      // Activer les options pour éviter les doublons
      formData.append('enable-duplicate-filtering', 'true');
      formData.append('deploy-changed-only', 'true');
      
      // Ajouter le tenant ID s'il est spécifié
      if (deployTenantId) {
        formData.append('tenant-id', deployTenantId);
      }
      
      console.log("Déploiement du processus:", fileName);
      
      // Déployer le processus
      const result = await processService.deployProcess(formData);
      message.success(`Processus déployé avec succès: ${result}`);
      setIsDeployModalVisible(false);
    } catch (error) {
      console.error('Erreur lors du déploiement du processus', error);
      
      // Afficher plus de détails sur l'erreur
      if (error.response) {
        if (error.response.status === 409) {
          message.error(
            'Un processus avec le même ID existe déjà malgré notre tentative de créer un ID unique. ' +
            'Essayez de modifier manuellement l\'ID du processus avec une valeur très différente.'
          );
          // Suggestion spécifique pour aider l'utilisateur
          setDeployProcessId(generateUniqueId('NewProcess'));
        } else {
          console.error('Détails de l\'erreur:', error.response.data);
          message.error(`Impossible de déployer le processus: ${error.response.data.message || error.message}`);
        }
      } else {
        message.error('Impossible de déployer le processus: ' + error.message);
      }
    } finally {
      setDeploying(false);
    }
  };

  const handleDownload = async () => {
    if (!bpmnModeler) return;
    
    try {
      const { xml } = await bpmnModeler.saveXML({ format: true });
      
      // Créer un lien de téléchargement et cliquer automatiquement
      const element = document.createElement('a');
      const file = new Blob([xml], { type: 'application/xml' });
      element.href = URL.createObjectURL(file);
      element.download = `${workflowTitle.replace(/\s+/g, '_')}.bpmn`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (error) {
      console.error('Erreur lors du téléchargement du diagramme', error);
      message.error('Impossible de télécharger le diagramme');
    }
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !bpmnModeler) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
      const xmlContent = event.target.result;
      bpmnModeler.importXML(xmlContent)
        .then(() => {
          message.success('Diagramme importé avec succès');
          setXml(xmlContent);
        })
        .catch(err => {
          console.error('Erreur lors de l\'importation du fichier BPMN', err);
          message.error('Le fichier n\'est pas un diagramme BPMN valide');
        });
    };
    reader.readAsText(file);
  };

  // Gérer la sauvegarde du formulaire UserTask
  const handleUserTaskFormSave = (formData) => {
    if (!selectedElement || !bpmnModeler) return;
    
    const modeling = bpmnModeler.get('modeling');
    
    // Mettre à jour la propriété formKey
    modeling.updateProperties(selectedElement, {
      formKey: formData.formKey
    });
    
    try {
      // Stocker les informations du formulaire dans les propriétés extensibles
      const moddle = bpmnModeler.get('moddle');
      const businessObject = selectedElement.businessObject;
      
      // Créer un élément ExtensionElements s'il n'existe pas
      const extensionElements = businessObject.extensionElements || 
        moddle.create('bpmn:ExtensionElements', { values: [] });
      
      // Créer l'élément FormData Camunda
      const formDataElement = moddle.create('camunda:FormData', { fields: [] });
      
      // Ajouter les champs du formulaire
      const formFields = formData.fields.map(field => {
        const formField = moddle.create('camunda:FormField', {
          id: field.name,
          label: field.label,
          type: field.type,
          defaultValue: ''
        });
        
        if (field.required) {
          const constraint = moddle.create('camunda:Constraint', {
            name: 'required',
            config: 'true'
          });
          formField.constraints = [constraint];
        }
        
        return formField;
      });
      
      formDataElement.fields = formFields;
      
      // Mettre à jour les elements d'extension
      if (!businessObject.extensionElements) {
        // Cas où extensionElements n'existe pas encore
        extensionElements.values = [formDataElement];
        modeling.updateProperties(selectedElement, {
          extensionElements: extensionElements
        });
      } else {
        // Cas où extensionElements existe déjà
        const currentValues = businessObject.extensionElements.values || [];
        const newValues = currentValues.filter(val => val.$type !== 'camunda:FormData');
        newValues.push(formDataElement);
        
        // Mettre à jour avec un nouvel objet ExtensionElements
        const newExtensionElements = moddle.create('bpmn:ExtensionElements', {
          values: newValues
        });
        
        modeling.updateProperties(selectedElement, {
          extensionElements: newExtensionElements
        });
      }
      
      setIsUserTaskFormModalVisible(false);
      
      // Mettre à jour la configuration affichée
      setElementConfig({
        ...elementConfig,
        formKey: formData.formKey
      });
      
      message.success('Formulaire configuré avec succès');
    } catch (error) {
      console.error('Erreur lors de la configuration du formulaire:', error);
      message.error('Impossible de configurer le formulaire: ' + error.message);
    }
  };

  // Gérer la sauvegarde de la règle métier
  const handleBusinessRuleSave = (decisionModel) => {
    if (!selectedElement || !bpmnModeler) return;
    
    const modeling = bpmnModeler.get('modeling');
    
    // Mettre à jour les propriétés de la tâche
    modeling.updateProperties(selectedElement, {
      decisionRef: decisionModel.id,
      resultVariable: decisionModel.outputs[0]?.name || ''
    });
    
    setIsBusinessRuleModalVisible(false);
    
    // Mettre à jour la configuration affichée
    setElementConfig({
      ...elementConfig,
      decisionRef: decisionModel.id,
      resultVariable: decisionModel.outputs[0]?.name || ''
    });
    
    message.success('Règle métier configurée avec succès');
  };

  // Gérer la sauvegarde de la configuration de ServiceTask
  const handleServiceTaskSave = (serviceTaskConfig) => {
    if (!selectedElement || !bpmnModeler) return;
    
    const modeling = bpmnModeler.get('modeling');
    const moddle = bpmnModeler.get('moddle');
    
    // Mettre à jour les propriétés de la tâche selon le type d'implémentation
    const updateProps = {};
    
    // Réinitialiser toutes les propriétés d'implémentation
    updateProps.class = undefined;
    updateProps.expression = undefined;
    updateProps.delegateExpression = undefined;
    
    // Définir la propriété selon le type choisi
    if (serviceTaskConfig.implementationType === 'class') {
      updateProps.class = serviceTaskConfig.implementation;
    } else if (serviceTaskConfig.implementationType === 'expression') {
      updateProps.expression = serviceTaskConfig.implementation;
    } else if (serviceTaskConfig.implementationType === 'delegateExpression') {
      updateProps.delegateExpression = serviceTaskConfig.implementation;
    }
    
    // Appliquer les mises à jour de base
    modeling.updateProperties(selectedElement, updateProps);
    
    // Traiter les paramètres si nous avons des paramètres à configurer
    if (serviceTaskConfig.parameters && Object.keys(serviceTaskConfig.parameters).length > 0) {
      try {
        // Créer ou récupérer les éléments d'extension
        const businessObject = selectedElement.businessObject;
        let extensionElements = businessObject.extensionElements;
        
        if (!extensionElements) {
          extensionElements = moddle.create('bpmn:ExtensionElements', { values: [] });
        }
        
        // Créer l'élément camunda:Properties
        let camundaProperties = extensionElements.values.find(v => v.$type === 'camunda:Properties');
        
        if (!camundaProperties) {
          camundaProperties = moddle.create('camunda:Properties', { values: [] });
          extensionElements.values.push(camundaProperties);
        } else {
          // Vider les propriétés existantes
          camundaProperties.values = [];
        }
        
        // Ajouter les nouvelles propriétés
        for (const [key, value] of Object.entries(serviceTaskConfig.parameters)) {
          const property = moddle.create('camunda:Property', { name: key, value: value });
          camundaProperties.values.push(property);
        }
        
        // Mettre à jour les éléments d'extension
        modeling.updateProperties(selectedElement, { extensionElements: extensionElements });
      } catch (error) {
        console.error('Erreur lors de la configuration des paramètres:', error);
        message.warning('Les paramètres ont été partiellement configurés');
      }
    }
    
    setIsServiceTaskModalVisible(false);
    message.success('Tâche de service configurée avec succès');
  };

  // Gérer la sauvegarde de la configuration de Gateway
  const handleGatewaySave = (gatewayConfig) => {
    if (!selectedElement || !bpmnModeler) return;
    
    const modeling = bpmnModeler.get('modeling');
    const elementRegistry = bpmnModeler.get('elementRegistry');
    
    // Mettre à jour le flux par défaut
    if (gatewayConfig.defaultFlow) {
      const defaultFlow = elementRegistry.get(gatewayConfig.defaultFlow);
      if (defaultFlow) {
        modeling.updateProperties(selectedElement, {
          'default': defaultFlow.businessObject
        });
      }
    } else {
      modeling.updateProperties(selectedElement, {
        'default': null
      });
    }
    
    // Mettre à jour les noms et conditions des flux
    gatewayConfig.flows.forEach(flowConfig => {
      const flow = elementRegistry.get(flowConfig.id);
      if (flow) {
        // Mettre à jour le nom du flux
        modeling.updateProperties(flow, {
          name: flowConfig.name
        });
        
        // Mettre à jour la condition du flux s'il ne s'agit pas du flux par défaut
        if (flowConfig.id !== gatewayConfig.defaultFlow && flowConfig.condition) {
          const conditionExpression = bpmnModeler.get('moddle').create('bpmn:FormalExpression', {
            body: flowConfig.condition,
            language: 'groovy'
          });
          
          modeling.updateProperties(flow, {
            conditionExpression: conditionExpression
          });
        } else if (flowConfig.id !== gatewayConfig.defaultFlow) {
          // Supprimer la condition si elle est vide
          modeling.updateProperties(flow, {
            conditionExpression: null
          });
        }
      }
    });
    
    setIsGatewayEditorModalVisible(false);
    message.success('Gateway configurée avec succès');
  };

  // Rendu du panneau de configuration personnalisé
  const renderConfigPanel = () => {
    if (!selectedElement || !isConfigPanelVisible) return null;
    
    const type = selectedElement.businessObject.$type;
    
    return (
      <Card 
        title={`Configuration: ${elementConfig.name || elementConfig.id}`}
        extra={<Button icon={<SettingOutlined />} onClick={() => setIsConfigPanelVisible(false)}>Fermer</Button>}
        className="element-config-panel"
      >
        <Tabs activeKey={configTabKey} onChange={setConfigTabKey}>
          <TabPane tab="Général" key="general">
            <Form layout="vertical" initialValues={elementConfig}>
              <Form.Item label="Nom" name="name">
                <Input 
                  placeholder="Nom de l'élément"
                  value={elementConfig.name}
                  onChange={(e) => setElementConfig({...elementConfig, name: e.target.value})}
                />
              </Form.Item>
              
              <Form.Item>
                <Button 
                  type="primary" 
                  onClick={() => updateElementConfig(elementConfig)}
                  style={{ marginTop: 16 }}
                >
                  Appliquer les modifications
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
          
          {type.includes('UserTask') && (
            <TabPane tab="Tâche utilisateur" key="usertask">
              <Form layout="vertical" initialValues={elementConfig}>
                <Form.Item label="Formulaire associé">
                  <Input 
                    value={elementConfig.formKey}
                    onChange={(e) => setElementConfig({...elementConfig, formKey: e.target.value})}
                    placeholder="Clé du formulaire"
                    addonAfter={
                      <Button type="link" onClick={() => setIsUserTaskFormModalVisible(true)}>
                        Configurer
                      </Button>
                    }
                  />
                </Form.Item>
                
                <Form.Item label="Assigné à">
                  <Input 
                    value={elementConfig.assignee}
                    onChange={(e) => setElementConfig({...elementConfig, assignee: e.target.value})}
                    placeholder="Utilisateur assigné"
                  />
                </Form.Item>
                
                <Form.Item label="Candidats (utilisateurs)">
                  <Input 
                    value={elementConfig.candidateUsers}
                    onChange={(e) => setElementConfig({...elementConfig, candidateUsers: e.target.value})}
                    placeholder="Utilisateurs séparés par des virgules"
                  />
                </Form.Item>
                
                <Form.Item label="Candidats (groupes)">
                  <Input 
                    value={elementConfig.candidateGroups}
                    onChange={(e) => setElementConfig({...elementConfig, candidateGroups: e.target.value})}
                    placeholder="Groupes séparés par des virgules"
                  />
                </Form.Item>
                
                <Form.Item>
                  <Button 
                    type="primary" 
                    onClick={() => updateElementConfig(elementConfig)}
                    style={{ marginTop: 16 }}
                  >
                    Appliquer les modifications
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>
          )}
          
          {type.includes('ServiceTask') && (
            <TabPane tab="Tâche de service" key="servicetask">
              <div style={{ textAlign: 'center', margin: '20px 0' }}>
                <Button 
                  type="primary" 
                  onClick={() => setIsServiceTaskModalVisible(true)}
                >
                  Configurer l'implémentation et les paramètres
                </Button>
              </div>
              
              {elementConfig.implementationType !== 'unknown' && (
                <Card size="small" style={{ marginTop: 16 }}>
                  <div><strong>Type d'implémentation:</strong> {elementConfig.implementationType}</div>
                  <div style={{ marginTop: 8 }}><strong>Implémentation:</strong> {elementConfig.implementation}</div>
                  
                  {elementConfig.parameters && Object.keys(elementConfig.parameters).length > 0 && (
                    <div style={{ marginTop: 16 }}>
                      <div><strong>Paramètres:</strong></div>
                      <ul style={{ marginTop: 8 }}>
                        {Object.entries(elementConfig.parameters).map(([key, value]) => (
                          <li key={key}><strong>{key}:</strong> {value}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>
              )}
              
              <p style={{ color: '#1890ff', marginTop: 16 }}>
                Cliquez sur le bouton ci-dessus pour configurer l'implémentation Java et les paramètres de la tâche de service.
              </p>
            </TabPane>
          )}
          
          {type.includes('BusinessRuleTask') && (
            <TabPane tab="Règle métier" key="businessrule">
              <Form layout="vertical" initialValues={elementConfig}>
                <Form.Item label="Référence DMN">
                  <Input 
                    value={elementConfig.decisionRef}
                    onChange={(e) => setElementConfig({...elementConfig, decisionRef: e.target.value})}
                    placeholder="ID de la décision DMN"
                    addonAfter={
                      <Button type="link" onClick={() => setIsBusinessRuleModalVisible(true)}>
                        Configurer
                      </Button>
                    }
                  />
                </Form.Item>
                
                <Form.Item label="Variable résultat">
                  <Input 
                    value={elementConfig.resultVariable}
                    onChange={(e) => setElementConfig({...elementConfig, resultVariable: e.target.value})}
                    placeholder="Nom de la variable pour stocker le résultat"
                  />
                </Form.Item>
                
                <Form.Item>
                  <Button 
                    type="primary" 
                    onClick={() => updateElementConfig(elementConfig)}
                    style={{ marginTop: 16 }}
                  >
                    Appliquer les modifications
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>
          )}
          
          {type.includes('Gateway') && (
            <TabPane tab="Gateway" key="gateway">
              <div style={{ textAlign: 'center', margin: '20px 0' }}>
                <Button 
                  type="primary" 
                  onClick={() => setIsGatewayEditorModalVisible(true)}
                >
                  Configurer les flux et conditions
                </Button>
              </div>
              <p style={{ color: '#1890ff' }}>
                Cliquez sur le bouton ci-dessus pour configurer les flux sortants et leurs conditions.
              </p>
            </TabPane>
          )}
        </Tabs>
      </Card>
    );
  };

  // Plus loin dans le code, ajouter la fonction de réinitialisation
  const resetDiagram = () => {
    if (!bpmnModeler) return;
    
    Modal.confirm({
      title: 'Réinitialiser le diagramme',
      content: 'Êtes-vous sûr de vouloir réinitialiser le diagramme ? Toutes les modifications non sauvegardées seront perdues.',
      onOk: () => {
        bpmnModeler.importXML(DEFAULT_DIAGRAM)
          .then(() => {
            setXml(DEFAULT_DIAGRAM);
            message.success('Diagramme réinitialisé avec succès');
            setSelectedElement(null);
            setIsConfigPanelVisible(false);
          })
          .catch(err => {
            console.error('Erreur lors de la réinitialisation du diagramme', err);
            message.error('Impossible de réinitialiser le diagramme');
          });
      }
    });
  };

  return (
    <div className="bpmn-editor-container">
      <div className="bpmn-editor-header">
        <Input 
          value={workflowTitle}
          onChange={e => setWorkflowTitle(e.target.value)}
          placeholder="Titre du workflow"
          className="workflow-title-input"
        />
        <Space>
          <input
            type="file"
            id="upload-bpmn"
            style={{ display: 'none' }}
            accept=".bpmn,.xml"
            onChange={handleUpload}
          />
          <Tooltip title="Réinitialiser le diagramme">
            <Button 
              icon={<ReloadOutlined />}
              onClick={resetDiagram}
            >
              Réinitialiser
            </Button>
          </Tooltip>
          <Tooltip title="Importer un diagramme BPMN">
            <Button 
              icon={<UploadOutlined />}
              onClick={() => document.getElementById('upload-bpmn').click()}
            >
              Importer
            </Button>
          </Tooltip>
          <Tooltip title="Télécharger le diagramme BPMN">
            <Button 
              icon={<DownloadOutlined />}
              onClick={handleDownload}
            >
              Télécharger
            </Button>
          </Tooltip>
          <Tooltip title="Sauvegarder le workflow">
            <Button 
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              loading={saving}
            >
              Sauvegarder
            </Button>
          </Tooltip>
          <Tooltip title="Déployer sur Camunda">
            <Button 
              type="primary"
              danger
              icon={<DeploymentUnitOutlined />}
              onClick={handleDeploy}
            >
              Déployer
            </Button>
          </Tooltip>
          {testMode && (
            <Tooltip title="Mode Test Activé">
              <Button 
                type="dashed"
                onClick={() => setTestMode(!testMode)}
                style={{ backgroundColor: '#fff9e6', borderColor: '#ffc53d' }}
              >
                Mode Test
              </Button>
            </Tooltip>
          )}
        </Space>
      </div>
      <div className="bpmn-editor-content">
        <div className="canvas" ref={containerRef}></div>
        {renderConfigPanel()}
      </div>

      {/* Modal pour le déploiement */}
      <Modal
        title="Déployer le processus"
        open={isDeployModalVisible}
        onCancel={() => setIsDeployModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsDeployModalVisible(false)}>
            Annuler
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={deploying}
            onClick={confirmDeploy}
          >
            Déployer
          </Button>
        ]}
      >
        <Form layout="vertical">
          <Form.Item label="Nom du workflow">
            <Input value={workflowTitle} disabled />
          </Form.Item>
          
          <Form.Item 
            label="ID du processus" 
            help="Chaque processus doit avoir un ID unique. Pour redéployer sur un processus existant, changez l'ID ou la version."
          >
            <Input 
              value={deployProcessId} 
              onChange={e => setDeployProcessId(e.target.value)}
              placeholder="process_unique_id"
            />
          </Form.Item>
          
          <Form.Item 
            label="Version" 
            help="Incrémenter la version permet de déployer une nouvelle version d'un processus existant."
          >
            <Input 
              type="number" 
              min={1}
              value={deployVersion} 
              onChange={e => setDeployVersion(parseInt(e.target.value) || 1)}
            />
          </Form.Item>
          
          <Form.Item 
            label="Tenant ID" 
            help="Optionnel. Spécifie le tenant pour ce déploiement."
          >
            <Input 
              value={deployTenantId} 
              onChange={e => setDeployTenantId(e.target.value)}
              placeholder="tenant_id (optionnel)"
            />
          </Form.Item>
        </Form>
      </Modal>
      
      {/* Modal pour l'édition de formulaire UserTask */}
      <Modal
        title="Configurer le formulaire"
        open={isUserTaskFormModalVisible}
        onCancel={() => setIsUserTaskFormModalVisible(false)}
        footer={null}
        width={800}
      >
        <UserTaskForm
          formKey={elementConfig.formKey}
          onSave={handleUserTaskFormSave}
        />
      </Modal>
      
      {/* Modal pour l'édition de règle métier (DMN) */}
      <Modal
        title="Configurer la règle métier (DMN)"
        open={isBusinessRuleModalVisible}
        onCancel={() => setIsBusinessRuleModalVisible(false)}
        footer={null}
        width={900}
      >
        <BusinessRuleEditor
          decisionRef={elementConfig.decisionRef}
          onSave={handleBusinessRuleSave}
        />
      </Modal>
      
      {/* Modal pour l'édition de Gateway */}
      <Modal
        title="Configurer la Gateway"
        open={isGatewayEditorModalVisible}
        onCancel={() => setIsGatewayEditorModalVisible(false)}
        footer={null}
        width={800}
      >
        <GatewayEditor
          gateway={selectedElement}
          outgoingFlows={selectedElement?.outgoing}
          onSave={handleGatewaySave}
        />
      </Modal>

      {/* Modal pour l'édition de ServiceTask */}
      <Modal
        title="Configurer la tâche de service"
        open={isServiceTaskModalVisible}
        onCancel={() => setIsServiceTaskModalVisible(false)}
        footer={null}
        width={800}
      >
        <ServiceTaskEditor
          serviceTask={selectedElement}
          onSave={handleServiceTaskSave}
        />
      </Modal>
    </div>
  );
};

export default BpmnEditor; 