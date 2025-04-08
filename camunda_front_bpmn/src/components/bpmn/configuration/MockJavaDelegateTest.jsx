import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Snackbar,
  CircularProgress
} from '@mui/material';
import { Code as CodeIcon, PlayArrow } from '@mui/icons-material';
import ServiceTaskConfig from './ServiceTaskConfig';
import bpmnService from '../../../services/bpmnService';

// Cette composante est uniquement à des fins de test et de démonstration
// Elle simule l'interaction avec les JavaDelegates sans avoir besoin d'un processus BPMN actif
const MockJavaDelegateTest = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [mockDelegates, setMockDelegates] = useState([
    {
      className: 'org.example.delegate.LoggerDelegate',
      description: 'Un delegate simple qui enregistre des messages dans les logs'
    },
    {
      className: 'org.example.delegate.EmailSenderDelegate',
      description: 'Envoie un email via SMTP'
    },
    {
      className: 'org.example.delegate.DatabaseQueryDelegate',
      description: 'Exécute une requête SQL sur une base de données'
    }
  ]);

  const [configDialogOpen, setConfigDialogOpen] = useState(false);

  // Simuler un processus et une tâche pour la configuration
  const mockProcess = {
    id: 'mock-process-1',
    name: 'Processus de test'
  };

  const mockTask = {
    id: 'mock-service-task-1',
    name: 'Tâche de service de test',
    type: 'bpmn:ServiceTask'
  };

  // Hook pour simuler l'API getAvailableJavaDelegates
  useEffect(() => {
    // Remplacer l'implémentation réelle par la fonction de mock
    const originalGetAvailableDelegates = bpmnService.getAvailableJavaDelegates;

    bpmnService.getAvailableJavaDelegates = async () => {
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 500));

      // Renvoyer les délégués mock
      return { data: mockDelegates };
    };

    // Nettoyer le mock à la destruction du composant
    return () => {
      bpmnService.getAvailableJavaDelegates = originalGetAvailableDelegates;
    };
  }, [mockDelegates]);

  // Hook pour simuler l'API createJavaDelegate
  useEffect(() => {
    // Remplacer l'implémentation réelle par la fonction de mock
    const originalCreateDelegate = bpmnService.createJavaDelegate;

    bpmnService.createJavaDelegate = async (delegateData) => {
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Extraire les informations et ajouter à notre liste de mock
      setMockDelegates(prev => [
        ...prev,
        {
          className: delegateData.name,
          description: 'JavaDelegate créé via l\'interface utilisateur'
        }
      ]);

      return { data: { success: true, message: 'JavaDelegate créé avec succès' } };
    };

    // Nettoyer le mock à la destruction du composant
    return () => {
      bpmnService.createJavaDelegate = originalCreateDelegate;
    };
  }, []);

  // Hook pour simuler l'API configureServiceTask
  useEffect(() => {
    // Remplacer l'implémentation réelle par la fonction de mock
    const originalConfigureTask = bpmnService.configureServiceTask;

    bpmnService.configureServiceTask = async (processId, taskId, configData) => {
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 800));

      console.log('Configuration de la tâche de service:', {
        processId,
        taskId,
        config: configData
      });

      return {
        data: {
          success: true,
          message: 'Tâche configurée avec succès',
          config: configData
        }
      };
    };

    // Hook pour simuler l'API getServiceTasks
    const originalGetServiceTasks = bpmnService.getServiceTasks;

    bpmnService.getServiceTasks = async () => {
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 300));

      // Renvoyer une configuration vide (première utilisation)
      return {
        data: []
      };
    };

    // Nettoyer les mocks à la destruction du composant
    return () => {
      bpmnService.configureServiceTask = originalConfigureTask;
      bpmnService.getServiceTasks = originalGetServiceTasks;
    };
  }, []);

  const handleOpenConfig = () => {
    setConfigDialogOpen(true);
  };

  const handleCloseConfig = () => {
    setConfigDialogOpen(false);
  };

  const handleSaveConfig = (configData) => {
    console.log('Configuration sauvegardée:', configData);
    setSuccess('Configuration sauvegardée avec succès');
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Test de configuration de tâche de service
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Cette page est une démonstration pour tester la fonctionnalité de configuration de tâche de service
        sans avoir besoin d'interagir avec un processus BPMN réel.
      </Alert>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            JavaDelegates disponibles (simulés)
          </Typography>

          <List>
            {mockDelegates.map((delegate, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <CodeIcon />
                </ListItemIcon>
                <ListItemText
                  primary={delegate.className}
                  secondary={delegate.description}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      <Divider sx={{ mb: 3 }} />

      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<PlayArrow />}
          onClick={handleOpenConfig}
        >
          Configurer une tâche de service
        </Button>
      </Box>

      {/* Dialog de configuration */}
      <ServiceTaskConfig
        open={configDialogOpen}
        onClose={handleCloseConfig}
        task={mockTask}
        processId={mockProcess.id}
        onSave={handleSaveConfig}
      />

      {/* Notifications */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
      >
        <Alert onClose={() => setSuccess(null)} severity="success">
          {success}
        </Alert>
      </Snackbar>

      {loading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            zIndex: 9999
          }}
        >
          <CircularProgress />
        </Box>
      )}
    </Container>
  );
};

export default MockJavaDelegateTest;
