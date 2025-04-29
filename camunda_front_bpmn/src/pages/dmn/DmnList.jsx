import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Card, Space, Modal, message, Tooltip, Input } from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  SearchOutlined, EyeOutlined
} from '@ant-design/icons';
import dmnService from '../../services/dmnService';

const { confirm } = Modal;
const { Search } = Input;

const DmnList = () => {
  const navigate = useNavigate();
  const [dmns, setDmns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  const fetchDmns = async () => {
    try {
      setLoading(true);
      const data = await dmnService.getAllDmns();
      setDmns(data);
    } catch (error) {
      console.error('Erreur lors du chargement des DMN:', error);
      message.error('Impossible de charger les DMN');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDmns();
  }, []);

  const handleEdit = (id) => {
    navigate(`/dmn/edit/${id}`);
  };

  const handleView = (id) => {
    navigate(`/dmn/view/${id}`);
  };

  const handleDelete = (id, name) => {
    confirm({
      title: 'Êtes-vous sûr de vouloir supprimer cette table de décision?',
      content: `Vous êtes sur le point de supprimer la table de décision "${name}". Cette action est irréversible.`,
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      async onOk() {
        try {
          await dmnService.deleteDmn(id);
          message.success('Table de décision supprimée avec succès');
          fetchDmns();
        } catch (error) {
          console.error('Erreur lors de la suppression de la table de décision:', error);
          message.error('Impossible de supprimer la table de décision');
        }
      },
    });
  };

  const filteredDmns = dmns.filter(dmn => 
    dmn.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'Nom',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
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
      title: 'Date de modification',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (text) => text ? new Date(text).toLocaleString() : '-',
      sorter: (a, b) => {
        if (!a.updatedAt || !b.updatedAt) return 0;
        return new Date(a.updatedAt) - new Date(b.updatedAt);
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
          <Tooltip title="Supprimer">
            <Button 
              type="text"
              danger
              icon={<DeleteOutlined />} 
              onClick={() => handleDelete(record.id, record.name)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <Card 
        title="Tables de décision DMN"
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
              onClick={() => navigate('/dmn/new')}
            >
              Nouvelle Table DMN
            </Button>
          </Space>
        }
      >
        <Table 
          dataSource={filteredDmns} 
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default DmnList; 