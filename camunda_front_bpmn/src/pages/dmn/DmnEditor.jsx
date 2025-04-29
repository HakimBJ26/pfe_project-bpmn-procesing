import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, message, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import DmnEditorComponent from '../../components/dmn/DmnEditor';
import dmnService from '../../services/dmnService';

const DmnEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(id ? true : false);
  const [dmn, setDmn] = useState(null);

  useEffect(() => {
    if (id) {
      const fetchDmn = async () => {
        try {
          const data = await dmnService.getDmnById(id);
          setDmn(data);
        } catch (error) {
          console.error('Erreur lors du chargement du DMN:', error);
          message.error('Impossible de charger la table de décision');
          navigate('/dmn');
        } finally {
          setLoading(false);
        }
      };

      fetchDmn();
    }
  }, [id, navigate]);

  const handleSave = (savedDmn) => {
    if (!id) {
      // Si c'était une création, rediriger vers la page d'édition avec l'ID
      navigate(`/dmn/edit/${savedDmn.id}`);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Button 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate('/dmn')}
        style={{ marginBottom: '16px' }}
      >
        Retour à la liste
      </Button>

      <Card 
        title={id ? 'Modifier la table de décision' : 'Créer une nouvelle table de décision'} 
        bordered={false}
        style={{ marginBottom: '16px' }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
          </div>
        ) : (
          <DmnEditorComponent 
            dmnId={id} 
            initialDmn={dmn?.content}
            onSave={handleSave}
          />
        )}
      </Card>
    </div>
  );
};

export default DmnEditor; 