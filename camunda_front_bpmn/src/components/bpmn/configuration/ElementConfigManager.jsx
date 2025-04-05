import React, { useState, useEffect } from 'react';
import UserTaskConfig from './UserTaskConfig';
import ServiceTaskConfig from './ServiceTaskConfig';
import GatewayConfig from './GatewayConfig';
import {
  Fab,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  Snackbar,
  Backdrop,
  CircularProgress
} from '@mui/material';
import {
  Settings as SettingsIcon,
  TaskAlt as TaskIcon,
  Code as CodeIcon,
  CallSplit as GatewayIcon
} from '@mui/icons-material';
import bpmnService from '../../../services/bpmnService';

// Types d'éléments BPMN supportés
const ELEMENT_TYPES = {
  USER_TASK: 'bpmn:UserTask',
  SERVICE_TASK: 'bpmn:ServiceTask',
  EXCLUSIVE_GATEWAY: 'bpmn:ExclusiveGateway',
  INCLUSIVE_GATEWAY: 'bpmn:InclusiveGateway',
  PARALLEL_GATEWAY: 'bpmn:ParallelGateway',
  SEND_TASK: 'bpmn:SendTask'
};

const ElementConfigManager = ({ modeler, selectedElement, processId, onConfigSaved, directDisplay = false }) => {
  const [showConfig, setShowConfig] = useState(directDisplay);
  const [configType, setConfigType] = useState(null);
  const [elementData, setElementData] = useState(null);
  const [outgoingFlows, setOutgoingFlows] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);



  // Surveiller les changements d'élément sélectionné
  useEffect(() => {
    if (selectedElement) {
      const elementType = selectedElement.type;

      // Récupérer les informations sur l'élément
      setElementData({
        id: selectedElement.id,
        name: selectedElement.businessObject.name || selectedElement.id,
        type: elementType
      });

      // Déterminer le type de configuration
      if (elementType === ELEMENT_TYPES.USER_TASK) {
        setConfigType('userTask');
      } else if (elementType === ELEMENT_TYPES.SERVICE_TASK || elementType === ELEMENT_TYPES.SEND_TASK) {
        setConfigType('serviceTask');
      } else if (
        elementType === ELEMENT_TYPES.EXCLUSIVE_GATEWAY ||
        elementType === ELEMENT_TYPES.INCLUSIVE_GATEWAY ||
        elementType === ELEMENT_TYPES.PARALLEL_GATEWAY
      ) {
        setConfigType('gateway');

        // Récupérer les flux sortants pour les gateways
        const outgoing = selectedElement.outgoing || [];
        const flows = outgoing.map(flow => {
          const target = flow.target;
          return {
            id: flow.id,
            targetId: target.id,
            targetName: target.businessObject.name || target.id,
            targetType: target.type
          };
        });
        setOutgoingFlows(flows);
      } else {
        setConfigType(null);
      }

      // Si l'affichage direct est activé, ouvrir automatiquement la configuration
      if (directDisplay) {
        setShowConfig(true);
      }
    } else {
      setElementData(null);
      setConfigType(null);
    }
  }, [selectedElement, directDisplay]);

  const handleOpenConfig = () => {
    setShowConfig(true);
  };

  const handleCloseConfig = () => {
    setShowConfig(false);
  };

  const handleConfigSaved = (configData) => {
    if (onConfigSaved) {
      onConfigSaved(configData);
    }

    setSuccess(`Configuration de l'élément ${elementData.name} enregistrée avec succès`);
    // Actualiser la représentation visuelle de l'élément si nécessaire
    updateElementVisualCues(elementData.id);
  };

  // Mettre à jour les indices visuels sur le diagramme
  const updateElementVisualCues = (elementId) => {
    if (!modeler) return;

    const elementRegistry = modeler.get('elementRegistry');
    const modeling = modeler.get('modeling');
    const element = elementRegistry.get(elementId);

    if (!element) return;

    // Ajouter des indicateurs visuels pour montrer que l'élément est configuré
    // Par exemple, changer la couleur ou ajouter une icône
    try {
      // Exemple: ajouter un marqueur visuel pour indiquer que l'élément est configuré
      const colors = {
        userTask: { stroke: '#1976d2', fill: '#bbdefb' },
        serviceTask: { stroke: '#388e3c', fill: '#c8e6c9' },
        gateway: { stroke: '#f57c00', fill: '#ffe0b2' }
      };

      if (configType && colors[configType]) {
        modeling.setColor(element, {
          stroke: colors[configType].stroke,
          fill: colors[configType].fill
        });
      }
    } catch (err) {
      console.error("Erreur lors de la mise à jour des indicateurs visuels", err);
    }
  };

  if (!selectedElement || !configType) {
    return null;
  }

  // Si directDisplay est activé, afficher directement la configuration
  if (directDisplay) {
    console.log('Rendering direct display configuration for:', configType);
    console.log('Element data:', elementData);

    return (
      <>
        {loading && (
          <Backdrop open={loading} sx={{ zIndex: 9999 }}>
            <CircularProgress color="primary" />
          </Backdrop>
        )}

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError('')}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!success}
          autoHideDuration={6000}
          onClose={() => setSuccess('')}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setSuccess('')} severity="success" sx={{ width: '100%' }}>
            {success}
          </Alert>
        </Snackbar>

        <Box sx={{ width: '100%' }}>
          {configType === 'userTask' && (
            <UserTaskConfig
              open={showConfig}
              onClose={handleCloseConfig}
              task={{
                id: elementData.id,
                name: elementData.name,
                type: elementData.type
              }}
              processId={processId}
              onSave={handleConfigSaved}
            />
          )}

          {configType === 'serviceTask' && (
            <ServiceTaskConfig
              open={showConfig}
              onClose={handleCloseConfig}
              task={{
                id: elementData.id,
                name: elementData.name,
                type: elementData.type
              }}
              processId={processId}
              onSave={handleConfigSaved}
            />
          )}

          {configType === 'gateway' && (
            <GatewayConfig
            open={showConfig}
            onClose={handleCloseConfig}
              gateway={{
                id: elementData.id,
                name: elementData.name,
                type: elementData.type,
                outgoingFlows: outgoingFlows
              }}
              processId={processId}
              onSave={handleConfigSaved}
            />
          )}
        </Box>
      </>
    );
  }

  // Sinon, afficher le bouton flottant et la boîte de dialogue
  return (
    <>
      <Tooltip title="Configurer cet élément">
        <Fab
          color="primary"
          size="medium"
          onClick={handleOpenConfig}
          sx={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            zIndex: 1000
          }}
        >
          {configType === 'userTask' && <TaskIcon />}
          {configType === 'serviceTask' && <CodeIcon />}
          {configType === 'gateway' && <GatewayIcon />}
          {!configType && <SettingsIcon />}
        </Fab>
      </Tooltip>

      {/* Dialogues de configuration spécifiques à chaque type */}
      {configType === 'userTask' && (
        <UserTaskConfig
          open={showConfig}
          onClose={handleCloseConfig}
          task={elementData}
          processId={processId}
          onSave={handleConfigSaved}
        />
      )}

      {configType === 'serviceTask' && (
        <ServiceTaskConfig
          open={showConfig}
          onClose={handleCloseConfig}
          task={elementData}
          processId={processId}
          onSave={handleConfigSaved}
        />
      )}

      {configType === 'gateway' && (
        <GatewayConfig
          open={showConfig}
          onClose={handleCloseConfig}
          gateway={elementData}
          processId={processId}
          outgoingFlows={outgoingFlows}
          onSave={handleConfigSaved}
        />
      )}

      {/* Notifications */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" variant="filled">
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled">
          {success}
        </Alert>
      </Snackbar>

      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
};

export default ElementConfigManager;
