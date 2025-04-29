import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Select, Button, List, Space, Divider, message } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

const GatewayEditor = ({ gateway, outgoingFlows, onSave }) => {
  const [defaultFlow, setDefaultFlow] = useState('');
  const [flows, setFlows] = useState([]);
  
  useEffect(() => {
    if (gateway && outgoingFlows) {
      // Initialiser avec les flux sortants existants
      const flowsData = outgoingFlows.map(flow => ({
        id: flow.id,
        name: flow.businessObject.name || '',
        condition: flow.businessObject.conditionExpression?.body || '',
        targetName: flow.target?.businessObject?.name || 'Élément cible'
      }));
      
      setFlows(flowsData);
      
      // Définir le flux par défaut s'il existe
      if (gateway.businessObject.default) {
        setDefaultFlow(gateway.businessObject.default.id);
      }
    }
  }, [gateway, outgoingFlows]);
  
  const handleFlowChange = (id, field, value) => {
    setFlows(flows.map(flow => {
      if (flow.id === id) {
        return { ...flow, [field]: value };
      }
      return flow;
    }));
  };
  
  const handleSave = () => {
    // Validation de base
    const flowsWithEmptyConditions = flows.filter(flow => !flow.condition && flow.id !== defaultFlow);
    
    if (flowsWithEmptyConditions.length > 0 && gateway.businessObject.$type.includes('ExclusiveGateway')) {
      message.warning('Certains flux n\'ont pas de condition définie');
    }
    
    // Préparer les données pour la sauvegarde
    const gatewayConfig = {
      id: gateway.id,
      defaultFlow,
      flows: flows.map(flow => ({
        id: flow.id,
        name: flow.name,
        condition: flow.condition
      }))
    };
    
    // Appeler la fonction de sauvegarde
    if (onSave) {
      onSave(gatewayConfig);
      message.success('Configuration de la Gateway enregistrée');
    }
  };
  
  return (
    <div className="gateway-editor">
      <Divider orientation="left">Configuration de la Gateway</Divider>
      
      <Card title="Flux par défaut (utilisé si aucune condition n'est validée)">
        <Select
          style={{ width: '100%' }}
          placeholder="Sélectionner un flux par défaut"
          value={defaultFlow}
          onChange={setDefaultFlow}
          allowClear
        >
          {flows.map(flow => (
            <Option key={flow.id} value={flow.id}>
              {flow.name || flow.id} → {flow.targetName}
            </Option>
          ))}
        </Select>
      </Card>
      
      <Divider orientation="left">Conditions des flux sortants</Divider>
      
      <List
        dataSource={flows}
        renderItem={flow => (
          <List.Item>
            <Card 
              style={{ width: '100%' }} 
              title={`Flux: ${flow.name || flow.id} → ${flow.targetName}`}
            >
              <Form layout="vertical">
                <Form.Item label="Nom du flux">
                  <Input
                    value={flow.name}
                    onChange={(e) => handleFlowChange(flow.id, 'name', e.target.value)}
                    placeholder="Nom du flux (optionnel)"
                  />
                </Form.Item>
                
                <Form.Item 
                  label={`Condition ${flow.id === defaultFlow ? '(flux par défaut - condition ignorée)' : ''}`}
                >
                  <TextArea
                    value={flow.condition}
                    onChange={(e) => handleFlowChange(flow.id, 'condition', e.target.value)}
                    placeholder="Expression de condition (par ex. ${amount > 1000})"
                    rows={3}
                    disabled={flow.id === defaultFlow}
                  />
                </Form.Item>
                
                {flow.id === defaultFlow && (
                  <div style={{ color: '#1890ff', marginBottom: 16 }}>
                    Ce flux est défini comme flux par défaut. Il sera utilisé si aucune autre condition n'est validée.
                  </div>
                )}
              </Form>
            </Card>
          </List.Item>
        )}
      />
      
      <div style={{ marginTop: 16, textAlign: 'right' }}>
        <Button type="primary" onClick={handleSave}>
          Enregistrer la configuration
        </Button>
      </div>
    </div>
  );
};

export default GatewayEditor; 