import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, message, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import FormEditorComponent from '../../components/forms/FormEditor';
import formService from '../../services/formService';

const FormEditor = () => {
  const { formKey } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(formKey ? true : false);
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (formKey) {
      const fetchForm = async () => {
        try {
          const data = await formService.getFormByKey(formKey);
          setForm(data);
        } catch (error) {
          console.error('Erreur lors du chargement du formulaire:', error);
          message.error('Impossible de charger le formulaire');
          navigate('/forms');
        } finally {
          setLoading(false);
        }
      };

      fetchForm();
    }
  }, [formKey, navigate]);

  const handleSave = () => {
    message.success('Formulaire sauvegardé avec succès');
    navigate('/forms');
  };

  return (
    <div style={{ padding: '20px' }}>
      <Button 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate('/forms')}
        style={{ marginBottom: '16px' }}
      >
        Retour à la liste
      </Button>

      <Card 
        title={formKey ? 'Modifier le formulaire' : 'Créer un nouveau formulaire'} 
        bordered={false}
        style={{ marginBottom: '16px' }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
          </div>
        ) : (
          <FormEditorComponent 
            formId={formKey} 
            onSave={handleSave}
          />
        )}
      </Card>
    </div>
  );
};

export default FormEditor; 