import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Select, Row, Col, Card, Divider, Space, message, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const { Option } = Select;

const BusinessRuleEditor = ({ decisionRef, onSave }) => {
  const [decisionName, setDecisionName] = useState(decisionRef || 'Decision_1');
  const [inputs, setInputs] = useState([]);
  const [outputs, setOutputs] = useState([]);
  const [rules, setRules] = useState([]);
  
  useEffect(() => {
    // Simuler le chargement de données existantes si decisionRef est fourni
    if (decisionRef) {
      // Exemple de données pour démontrer la structure
      setInputs([
        { id: '1', name: 'age', type: 'integer', label: 'Âge' },
        { id: '2', name: 'status', type: 'string', label: 'Statut du client' }
      ]);
      
      setOutputs([
        { id: '1', name: 'approved', type: 'boolean', label: 'Approuvé' },
        { id: '2', name: 'interest', type: 'double', label: 'Taux d\'intérêt' }
      ]);
      
      setRules([
        { 
          id: '1', 
          conditions: { age: '>= 18 && <= 30', status: 'in ["GOLD", "SILVER"]' },
          results: { approved: 'true', interest: '5.5' }
        },
        { 
          id: '2', 
          conditions: { age: '> 30 && <= 50', status: 'in ["GOLD"]' },
          results: { approved: 'true', interest: '4.5' }
        },
        { 
          id: '3', 
          conditions: { age: '> 50', status: 'any' },
          results: { approved: 'false', interest: '0' }
        }
      ]);
    } else {
      // Initialiser avec des entrées/sorties vides par défaut
      setInputs([{ id: '1', name: '', type: 'string', label: '' }]);
      setOutputs([{ id: '1', name: '', type: 'string', label: '' }]);
      setRules([]);
    }
  }, [decisionRef]);
  
  const handleAddInput = () => {
    setInputs([...inputs, { 
      id: Date.now().toString(), 
      name: '', 
      type: 'string',
      label: ''
    }]);
  };
  
  const handleAddOutput = () => {
    setOutputs([...outputs, { 
      id: Date.now().toString(), 
      name: '', 
      type: 'string',
      label: ''
    }]);
  };
  
  const handleInputChange = (id, key, value) => {
    setInputs(inputs.map(input => {
      if (input.id === id) {
        return { ...input, [key]: value };
      }
      return input;
    }));
  };
  
  const handleOutputChange = (id, key, value) => {
    setOutputs(outputs.map(output => {
      if (output.id === id) {
        return { ...output, [key]: value };
      }
      return output;
    }));
  };
  
  const handleRemoveInput = (id) => {
    setInputs(inputs.filter(input => input.id !== id));
    // Mettre à jour les règles pour supprimer les références à cet input
    const inputToRemove = inputs.find(input => input.id === id);
    if (inputToRemove) {
      setRules(rules.map(rule => {
        const { [inputToRemove.name]: removed, ...restConditions } = rule.conditions;
        return { ...rule, conditions: restConditions };
      }));
    }
  };
  
  const handleRemoveOutput = (id) => {
    setOutputs(outputs.filter(output => output.id !== id));
    // Mettre à jour les règles pour supprimer les références à cet output
    const outputToRemove = outputs.find(output => output.id === id);
    if (outputToRemove) {
      setRules(rules.map(rule => {
        const { [outputToRemove.name]: removed, ...restResults } = rule.results;
        return { ...rule, results: restResults };
      }));
    }
  };
  
  const handleAddRule = () => {
    // Créer une nouvelle règle avec des conditions vides pour chaque input et des résultats vides pour chaque output
    const newConditions = {};
    inputs.forEach(input => {
      if (input.name) {
        newConditions[input.name] = '';
      }
    });
    
    const newResults = {};
    outputs.forEach(output => {
      if (output.name) {
        newResults[output.name] = '';
      }
    });
    
    setRules([...rules, { 
      id: Date.now().toString(), 
      conditions: newConditions,
      results: newResults
    }]);
  };
  
  const handleRuleChange = (ruleId, type, name, value) => {
    setRules(rules.map(rule => {
      if (rule.id === ruleId) {
        if (type === 'condition') {
          return { ...rule, conditions: { ...rule.conditions, [name]: value } };
        } else if (type === 'result') {
          return { ...rule, results: { ...rule.results, [name]: value } };
        }
      }
      return rule;
    }));
  };
  
  const handleRemoveRule = (id) => {
    setRules(rules.filter(rule => rule.id !== id));
  };
  
  const handleSave = () => {
    // Validation de base
    if (!decisionName) {
      message.error('Veuillez spécifier un nom pour la décision');
      return;
    }
    
    if (inputs.length === 0 || outputs.length === 0) {
      message.error('Vous devez définir au moins une entrée et une sortie');
      return;
    }
    
    // Validation des noms des entrées/sorties
    const invalidInputs = inputs.filter(input => !input.name || !input.label);
    const invalidOutputs = outputs.filter(output => !output.name || !output.label);
    
    if (invalidInputs.length > 0 || invalidOutputs.length > 0) {
      message.error('Toutes les entrées et sorties doivent avoir un nom et un libellé');
      return;
    }
    
    // Construction du modèle de décision
    const decisionModel = {
      id: decisionName.replace(/\s+/g, '_'),
      name: decisionName,
      inputs: inputs.map(({ id, ...rest }) => rest),
      outputs: outputs.map(({ id, ...rest }) => rest),
      rules: rules.map(({ id, ...rest }) => rest)
    };
    
    // Appeler la fonction de sauvegarde
    if (onSave) {
      onSave(decisionModel);
      message.success('Règle métier (DMN) enregistrée avec succès');
    }
  };
  
  // Colonnes pour la table des règles
  const getColumns = () => {
    const columns = [];
    
    // Colonnes pour les conditions (inputs)
    inputs.forEach(input => {
      if (input.name) {
        columns.push({
          title: `Condition: ${input.label}`,
          dataIndex: ['conditions', input.name],
          key: `condition-${input.name}`,
          render: (text, record) => (
            <Input 
              value={record.conditions[input.name] || ''}
              onChange={(e) => handleRuleChange(record.id, 'condition', input.name, e.target.value)}
              placeholder={`Expression pour ${input.label}`}
            />
          )
        });
      }
    });
    
    // Colonnes pour les résultats (outputs)
    outputs.forEach(output => {
      if (output.name) {
        columns.push({
          title: `Résultat: ${output.label}`,
          dataIndex: ['results', output.name],
          key: `result-${output.name}`,
          render: (text, record) => (
            <Input 
              value={record.results[output.name] || ''}
              onChange={(e) => handleRuleChange(record.id, 'result', output.name, e.target.value)}
              placeholder={`Valeur pour ${output.label}`}
            />
          )
        });
      }
    });
    
    // Colonne d'actions
    columns.push({
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Popconfirm
          title="Êtes-vous sûr de vouloir supprimer cette règle ?"
          onConfirm={() => handleRemoveRule(record.id)}
          okText="Oui"
          cancelText="Non"
        >
          <Button icon={<DeleteOutlined />} danger size="small" />
        </Popconfirm>
      )
    });
    
    return columns;
  };
  
  return (
    <div className="business-rule-editor">
      <Divider orientation="left">Éditeur de règles métier (DMN)</Divider>
      
      <Card title="Informations de base">
        <Row gutter={16}>
          <Col span={24}>
            <Input
              addonBefore="Nom de la décision"
              value={decisionName}
              onChange={(e) => setDecisionName(e.target.value)}
              placeholder="Nom de la table de décision DMN"
            />
          </Col>
        </Row>
      </Card>
      
      <Divider orientation="left">Variables d'entrée</Divider>
      
      <Card title="Variables d'entrée (conditions)">
        {inputs.map((input, index) => (
          <Card 
            key={input.id} 
            type="inner" 
            title={`Variable d'entrée ${index + 1}`}
            extra={
              <Button 
                icon={<DeleteOutlined />} 
                danger 
                onClick={() => handleRemoveInput(input.id)}
                disabled={inputs.length <= 1}
              />
            }
            style={{ marginBottom: 16 }}
          >
            <Row gutter={16}>
              <Col span={8}>
                <Input
                  addonBefore="Nom"
                  value={input.name}
                  onChange={(e) => handleInputChange(input.id, 'name', e.target.value)}
                  placeholder="nom_variable"
                />
              </Col>
              <Col span={8}>
                <Input
                  addonBefore="Libellé"
                  value={input.label}
                  onChange={(e) => handleInputChange(input.id, 'label', e.target.value)}
                  placeholder="Libellé affiché"
                />
              </Col>
              <Col span={8}>
                <Select
                  style={{ width: '100%' }}
                  value={input.type}
                  onChange={(value) => handleInputChange(input.id, 'type', value)}
                >
                  <Option value="string">Texte</Option>
                  <Option value="integer">Nombre entier</Option>
                  <Option value="double">Nombre décimal</Option>
                  <Option value="boolean">Booléen</Option>
                  <Option value="date">Date</Option>
                </Select>
              </Col>
            </Row>
          </Card>
        ))}
        
        <Button 
          type="dashed" 
          onClick={handleAddInput} 
          block 
          icon={<PlusOutlined />}
        >
          Ajouter une variable d'entrée
        </Button>
      </Card>
      
      <Divider orientation="left">Variables de sortie</Divider>
      
      <Card title="Variables de sortie (résultats)">
        {outputs.map((output, index) => (
          <Card 
            key={output.id} 
            type="inner" 
            title={`Variable de sortie ${index + 1}`}
            extra={
              <Button 
                icon={<DeleteOutlined />} 
                danger 
                onClick={() => handleRemoveOutput(output.id)}
                disabled={outputs.length <= 1}
              />
            }
            style={{ marginBottom: 16 }}
          >
            <Row gutter={16}>
              <Col span={8}>
                <Input
                  addonBefore="Nom"
                  value={output.name}
                  onChange={(e) => handleOutputChange(output.id, 'name', e.target.value)}
                  placeholder="nom_variable"
                />
              </Col>
              <Col span={8}>
                <Input
                  addonBefore="Libellé"
                  value={output.label}
                  onChange={(e) => handleOutputChange(output.id, 'label', e.target.value)}
                  placeholder="Libellé affiché"
                />
              </Col>
              <Col span={8}>
                <Select
                  style={{ width: '100%' }}
                  value={output.type}
                  onChange={(value) => handleOutputChange(output.id, 'type', value)}
                >
                  <Option value="string">Texte</Option>
                  <Option value="integer">Nombre entier</Option>
                  <Option value="double">Nombre décimal</Option>
                  <Option value="boolean">Booléen</Option>
                  <Option value="date">Date</Option>
                </Select>
              </Col>
            </Row>
          </Card>
        ))}
        
        <Button 
          type="dashed" 
          onClick={handleAddOutput} 
          block 
          icon={<PlusOutlined />}
        >
          Ajouter une variable de sortie
        </Button>
      </Card>
      
      <Divider orientation="left">Règles</Divider>
      
      <Card title="Table de décision">
        <Table 
          columns={getColumns()}
          dataSource={rules}
          rowKey="id"
          pagination={false}
          scroll={{ x: 'max-content' }}
          footer={() => (
            <Button 
              type="dashed" 
              onClick={handleAddRule} 
              block 
              icon={<PlusOutlined />}
            >
              Ajouter une règle
            </Button>
          )}
        />
      </Card>
      
      <div style={{ marginTop: 16, textAlign: 'right' }}>
        <Space>
          <Button onClick={() => {
            setDecisionName(decisionRef || 'Decision_1');
            setInputs([{ id: '1', name: '', type: 'string', label: '' }]);
            setOutputs([{ id: '1', name: '', type: 'string', label: '' }]);
            setRules([]);
          }}>Réinitialiser</Button>
          <Button type="primary" onClick={handleSave}>Enregistrer la règle métier</Button>
        </Space>
      </div>
    </div>
  );
};

export default BusinessRuleEditor; 