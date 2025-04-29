import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Card, Space, Modal, message, Tooltip, Input } from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  SearchOutlined, DeploymentUnitOutlined, EyeOutlined
} from '@ant-design/icons';
import workflowService from '../../services/workflowService';
import processService from '../../services/processService';

const { confirm } = Modal;
const { Search } = Input;

const WorkflowList = () => {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [deploying, setDeploying] = useState(false);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const data = await workflowService.getAllWorkflows();
      setWorkflows(data);
    } catch (error) {
      console.error('Erreur lors du chargement des workflows:', error);
      message.error('Impossible de charger les workflows');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const handleEdit = (id) => {
    navigate(`/workflows/edit/${id}`);
  };

  const handleView = (id) => {
    navigate(`/workflows/view/${id}`);
  };

  const handleDelete = (id, title) => {
    confirm({
      title: 'Êtes-vous sûr de vouloir supprimer ce workflow?',
      content: `Vous êtes sur le point de supprimer le workflow "${title}". Cette action est irréversible.`,
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      async onOk() {
        try {
          await workflowService.deleteWorkflow(id);
          message.success('Workflow supprimé avec succès');
          fetchWorkflows();
        } catch (error) {
          console.error('Erreur lors de la suppression du workflow:', error);
          message.error('Impossible de supprimer le workflow');
        }
      },
    });
  };

  const handleDeploy = async (id, title) => {
    confirm({
      title: 'Êtes-vous sûr de vouloir déployer ce workflow?',
      content: `Vous êtes sur le point de déployer le workflow "${title}" sur le moteur Camunda.`,
      okText: 'Déployer',
      cancelText: 'Annuler',
      async onOk() {
        try {
          setDeploying(true);
          
          // Obtenir le contenu du workflow
          const workflow = await workflowService.getWorkflowById(id);
          
          // Créer un fichier Blob à partir du XML
          const blob = new Blob([workflow.workflowContent], { type: 'application/xml' });
          const file = new File([blob], `${workflow.title.replace(/\s+/g, '_')}.bpmn`, { type: 'application/xml' });
          
          // Déployer le processus
          const result = await processService.deployProcess(file);
          message.success(`Processus déployé avec succès: ${result}`);
        } catch (error) {
          console.error('Erreur lors du déploiement du workflow:', error);
          message.error('Impossible de déployer le workflow');
        } finally {
          setDeploying(false);
        }
      },
    });
  };

  const filteredWorkflows = workflows.filter(workflow => 
    workflow.title.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'Titre',
      dataIndex: 'title',
      key: 'title',
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      ellipsis: true,
    },
    {
      title: 'Prêt pour déploiement',
      dataIndex: 'readyToDeploy',
      key: 'readyToDeploy',
      render: (text) => text ? 'Oui' : 'Non',
      filters: [
        { text: 'Oui', value: true },
        { text: 'Non', value: false },
      ],
      onFilter: (value, record) => record.readyToDeploy === value,
    },
    {
      title: 'Date de création',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => new Date(text).toLocaleString(),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Voir">
            <Button 
              type="text"
              icon={<EyeOutlined />} 
              onClick={() => handleView(record.id)}
            />
          </Tooltip>
          <Tooltip title="Éditer">
            <Button 
              type="text"
              icon={<EditOutlined />} 
              onClick={() => handleEdit(record.id)}
            />
          </Tooltip>
          <Tooltip title="Déployer">
            <Button 
              type="text"
              icon={<DeploymentUnitOutlined />} 
              onClick={() => handleDeploy(record.id, record.title)}
              disabled={!record.readyToDeploy}
            />
          </Tooltip>
          <Tooltip title="Supprimer">
            <Button 
              type="text"
              danger
              icon={<DeleteOutlined />} 
              onClick={() => handleDelete(record.id, record.title)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <Card 
        title="Workflows BPMN"
        extra={
          <Space>
            <Search
              placeholder="Rechercher..."
              allowClear
              onSearch={value => setSearchText(value)}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 250 }}
            />
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => navigate('/workflows/new')}
            >
              Nouveau Workflow
            </Button>
          </Space>
        }
      >
        <Table 
          dataSource={filteredWorkflows} 
          columns={columns}
          rowKey="id"
          loading={loading || deploying}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default WorkflowList; 