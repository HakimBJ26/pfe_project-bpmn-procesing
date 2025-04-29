import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, message, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import BpmnEditor from '../../components/bpmn/BpmnEditor';
import workflowService from '../../services/workflowService';

const WorkflowEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(id ? true : false);
  const [workflow, setWorkflow] = useState(null);

  useEffect(() => {
    if (id) {
      const fetchWorkflow = async () => {
        try {
          const data = await workflowService.getWorkflowById(id);
          setWorkflow(data);
        } catch (error) {
          console.error('Erreur lors du chargement du workflow:', error);
          message.error('Impossible de charger le workflow');
          navigate('/workflows');
        } finally {
          setLoading(false);
        }
      };

      fetchWorkflow();
    }
  }, [id, navigate]);

  const handleSave = (savedWorkflow) => {
    if (!id) {
      // Si c'était une création, rediriger vers la page d'édition avec l'ID
      navigate(`/workflows/edit/${savedWorkflow.id}`);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Button 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate('/workflows')}
        style={{ marginBottom: '16px' }}
      >
        Retour à la liste
      </Button>

      <Card 
        title={id ? 'Modifier le workflow' : 'Créer un nouveau workflow'} 
        bordered={false}
        style={{ marginBottom: '16px' }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
          </div>
        ) : (
          <BpmnEditor 
            workflowId={id} 
            initialDiagram={workflow?.workflowContent}
            onSave={handleSave}
          />
        )}
      </Card>
    </div>
  );
};

export default WorkflowEditor; 