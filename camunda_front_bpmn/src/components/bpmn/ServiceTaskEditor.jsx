import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Select, Button, Alert, Spin, message, Divider, Space, Typography, Collapse } from 'antd';
import { SettingOutlined, CodeOutlined, ApiOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;
const { Panel } = Collapse;
const { Title } = Typography;

// Simuler un service pour récupérer les JavaDelegates disponibles
// Ce service devrait être remplacé par un vrai appel API
const fetchJavaDelegates = async () => {
  // Simulation d'un appel API
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { 
          id: 'notificationDelegate', 
          name: 'NotificationDelegate', 
          description: 'Envoie une notification par email ou SMS',
          parameters: [
            { name: 'to', type: 'string', required: true, description: 'Destinataire' },
            { name: 'subject', type: 'string', required: true, description: 'Sujet' },
            { name: 'body', type: 'string', required: true, description: 'Contenu' },
            { name: 'type', type: 'string', required: false, description: 'Type (email/sms)', defaultValue: 'email' }
          ]
        },
        { 
          id: 'dataProcessorDelegate', 
          name: 'DataProcessorDelegate', 
          description: 'Traite des données selon les règles configurées',
          parameters: [
            { name: 'inputVariable', type: 'string', required: true, description: 'Variable d\'entrée' },
            { name: 'outputVariable', type: 'string', required: true, description: 'Variable de sortie' },
            { name: 'operation', type: 'string', required: true, description: 'Opération (transform/validate/calculate)' }
          ]
        },
        { 
          id: 'apiConnectorDelegate', 
          name: 'ApiConnectorDelegate', 
          description: 'Appelle un service API externe',
          parameters: [
            { name: 'url', type: 'string', required: true, description: 'URL de l\'API' },
            { name: 'method', type: 'string', required: true, description: 'Méthode HTTP (GET/POST/PUT/DELETE)' },
            { name: 'payload', type: 'string', required: false, description: 'Données à envoyer (JSON)' },
            { name: 'headers', type: 'string', required: false, description: 'En-têtes HTTP (JSON)' },
            { name: 'resultVariable', type: 'string', required: true, description: 'Variable pour stocker le résultat' }
          ]
        }
      ]);
    }, 1000);
  });
};

const ServiceTaskEditor = ({ serviceTask, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [javaDelegates, setJavaDelegates] = useState([]);
  const [selectedDelegate, setSelectedDelegate] = useState(null);
  const [delegateParams, setDelegateParams] = useState({});
  const [implementationType, setImplementationType] = useState('delegateExpression');
  const [customImplementation, setCustomImplementation] = useState('');
  
  useEffect(() => {
    const loadJavaDelegates = async () => {
      setLoading(true);
      try {
        const delegates = await fetchJavaDelegates();
        setJavaDelegates(delegates);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des JavaDelegates:', error);
        message.error('Impossible de charger les implémentations disponibles');
        setLoading(false);
      }
    };
    
    loadJavaDelegates();
  }, []);
  
  useEffect(() => {
    if (serviceTask && serviceTask.businessObject) {
      // Extraire la configuration existante de la tâche de service
      const businessObject = serviceTask.businessObject;
      
      // Déterminer le type d'implémentation
      if (businessObject.delegateExpression) {
        setImplementationType('delegateExpression');
        const delegateRef = businessObject.delegateExpression.replace('${', '').replace('}', '');
        
        // Trouver le delegate correspondant dans la liste
        const delegate = javaDelegates.find(d => d.id === delegateRef);
        if (delegate) {
          setSelectedDelegate(delegate.id);
          
          // Extraire les paramètres existants
          const extensionElements = businessObject.extensionElements;
          if (extensionElements && extensionElements.values) {
            const camundaProperties = extensionElements.values.find(
              v => v.$type === 'camunda:Properties'
            );
            
            if (camundaProperties && camundaProperties.values) {
              const params = {};
              camundaProperties.values.forEach(prop => {
                params[prop.name] = prop.value;
              });
              setDelegateParams(params);
            }
          }
        }
      } else if (businessObject.class) {
        setImplementationType('class');
        setCustomImplementation(businessObject.class);
      } else if (businessObject.expression) {
        setImplementationType('expression');
        setCustomImplementation(businessObject.expression);
      }
    }
  }, [serviceTask, javaDelegates]);
  
  const handleDelegateChange = (delegateId) => {
    setSelectedDelegate(delegateId);
    // Réinitialiser les paramètres
    setDelegateParams({});
    
    // Initialiser avec les valeurs par défaut si disponibles
    const delegate = javaDelegates.find(d => d.id === delegateId);
    if (delegate) {
      const defaultParams = {};
      delegate.parameters.forEach(param => {
        if (param.defaultValue) {
          defaultParams[param.name] = param.defaultValue;
        }
      });
      setDelegateParams(defaultParams);
    }
  };
  
  const handleParamChange = (paramName, value) => {
    setDelegateParams(prev => ({
      ...prev,
      [paramName]: value
    }));
  };
  
  const handleImplementationTypeChange = (type) => {
    setImplementationType(type);
    // Réinitialiser la configuration si nécessaire
    if (type !== 'delegateExpression') {
      setSelectedDelegate(null);
      setDelegateParams({});
    }
    if (type !== 'class' && type !== 'expression') {
      setCustomImplementation('');
    }
  };
  
  const handleSave = () => {
    // Validation en fonction du type d'implémentation
    if (implementationType === 'delegateExpression' && !selectedDelegate) {
      message.error('Veuillez sélectionner un JavaDelegate');
      return;
    }
    
    if ((implementationType === 'class' || implementationType === 'expression') && !customImplementation) {
      message.error('Veuillez spécifier une implémentation');
      return;
    }
    
    // Validation des paramètres obligatoires pour le delegate sélectionné
    if (implementationType === 'delegateExpression' && selectedDelegate) {
      const delegate = javaDelegates.find(d => d.id === selectedDelegate);
      if (delegate) {
        const missingParams = delegate.parameters
          .filter(p => p.required && (!delegateParams[p.name] || delegateParams[p.name].trim() === ''))
          .map(p => p.name);
        
        if (missingParams.length > 0) {
          message.error(`Paramètres obligatoires manquants: ${missingParams.join(', ')}`);
          return;
        }
      }
    }
    
    // Construction de la configuration
    const serviceTaskConfig = {
      implementationType,
      implementation: 
        implementationType === 'delegateExpression' 
          ? `\${${selectedDelegate}}` 
          : customImplementation,
      parameters: delegateParams
    };
    
    // Appeler la fonction de sauvegarde
    if (onSave) {
      onSave(serviceTaskConfig);
      message.success('Configuration de la tâche de service enregistrée');
    }
  };
  
  // Affichage des paramètres pour le delegate sélectionné
  const renderDelegateParams = () => {
    if (!selectedDelegate) return null;
    
    const delegate = javaDelegates.find(d => d.id === selectedDelegate);
    if (!delegate) return null;
    
    return (
      <Card title="Paramètres" style={{ marginTop: 16 }}>
        {delegate.parameters.map(param => (
          <Form.Item 
            key={param.name}
            label={`${param.name}${param.required ? ' *' : ''}`} 
            help={param.description}
          >
            <Input
              value={delegateParams[param.name] || ''}
              onChange={(e) => handleParamChange(param.name, e.target.value)}
              placeholder={param.defaultValue || `Valeur pour ${param.name}`}
            />
          </Form.Item>
        ))}
      </Card>
    );
  };
  
  if (loading) {
    return <Spin tip="Chargement des implémentations disponibles..." />;
  }
  
  return (
    <div className="service-task-editor">
      <Divider orientation="left">Configuration de la tâche de service</Divider>
      
      <Card title="Type d'implémentation">
        <Select
          style={{ width: '100%' }}
          value={implementationType}
          onChange={handleImplementationTypeChange}
        >
          <Option value="delegateExpression">JavaDelegate (Expression de délégation)</Option>
          <Option value="class">Classe Java</Option>
          <Option value="expression">Expression</Option>
        </Select>
      </Card>
      
      {implementationType === 'delegateExpression' && (
        <>
          <Card title="Sélection du JavaDelegate" style={{ marginTop: 16 }}>
            <Select
              style={{ width: '100%' }}
              placeholder="Sélectionner un JavaDelegate"
              value={selectedDelegate}
              onChange={handleDelegateChange}
            >
              {javaDelegates.map(delegate => (
                <Option key={delegate.id} value={delegate.id}>
                  {delegate.name} - {delegate.description}
                </Option>
              ))}
            </Select>
            
            {selectedDelegate && (
              <Alert
                style={{ marginTop: 16 }}
                message={`Implémentation: \${${selectedDelegate}}`}
                description={javaDelegates.find(d => d.id === selectedDelegate)?.description}
                type="info"
                showIcon
              />
            )}
          </Card>
          
          {renderDelegateParams()}
        </>
      )}
      
      {(implementationType === 'class' || implementationType === 'expression') && (
        <Card title={`Implémentation (${implementationType === 'class' ? 'Classe Java' : 'Expression'})`} style={{ marginTop: 16 }}>
          <TextArea
            value={customImplementation}
            onChange={(e) => setCustomImplementation(e.target.value)}
            placeholder={
              implementationType === 'class' 
                ? 'com.example.MaClasse' 
                : '${monService.executerAction(variable)}'
            }
            rows={4}
          />
          <Alert
            style={{ marginTop: 16 }}
            message="Information"
            description={
              implementationType === 'class' 
                ? "Spécifiez le nom complet de la classe Java qui implémente JavaDelegate." 
                : "Entrez une expression qui sera évaluée. Elle peut contenir des références à des beans Spring et des variables de processus."
            }
            type="info"
            showIcon
          />
        </Card>
      )}
      
      <Collapse style={{ marginTop: 16 }}>
        <Panel header="Informations sur l'utilisation des variables de processus" key="1">
          <p>
            Dans les expressions et les paramètres, vous pouvez référencer des variables de processus avec la syntaxe <code>{'${nomVariable}'}</code>.
          </p>
          <p>
            <strong>Exemples:</strong>
            <ul>
              <li><code>{'to: ${email}'}</code> - Utilise la variable 'email' comme destinataire</li>
              <li><code>{'body: Bonjour ${nom}, votre commande #${numeroCommande} a été traitée.'}</code> - Intègre des variables dans un texte</li>
              <li><code>{'url: https://api.exemple.com/users/${userId}'}</code> - Construit une URL dynamique</li>
            </ul>
          </p>
        </Panel>
      </Collapse>
      
      <div style={{ marginTop: 16, textAlign: 'right' }}>
        <Button type="primary" onClick={handleSave} icon={<SettingOutlined />}>
          Enregistrer la configuration
        </Button>
      </div>
    </div>
  );
};

export default ServiceTaskEditor; 