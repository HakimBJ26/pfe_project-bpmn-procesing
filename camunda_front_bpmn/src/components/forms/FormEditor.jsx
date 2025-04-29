import React, { useState, useEffect } from 'react';
import { JsonEditor as Editor } from 'jsoneditor-react';
import { Button, Row, Col, Card, Input, Space, message, Tabs, Switch, Tooltip } from 'antd';
import { SaveOutlined, EyeOutlined, FileOutlined, FormOutlined } from '@ant-design/icons';
import { JsonForms } from '@jsonforms/react';
import { materialRenderers, materialCells } from '@jsonforms/material-renderers';
import formService from '../../services/formService';

import 'jsoneditor-react/es/editor.min.css';
import './FormEditor.css';

const { TabPane } = Tabs;

// Schéma par défaut pour un nouveau formulaire
const DEFAULT_SCHEMA = {
  type: 'object',
  properties: {
    firstName: {
      type: 'string',
      title: 'Prénom'
    },
    lastName: {
      type: 'string',
      title: 'Nom'
    },
    email: {
      type: 'string',
      format: 'email',
      title: 'Email'
    }
  },
  required: ['firstName', 'lastName', 'email']
};

// Données par défaut pour la prévisualisation
const DEFAULT_DATA = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com'
};

const FormEditor = ({ formId, onSave }) => {
  const [schema, setSchema] = useState(DEFAULT_SCHEMA);
  const [data, setData] = useState(DEFAULT_DATA);
  const [formTitle, setFormTitle] = useState('Nouveau Formulaire');
  const [formKey, setFormKey] = useState('form-' + Math.random().toString(36).substring(2, 11));
  const [activeTab, setActiveTab] = useState('1');
  const [saving, setSaving] = useState(false);
  const [autoGenerateKey, setAutoGenerateKey] = useState(true);

  // Charger le formulaire existant si un ID est fourni
  useEffect(() => {
    if (formId) {
      const loadForm = async () => {
        try {
          const form = await formService.getFormByKey(formId);
          if (form) {
            setFormTitle(form.title);
            setFormKey(form.formKey);
            setSchema(form.content.schema || DEFAULT_SCHEMA);
            setData(DEFAULT_DATA);
            setAutoGenerateKey(false);
          }
        } catch (error) {
          console.error('Erreur lors du chargement du formulaire', error);
          message.error('Impossible de charger le formulaire');
        }
      };
      
      loadForm();
    }
  }, [formId]);

  // Mettre à jour la clé du formulaire lorsque le titre change
  useEffect(() => {
    if (autoGenerateKey) {
      const generatedKey = formTitle
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      if (generatedKey) {
        setFormKey(generatedKey);
      }
    }
  }, [formTitle, autoGenerateKey]);

  const handleSaveForm = async () => {
    if (!formTitle || !formKey) {
      message.error('Le titre et la clé du formulaire sont obligatoires');
      return;
    }
    
    try {
      setSaving(true);
      
      const formData = {
        title: formTitle,
        formKey: formKey,
        content: {
          schema: schema
        }
      };
      
      let result;
      if (formId) {
        // Mise à jour
        const updateData = {
          title: formTitle,
          content: {
            schema: schema
          }
        };
        result = await formService.updateForm(formId, updateData);
        message.success('Formulaire mis à jour avec succès');
      } else {
        // Création
        result = await formService.createForm(formData);
        message.success('Formulaire créé avec succès');
        
        if (onSave) {
          onSave(result);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du formulaire', error);
      message.error('Impossible de sauvegarder le formulaire');
    } finally {
      setSaving(false);
    }
  };

  const handleSchemaChange = (newSchema) => {
    setSchema(newSchema);
  };

  const handleDataChange = (path, value) => {
    setData({ ...data, [path]: value });
  };

  const handleToggleAutoGenerateKey = (checked) => {
    setAutoGenerateKey(checked);
  };

  return (
    <div className="form-editor-container">
      <Row gutter={16} className="form-editor-header">
        <Col span={12}>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <span>Titre du formulaire:</span>
            <Input 
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="Titre du formulaire"
            />
          </Space>
        </Col>
        <Col span={12}>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Clé du formulaire:</span>
              <Tooltip title="Générer automatiquement la clé à partir du titre">
                <Space>
                  <span>Auto-générer</span>
                  <Switch 
                    checked={autoGenerateKey} 
                    onChange={handleToggleAutoGenerateKey}
                    size="small"
                  />
                </Space>
              </Tooltip>
            </div>
            <Input 
              value={formKey}
              onChange={(e) => setFormKey(e.target.value)}
              placeholder="Clé du formulaire"
              disabled={autoGenerateKey}
            />
          </Space>
        </Col>
      </Row>
      
      <div className="form-editor-actions">
        <Button 
          type="primary"
          icon={<SaveOutlined />}
          onClick={handleSaveForm}
          loading={saving}
        >
          Sauvegarder
        </Button>
      </div>
      
      <Tabs 
        defaultActiveKey="1" 
        activeKey={activeTab}
        onChange={setActiveTab}
        className="form-editor-tabs"
      >
        <TabPane 
          tab={<span><FileOutlined />Schéma JSON</span>}
          key="1"
        >
          <div className="json-editor-container">
            <Editor
              value={schema}
              onChange={handleSchemaChange}
              mode="tree"
              navigationBar={true}
              search={true}
            />
          </div>
        </TabPane>
        <TabPane 
          tab={<span><EyeOutlined />Aperçu</span>}
          key="2"
        >
          <div className="form-preview">
            <Card title="Aperçu du formulaire" bordered={false}>
              <JsonForms
                schema={schema}
                data={data}
                renderers={materialRenderers}
                cells={materialCells}
                onChange={({ data }) => setData(data)}
              />
            </Card>
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default FormEditor; 