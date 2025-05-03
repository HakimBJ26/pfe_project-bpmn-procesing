import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Select, message, Space, Modal, Form, Card, Spin, Tag, Tooltip } from 'antd';
import { PlayCircleOutlined, SearchOutlined, SyncOutlined, InfoCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import processService from '../../services/processService';

const { Option } = Select;

const ProcessInstanceList = () => {
  const [loading, setLoading] = useState(false);
  const [processes, setProcesses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isStartModalVisible, setIsStartModalVisible] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [startForm] = Form.useForm();
  
  const fetchProcesses = async () => {
    setLoading(true);
    try {
      console.log('Tentative de récupération des processus déployés...');
      const data = await processService.listAllProcesses();
      console.log('Réponse API des processus déployés:', data);
      
      if (!data || data.length === 0) {
        console.log('Aucun processus déployé trouvé');
        message.info('Aucun processus déployé disponible');
      }
      
      setProcesses(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des processus:', error);
      if (error.response) {
        console.error('Détails de l\'erreur API:', error.response.data);
        console.error('Statut HTTP:', error.response.status);
      }
      message.error(`Impossible de charger la liste des processus: ${error.message}`);
      setProcesses([]);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchProcesses();
  }, []);
  
  const handleSearch = (value) => {
    setSearchTerm(value);
  };
  
  const handleStartProcess = (process) => {
    setSelectedProcess(process);
    startForm.resetFields();
    setIsStartModalVisible(true);
  };
  
  const handleStartModalCancel = () => {
    setIsStartModalVisible(false);
  };
  
  const handleStartModalSubmit = async () => {
    try {
      const values = await startForm.validateFields();
      console.log('Démarrage du processus avec les variables:', values);
      
      const result = await processService.startProcess(selectedProcess.key, values);
      message.success(`Instance de processus démarrée avec l'ID: ${result.id}`);
      setIsStartModalVisible(false);
      
      // Rafraîchir la liste
      fetchProcesses();
    } catch (error) {
      console.error('Erreur lors du démarrage du processus:', error);
      message.error('Impossible de démarrer le processus');
    }
  };
  
  const columns = [
    {
      title: 'Nom',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text, record) => (
        <Space>
          {text}
          {record.version && <Tag color="blue">v{record.version}</Tag>}
        </Space>
      )
    },
    {
      title: 'Clé',
      dataIndex: 'key',
      key: 'key',
    },
    {
      title: 'Version du déploiement',
      dataIndex: 'deploymentVersion',
      key: 'deploymentVersion',
      render: (text) => text || '-'
    },
    {
      title: 'Statut',
      dataIndex: 'suspended',
      key: 'suspended',
      render: (suspended) => (
        suspended ? 
          <Tag icon={<CloseCircleOutlined />} color="error">Suspendu</Tag> : 
          <Tag icon={<CheckCircleOutlined />} color="success">Actif</Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Démarrer une nouvelle instance">
            <Button 
              type="primary" 
              icon={<PlayCircleOutlined />} 
              onClick={() => handleStartProcess(record)}
              disabled={record.suspended}
            >
              Démarrer
            </Button>
          </Tooltip>
          <Tooltip title="Voir les détails">
            <Button 
              icon={<InfoCircleOutlined />} 
              onClick={() => message.info('Fonctionnalité à implémenter')}
            >
              Détails
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];
  
  const filteredProcesses = processes.filter(process => 
    (process.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    (process.key?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="process-list-container" style={{ padding: '20px' }}>
      <Card title="Processus déployés" style={{ marginBottom: 20 }}>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Input.Search
            placeholder="Rechercher par nom ou clé"
            allowClear
            onSearch={handleSearch}
            style={{ width: 300 }}
            enterButton={<SearchOutlined />}
          />
          <Button 
            type="primary" 
            icon={<SyncOutlined />} 
            onClick={fetchProcesses}
          >
            Rafraîchir
          </Button>
        </div>
        
        <Table
          columns={columns}
          dataSource={filteredProcesses}
          rowKey="id"
          loading={loading}
          pagination={{ defaultPageSize: 10 }}
        />
      </Card>
      
      <Modal
        title={`Démarrer une instance de processus: ${selectedProcess?.name}`}
        open={isStartModalVisible}
        onCancel={handleStartModalCancel}
        footer={[
          <Button key="back" onClick={handleStartModalCancel}>
            Annuler
          </Button>,
          <Button key="submit" type="primary" onClick={handleStartModalSubmit}>
            Démarrer
          </Button>,
        ]}
      >
        <Form
          form={startForm}
          layout="vertical"
        >
          <Form.Item
            name="variables"
            label="Variables initiales (JSON)"
            extra="Entrez les variables initiales au format JSON (optionnel)"
          >
            <Input.TextArea 
              rows={4} 
              placeholder='{"nomVariable1": "valeur1", "nomVariable2": 42}'
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProcessInstanceList; 