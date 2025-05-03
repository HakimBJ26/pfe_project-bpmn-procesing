import React, { useState } from 'react';
import { Tabs, Card, Typography, Alert, Divider } from 'antd';
import ProcessInstanceList from '../components/process/ProcessInstanceList';
import TaskList from '../components/task/TaskList';

const { TabPane } = Tabs;
const { Title, Paragraph } = Typography;

const ProcessTestPage = () => {
  const [activeKey, setActiveKey] = useState('processes');
  
  return (
    <div className="process-test-page" style={{ padding: '20px' }}>
      <Title level={2}>Test de Workflow</Title>
      
      <Alert
        message="Environnement de test de workflow"
        description="Cette page vous permet de tester les workflows que vous avez déployés. Vous pouvez démarrer de nouvelles instances de processus, voir les tâches en attente et les compléter."
        type="info"
        showIcon
        style={{ marginBottom: 20 }}
      />
      
      <Card>
        <Tabs activeKey={activeKey} onChange={setActiveKey}>
          <TabPane tab="Processus déployés" key="processes">
            <Paragraph>
              Liste des processus déployés. Vous pouvez démarrer une nouvelle instance en cliquant sur le bouton "Démarrer".
            </Paragraph>
            <Divider />
            <ProcessInstanceList />
          </TabPane>
          
          <TabPane tab="Tâches en attente" key="tasks">
            <Paragraph>
              Liste des tâches utilisateur en attente. Vous pouvez les assigner, les compléter ou les libérer.
            </Paragraph>
            <Divider />
            <TaskList />
          </TabPane>
        </Tabs>
      </Card>
      
      <div style={{ marginTop: 20 }}>
        <Card title="Guide de test rapide">
          <ol>
            <li>Créez un workflow dans l'éditeur BPMN</li>
            <li>Déployez-le sur le moteur Camunda</li>
            <li>Dans l'onglet "Processus déployés", démarrez une nouvelle instance</li>
            <li>Passez à l'onglet "Tâches en attente" pour voir les tâches générées</li>
            <li>Complétez les tâches pour faire avancer le workflow</li>
            <li>Observez comment les variables sont transmises entre les étapes</li>
          </ol>
        </Card>
      </div>
    </div>
  );
};

export default ProcessTestPage; 