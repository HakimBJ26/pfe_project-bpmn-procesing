import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Card, Space, Modal, message, Tooltip, Input } from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  SearchOutlined, EyeOutlined, FormOutlined 
} from '@ant-design/icons';
import formService from '../../services/formService';

const { confirm } = Modal;
const { Search } = Input;

const FormList = () => {
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  const fetchForms = async () => {
    try {
      setLoading(true);
      const data = await formService.getAllForms();
      setForms(data);
    } catch (error) {
      console.error('Erreur lors du chargement des formulaires:', error);
      message.error('Impossible de charger les formulaires');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const handleEdit = (formKey) => {
    navigate(`/forms/edit/${formKey}`);
  };

  const handleView = (formKey) => {
    navigate(`/forms/view/${formKey}`);
  };

  const handleDelete = (id, title) => {
    confirm({
      title: 'Êtes-vous sûr de vouloir supprimer ce formulaire?',
      content: `Vous êtes sur le point de supprimer le formulaire "${title}". Cette action est irréversible.`,
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      async onOk() {
        try {
          await formService.deleteForm(id);
          message.success('Formulaire supprimé avec succès');
          fetchForms();
        } catch (error) {
          console.error('Erreur lors de la suppression du formulaire:', error);
          message.error('Impossible de supprimer le formulaire');
        }
      },
    });
  };

  const filteredForms = forms.filter(form => 
    form.title.toLowerCase().includes(searchText.toLowerCase()) ||
    form.formKey.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'Titre',
      dataIndex: 'title',
      key: 'title',
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: 'Clé',
      dataIndex: 'formKey',
      key: 'formKey',
      sorter: (a, b) => a.formKey.localeCompare(b.formKey),
    },
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      ellipsis: true,
    },
    {
      title: 'Date de création',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => text ? new Date(text).toLocaleString() : '-',
      sorter: (a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return new Date(a.createdAt) - new Date(b.createdAt);
      },
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
              onClick={() => handleView(record.formKey)}
            />
          </Tooltip>
          <Tooltip title="Éditer">
            <Button 
              type="text"
              icon={<EditOutlined />} 
              onClick={() => handleEdit(record.formKey)}
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
        title="Formulaires"
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
              onClick={() => navigate('/forms/new')}
            >
              Nouveau Formulaire
            </Button>
          </Space>
        }
      >
        <Table 
          dataSource={filteredForms} 
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default FormList; 