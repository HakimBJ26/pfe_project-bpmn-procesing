import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Select, message, Space, Card, Tag, Tooltip, Modal, Form, Tabs, Spin, Typography, Collapse } from 'antd';
import { SearchOutlined, SyncOutlined, CheckOutlined, UserOutlined, UnlockOutlined, InfoCircleOutlined } from '@ant-design/icons';
import taskService from '../../services/taskService';
import moment from 'moment';

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Title, Text } = Typography;
const { Panel } = Collapse;

const TaskList = () => {
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskDetailsVisible, setTaskDetailsVisible] = useState(false);
  const [taskVariables, setTaskVariables] = useState({});
  const [taskForm, setTaskForm] = useState(null);
  const [loadingTaskDetails, setLoadingTaskDetails] = useState(false);
  const [formValues, setFormValues] = useState({});
  const [taskActiveKey, setTaskActiveKey] = useState('form');
  const [completeForm] = Form.useForm();
  
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await taskService.getUserTasks();
      setTasks(data);
    } catch (error) {
      console.error('Erreur lors du chargement des tâches:', error);
      message.error('Impossible de charger la liste des tâches');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchTasks();
  }, []);
  
  const handleSearch = (value) => {
    setSearchTerm(value);
  };
  
  const handleViewTask = async (task) => {
    setSelectedTask(task);
    setTaskDetailsVisible(true);
    setTaskActiveKey('form');
    setLoadingTaskDetails(true);
    completeForm.resetFields();
    
    try {
      // Charger les variables de la tâche
      const variables = await taskService.getTaskVariables(task.id);
      setTaskVariables(variables);
      
      // Initialiser les valeurs du formulaire à partir des variables
      const initialValues = {};
      Object.entries(variables).forEach(([key, variable]) => {
        initialValues[key] = variable.value;
      });
      setFormValues(initialValues);
      completeForm.setFieldsValue(initialValues);
      
      // Charger les informations du formulaire associé
      try {
        const formData = await taskService.getTaskForm(task.id);
        setTaskForm(formData);
      } catch (formError) {
        console.warn('Pas de formulaire spécifique trouvé pour cette tâche:', formError);
        setTaskForm(null);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des détails de la tâche:', error);
      message.error('Impossible de charger les détails de la tâche');
    } finally {
      setLoadingTaskDetails(false);
    }
  };
  
  const handleTaskModalCancel = () => {
    setTaskDetailsVisible(false);
  };
  
  const handleCompleteTask = async () => {
    try {
      // Valider et récupérer les valeurs du formulaire
      const values = await completeForm.validateFields();
      console.log('Complétion de la tâche avec les variables:', values);
      
      await taskService.completeTask(selectedTask.id, values);
      message.success('Tâche complétée avec succès');
      setTaskDetailsVisible(false);
      
      // Rafraîchir la liste des tâches
      fetchTasks();
    } catch (error) {
      console.error('Erreur lors de la complétion de la tâche:', error);
      message.error('Impossible de compléter la tâche');
    }
  };
  
  const handleClaimTask = async (taskId) => {
    try {
      await taskService.claimTask(taskId);
      message.success('Tâche revendiquée avec succès');
      fetchTasks();
    } catch (error) {
      console.error('Erreur lors de la revendication de la tâche:', error);
      message.error('Impossible de revendiquer la tâche');
    }
  };
  
  const handleUnclaimTask = async (taskId) => {
    try {
      await taskService.unclaimTask(taskId);
      message.success('Tâche libérée avec succès');
      fetchTasks();
    } catch (error) {
      console.error('Erreur lors de la libération de la tâche:', error);
      message.error('Impossible de libérer la tâche');
    }
  };
  
  const columns = [
    {
      title: 'Nom',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Process',
      dataIndex: 'processDefinitionName',
      key: 'processDefinitionName',
      render: (text, record) => (
        <Space>
          {text || record.processDefinitionId.split(':')[0]}
          <Tag color="blue">{record.processInstanceId}</Tag>
        </Space>
      )
    },
    {
      title: 'Assigné à',
      dataIndex: 'assignee',
      key: 'assignee',
      render: (text) => text || <Tag color="orange">Non assigné</Tag>
    },
    {
      title: 'Création',
      dataIndex: 'created',
      key: 'created',
      render: (text) => moment(text).format('DD/MM/YYYY HH:mm'),
      sorter: (a, b) => moment(a.created).unix() - moment(b.created).unix()
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Voir et compléter">
            <Button 
              type="primary" 
              icon={<CheckOutlined />} 
              onClick={() => handleViewTask(record)}
            >
              Compléter
            </Button>
          </Tooltip>
          
          {!record.assignee ? (
            <Tooltip title="Revendiquer cette tâche">
              <Button 
                icon={<UserOutlined />} 
                onClick={() => handleClaimTask(record.id)}
              >
                Revendiquer
              </Button>
            </Tooltip>
          ) : (
            <Tooltip title="Libérer cette tâche">
              <Button 
                icon={<UnlockOutlined />} 
                onClick={() => handleUnclaimTask(record.id)}
                disabled={record.assignee !== 'demo'} // À remplacer par l'utilisateur connecté
              >
                Libérer
              </Button>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];
  
  const filteredTasks = tasks.filter(task => 
    task.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Rendu dynamique du formulaire en fonction des variables de la tâche
  const renderTaskForm = () => {
    if (loadingTaskDetails) {
      return <Spin tip="Chargement des détails de la tâche..." />;
    }
    
    return (
      <Form
        form={completeForm}
        layout="vertical"
        initialValues={formValues}
      >
        {/* Si nous avons une définition de formulaire spécifique, l'utiliser */}
        {taskForm ? (
          // Utiliser la définition du formulaire pour rendre les champs
          taskForm.fields.map(field => (
            <Form.Item
              key={field.id}
              name={field.id}
              label={field.label}
              required={field.required}
            >
              {field.type === 'string' ? (
                <Input placeholder={`Entrez ${field.label}`} />
              ) : field.type === 'long' || field.type === 'integer' ? (
                <Input type="number" placeholder={`Entrez ${field.label}`} />
              ) : field.type === 'boolean' ? (
                <Select>
                  <Option value={true}>Oui</Option>
                  <Option value={false}>Non</Option>
                </Select>
              ) : field.type === 'date' ? (
                <Input type="date" />
              ) : field.type === 'enum' && field.values ? (
                <Select>
                  {field.values.map(option => (
                    <Option key={option} value={option}>{option}</Option>
                  ))}
                </Select>
              ) : (
                <Input placeholder={`Entrez ${field.label}`} />
              )}
            </Form.Item>
          ))
        ) : (
          // Sinon générer un formulaire basé sur les variables
          Object.entries(taskVariables).map(([key, variable]) => (
            <Form.Item
              key={key}
              name={key}
              label={key}
            >
              {typeof variable.value === 'boolean' ? (
                <Select>
                  <Option value={true}>Vrai</Option>
                  <Option value={false}>Faux</Option>
                </Select>
              ) : typeof variable.value === 'number' ? (
                <Input type="number" />
              ) : (
                <Input />
              )}
            </Form.Item>
          ))
        )}
      </Form>
    );
  };
  
  return (
    <div className="task-list-container" style={{ padding: '20px' }}>
      <Card title="Mes tâches" style={{ marginBottom: 20 }}>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Input.Search
            placeholder="Rechercher par nom"
            allowClear
            onSearch={handleSearch}
            style={{ width: 300 }}
            enterButton={<SearchOutlined />}
          />
          <Button 
            type="primary" 
            icon={<SyncOutlined />} 
            onClick={fetchTasks}
          >
            Rafraîchir
          </Button>
        </div>
        
        <Table
          columns={columns}
          dataSource={filteredTasks}
          rowKey="id"
          loading={loading}
          pagination={{ defaultPageSize: 10 }}
        />
      </Card>
      
      <Modal
        title={`Tâche: ${selectedTask?.name}`}
        open={taskDetailsVisible}
        onCancel={handleTaskModalCancel}
        footer={[
          <Button key="back" onClick={handleTaskModalCancel}>
            Annuler
          </Button>,
          <Button key="submit" type="primary" onClick={handleCompleteTask}>
            Compléter la tâche
          </Button>,
        ]}
        width={800}
      >
        {selectedTask && (
          <Tabs activeKey={taskActiveKey} onChange={setTaskActiveKey}>
            <TabPane tab="Formulaire" key="form">
              {renderTaskForm()}
            </TabPane>
            <TabPane tab="Détails" key="details">
              <Collapse defaultActiveKey={['1']}>
                <Panel header="Informations sur la tâche" key="1">
                  <p><strong>ID:</strong> {selectedTask.id}</p>
                  <p><strong>Processus:</strong> {selectedTask.processDefinitionName || selectedTask.processDefinitionId}</p>
                  <p><strong>Instance de processus:</strong> {selectedTask.processInstanceId}</p>
                  <p><strong>Création:</strong> {moment(selectedTask.created).format('DD/MM/YYYY HH:mm:ss')}</p>
                  <p><strong>Assigné à:</strong> {selectedTask.assignee || 'Non assigné'}</p>
                  <p><strong>Description:</strong> {selectedTask.description || 'Pas de description'}</p>
                </Panel>
                <Panel header="Variables du processus" key="2">
                  {Object.entries(taskVariables).length > 0 ? (
                    <ul>
                      {Object.entries(taskVariables).map(([key, variable]) => (
                        <li key={key}>
                          <strong>{key}:</strong> {typeof variable.value === 'object' 
                            ? JSON.stringify(variable.value) 
                            : String(variable.value)
                          } <Text type="secondary">({variable.type})</Text>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>Aucune variable disponible</p>
                  )}
                </Panel>
              </Collapse>
            </TabPane>
          </Tabs>
        )}
      </Modal>
    </div>
  );
};

export default TaskList; 