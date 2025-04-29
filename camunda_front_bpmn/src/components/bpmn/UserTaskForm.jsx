import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, Row, Col, Card, Divider, Space, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const { Option } = Select;

const UserTaskForm = ({ formKey, onSave }) => {
  const [form] = Form.useForm();
  const [formFields, setFormFields] = useState([]);
  
  useEffect(() => {
    // Ici, vous pourriez charger un formulaire existant basé sur formKey
    // Pour cet exemple, nous initialisons avec des champs vides
    if (formKey) {
      // Simuler le chargement d'un formulaire existant
      setFormFields([
        { id: '1', type: 'text', label: 'Nom', name: 'nom', required: true },
        { id: '2', type: 'text', label: 'Prénom', name: 'prenom', required: true },
        { id: '3', type: 'select', label: 'Statut', name: 'statut', options: 'En attente,En cours,Terminé' }
      ]);
    } else {
      setFormFields([]);
    }
  }, [formKey]);
  
  const handleAddField = () => {
    const newField = { 
      id: Date.now().toString(), 
      type: 'text', 
      label: '', 
      name: '', 
      required: false 
    };
    
    setFormFields([...formFields, newField]);
  };
  
  const handleRemoveField = (id) => {
    setFormFields(formFields.filter(field => field.id !== id));
  };
  
  const handleFieldChange = (id, key, value) => {
    setFormFields(formFields.map(field => {
      if (field.id === id) {
        return { ...field, [key]: value };
      }
      return field;
    }));
  };
  
  const handleSave = () => {
    // Validation basique
    const invalidFields = formFields.filter(field => !field.label || !field.name);
    if (invalidFields.length > 0) {
      message.error('Tous les champs doivent avoir un libellé et un nom');
      return;
    }
    
    // Construire le JSON du formulaire
    const formData = {
      formKey: formKey || `form_${Date.now()}`,
      fields: formFields.map(({ id, ...rest }) => rest)
    };
    
    // Appeler la fonction de sauvegarde passée en prop
    if (onSave) {
      onSave(formData);
      message.success('Formulaire enregistré avec succès');
    }
  };
  
  return (
    <div className="user-task-form-builder">
      <Divider orientation="left">Constructeur de formulaire</Divider>
      
      <Card title="Champs du formulaire">
        {formFields.map((field, index) => (
          <Card 
            key={field.id} 
            type="inner" 
            title={`Champ ${index + 1}`}
            extra={
              <Button 
                icon={<DeleteOutlined />} 
                danger 
                onClick={() => handleRemoveField(field.id)}
              />
            }
            style={{ marginBottom: 16 }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Type de champ">
                  <Select
                    value={field.type}
                    onChange={(value) => handleFieldChange(field.id, 'type', value)}
                  >
                    <Option value="text">Texte</Option>
                    <Option value="number">Nombre</Option>
                    <Option value="date">Date</Option>
                    <Option value="select">Liste déroulante</Option>
                    <Option value="checkbox">Case à cocher</Option>
                    <Option value="textarea">Zone de texte</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Obligatoire">
                  <Select
                    value={field.required ? 'true' : 'false'}
                    onChange={(value) => handleFieldChange(field.id, 'required', value === 'true')}
                  >
                    <Option value="true">Oui</Option>
                    <Option value="false">Non</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Libellé">
                  <Input
                    value={field.label}
                    onChange={(e) => handleFieldChange(field.id, 'label', e.target.value)}
                    placeholder="Libellé affiché"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Nom de la variable">
                  <Input
                    value={field.name}
                    onChange={(e) => handleFieldChange(field.id, 'name', e.target.value)}
                    placeholder="Nom de la variable (camelCase)"
                  />
                </Form.Item>
              </Col>
            </Row>
            
            {field.type === 'select' && (
              <Form.Item label="Options (séparées par des virgules)">
                <Input
                  value={field.options}
                  onChange={(e) => handleFieldChange(field.id, 'options', e.target.value)}
                  placeholder="Option1,Option2,Option3"
                />
              </Form.Item>
            )}
          </Card>
        ))}
        
        <Button 
          type="dashed" 
          onClick={handleAddField} 
          block 
          icon={<PlusOutlined />}
        >
          Ajouter un champ
        </Button>
      </Card>
      
      <div style={{ marginTop: 16, textAlign: 'right' }}>
        <Space>
          <Button onClick={() => setFormFields([])}>Réinitialiser</Button>
          <Button type="primary" onClick={handleSave}>Enregistrer le formulaire</Button>
        </Space>
      </div>
    </div>
  );
};

export default UserTaskForm; 