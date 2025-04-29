import React, { useState } from 'react';
import { Layout, Menu, Button, theme } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ShareAltOutlined,
  TableOutlined,
  FormOutlined,
  DashboardOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import './MainLayout.css';

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  return (
    <Layout className="main-layout">
      <Sider trigger={null} collapsible collapsed={collapsed} theme="light">
        <div className="logo">
          {!collapsed ? 'Camunda BPMN Editor' : 'BPMN'}
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname === '/' ? '/dashboard' : location.pathname]}
          onClick={handleMenuClick}
          items={[
            {
              key: '/dashboard',
              icon: <DashboardOutlined />,
              label: 'Tableau de bord',
            },
            {
              key: '/workflows',
              icon: <ShareAltOutlined />,
              label: 'Workflows BPMN',
            },
            {
              key: '/dmn',
              icon: <TableOutlined />,
              label: 'Tables DMN',
            },
            {
              key: '/forms',
              icon: <FormOutlined />,
              label: 'Formulaires',
            },
            {
              key: '/processes',
              icon: <DashboardOutlined />,
              label: 'Processus',
            },
            {
              type: 'divider',
            },
            {
              key: '/settings',
              icon: <SettingOutlined />,
              label: 'Paramètres',
            },
            {
              key: '/profile',
              icon: <UserOutlined />,
              label: 'Profil',
            },
            {
              key: '/logout',
              icon: <LogoutOutlined />,
              label: 'Déconnexion',
              danger: true,
            },
          ]}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
            position: 'sticky',
            top: 0,
            zIndex: 1,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
          <div className="header-content">
            {/* Ajouter ici des éléments d'en-tête supplémentaires si nécessaire */}
          </div>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout; 