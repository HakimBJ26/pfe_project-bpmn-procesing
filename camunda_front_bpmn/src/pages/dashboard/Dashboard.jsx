import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Button, List, Spin, Empty, Divider } from 'antd';
import { useNavigate } from 'react-router-dom';
import { 
  ShareAltOutlined, TableOutlined, FormOutlined, 
  PlusOutlined, FileTextOutlined
} from '@ant-design/icons';
import workflowService from '../../services/workflowService';
import dmnService from '../../services/dmnService';
import formService from '../../services/formService';
import processService from '../../services/processService';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    workflows: 0,
    dmns: 0,
    forms: 0,
    processes: 0
  });
  const [recentWorkflows, setRecentWorkflows] = useState([]);
  const [recentDmns, setRecentDmns] = useState([]);
  const [recentForms, setRecentForms] = useState([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Charger les statistiques
      const workflows = await workflowService.getAllWorkflows();
      const dmns = await dmnService.getAllDmns();
      const forms = await formService.getAllForms();
      const processes = await processService.listAllProcesses();
      
      setStats({
        workflows: workflows.length,
        dmns: dmns.length,
        forms: forms.length,
        processes: processes.length
      });
      
      // Récupérer les éléments récents (limités à 5)
      setRecentWorkflows(
        workflows
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
      );
      
      setRecentDmns(
        dmns
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
          .slice(0, 5)
      );
      
      setRecentForms(
        forms
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
      );
      
    } catch (error) {
      console.error('Erreur lors du chargement des données du tableau de bord:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" tip="Chargement des données..." />
      </div>
    );
  }

  return (
    <div>
      <Row gutter={16}>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            onClick={() => navigate('/workflows')}
            hoverable
            style={{ marginBottom: 16, cursor: 'pointer' }}
          >
            <Statistic 
              title="Workflows BPMN" 
              value={stats.workflows} 
              prefix={<ShareAltOutlined />} 
            />
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              style={{ marginTop: 16 }}
              onClick={(e) => {
                e.stopPropagation();
                navigate('/workflows/new');
              }}
            >
              Nouveau
            </Button>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            onClick={() => navigate('/dmn')}
            hoverable
            style={{ marginBottom: 16, cursor: 'pointer' }}
          >
            <Statistic 
              title="Tables DMN" 
              value={stats.dmns} 
              prefix={<TableOutlined />} 
            />
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              style={{ marginTop: 16 }}
              onClick={(e) => {
                e.stopPropagation();
                navigate('/dmn/new');
              }}
            >
              Nouveau
            </Button>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            onClick={() => navigate('/forms')}
            hoverable
            style={{ marginBottom: 16, cursor: 'pointer' }}
          >
            <Statistic 
              title="Formulaires" 
              value={stats.forms} 
              prefix={<FormOutlined />} 
            />
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              style={{ marginTop: 16 }}
              onClick={(e) => {
                e.stopPropagation();
                navigate('/forms/new');
              }}
            >
              Nouveau
            </Button>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            onClick={() => navigate('/processes')}
            hoverable
            style={{ marginBottom: 16, cursor: 'pointer' }}
          >
            <Statistic 
              title="Processus déployés" 
              value={stats.processes} 
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Divider orientation="left">Éléments récents</Divider>

      <Row gutter={16}>
        <Col xs={24} lg={8}>
          <Card 
            title="Workflows récents" 
            extra={<Button type="link" onClick={() => navigate('/workflows')}>Voir tout</Button>}
            style={{ marginBottom: 16 }}
          >
            {recentWorkflows.length > 0 ? (
              <List
                dataSource={recentWorkflows}
                renderItem={item => (
                  <List.Item
                    actions={[
                      <Button 
                        type="link" 
                        onClick={() => navigate(`/workflows/edit/${item.id}`)}
                      >
                        Éditer
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      title={item.title}
                      description={`Créé le ${new Date(item.createdAt).toLocaleString()}`}
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="Aucun workflow créé" />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card 
            title="Tables DMN récentes" 
            extra={<Button type="link" onClick={() => navigate('/dmn')}>Voir tout</Button>}
            style={{ marginBottom: 16 }}
          >
            {recentDmns.length > 0 ? (
              <List
                dataSource={recentDmns}
                renderItem={item => (
                  <List.Item
                    actions={[
                      <Button 
                        type="link" 
                        onClick={() => navigate(`/dmn/edit/${item.id}`)}
                      >
                        Éditer
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      title={item.name}
                      description={`Créé le ${item.createdAt ? new Date(item.createdAt).toLocaleString() : 'N/A'}`}
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="Aucune table DMN créée" />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card 
            title="Formulaires récents" 
            extra={<Button type="link" onClick={() => navigate('/forms')}>Voir tout</Button>}
            style={{ marginBottom: 16 }}
          >
            {recentForms.length > 0 ? (
              <List
                dataSource={recentForms}
                renderItem={item => (
                  <List.Item
                    actions={[
                      <Button 
                        type="link" 
                        onClick={() => navigate(`/forms/edit/${item.formKey}`)}
                      >
                        Éditer
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      title={item.title}
                      description={`Clé: ${item.formKey}`}
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="Aucun formulaire créé" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 