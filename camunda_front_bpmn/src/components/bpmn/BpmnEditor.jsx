import React, { useEffect, useRef, useState } from 'react';
import BpmnJS from 'bpmn-js/lib/Modeler';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda.json';
import { Button, message, Modal, Input, Space, Tooltip, Card, Tabs, Form, Select, Radio, Collapse } from 'antd';
import { SaveOutlined, DeploymentUnitOutlined, DownloadOutlined, UploadOutlined, SettingOutlined } from '@ant-design/icons';
import workflowService from '../../services/workflowService';
import processService from '../../services/processService';
import UserTaskForm from './UserTaskForm';
import BusinessRuleEditor from './BusinessRuleEditor';
import GatewayEditor from './GatewayEditor';

import './BpmnEditor.css';

// Configuration du mode test
const TEST_MODE = process.env.REACT_APP_TEST_MODE === 'true' || false;

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
  const { Panel } = Collapse;
  const { TabPane } = Tabs;
  const [testMode, setTestMode] = useState(TEST_MODE);

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
      return {
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
          
          if (workflow.workflowContent && bpmnModeler) {
            bpmnModeler.importXML(workflow.workflowContent);
            setXml(workflow.workflowContent);
          }
        } catch (error) {
          console.error('Erreur lors du chargement du workflow', error);
          message.error('Impossible de charger le workflow');
        }
      };
      
      loadWorkflow();
    }
  }, [workflowId, bpmnModeler]);

  const handleSave = async () => {
    if (!bpmnModeler) return;
    
    try {
      setSaving(true);
      const { xml } = await bpmnModeler.saveXML({ format: true });
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
      
      console.log("Sauvegarde du workflow avec les données:", workflowData);
      
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
      setDeploying(true);
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
      
      // Générer un nom de fichier unique avec timestamp pour éviter les conflits
      const timestamp = new Date().getTime();
      const fileName = `${workflowTitle.replace(/\s+/g, '_')}_${processId}_v${timestamp}.bpmn`;
      
      // Si en mode test, simuler le déploiement
      if (testMode) {
        console.log("Mode test: simulation de déploiement du processus:", fileName);
        setTimeout(() => {
          message.success(`Processus déployé avec succès en mode test: ${fileName}`);
          setIsDeployModalVisible(false);
          setDeploying(false);
        }, 1500);
        return;
      }
      
      // Créer un fichier Blob à partir du XML
      const blob = new Blob([xml], { type: 'application/xml' });
      const file = new File([blob], fileName, { type: 'application/xml' });
      
      // Préparer les données pour le déploiement
      const formData = new FormData();
      formData.append('file', file);
      formData.append('deployment-name', workflowTitle);
      formData.append('deployment-source', 'Editeur BPMN');
      formData.append('tenant-id', ''); // Facultatif: tenant ID si nécessaire
      
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
          message.error('Un processus avec le même ID existe déjà. Veuillez modifier l\'ID du processus ou créer une nouvelle version.');
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
    
    // Stocker les informations du formulaire dans les propriétés extensibles
    // Ceci permettrait de récupérer la définition complète du formulaire plus tard
    const businessObject = selectedElement.businessObject;
    const extensionElements = businessObject.extensionElements || bpmnModeler.get('moddle').create('bpmn:ExtensionElements');
    
    // Créer un élément Camunda pour stocker les données du formulaire
    const formDataElement = bpmnModeler.get('moddle').create('camunda:FormData');
    formDataElement.fields = formData.fields.map(field => {
      const formField = bpmnModeler.get('moddle').create('camunda:FormField');
      formField.id = field.name;
      formField.label = field.label;
      formField.type = field.type;
      formField.defaultValue = '';
      
      if (field.required) {
        const constraint = bpmnModeler.get('moddle').create('camunda:Constraint');
        constraint.name = 'required';
        constraint.config = 'true';
        formField.constraints = [constraint];
      }
      
      return formField;
    });
    
    // Remplacer ou ajouter l'élément formData
    if (!businessObject.extensionElements) {
      extensionElements.values = [formDataElement];
      modeling.updateProperties(selectedElement, {
        extensionElements: extensionElements
      });
    } else {
      // Filtrer les éléments existants pour supprimer tout FormData précédent
      const values = businessObject.extensionElements.values.filter(
        value => value.$type !== 'camunda:FormData'
      );
      values.push(formDataElement);
      modeling.updateProperties(selectedElement, {
        extensionElements: { values }
      });
    }
    
    setIsUserTaskFormModalVisible(false);
    
    // Mettre à jour la configuration affichée
    setElementConfig({
      ...elementConfig,
      formKey: formData.formKey
    });
    
    message.success('Formulaire configuré avec succès');
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
              onClick={() => setIsDeployModalVisible(true)}
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
            onClick={handleDeploy}
          >
            Déployer
          </Button>
        ]}
      >
        <p>Êtes-vous sûr de vouloir déployer ce processus sur le moteur Camunda ?</p>
        <p>Nom du processus: {workflowTitle}</p>
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
    </div>
  );
};

export default BpmnEditor; 