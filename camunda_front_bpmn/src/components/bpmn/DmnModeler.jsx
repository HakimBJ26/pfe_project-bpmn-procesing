import React, { useEffect, useRef, useState } from 'react';
import DmnJS from 'dmn-js/lib/Modeler';
import 'dmn-js/dist/assets/diagram-js.css';
import 'dmn-js/dist/assets/dmn-js-shared.css';
import 'dmn-js/dist/assets/dmn-js-drd.css';
import 'dmn-js/dist/assets/dmn-js-decision-table.css';
import 'dmn-js/dist/assets/dmn-js-decision-table-controls.css';
import 'dmn-js/dist/assets/dmn-js-literal-expression.css';
import 'dmn-font/dist/css/dmn.css';
import 'react-toastify/dist/ReactToastify.css';
import {
  Box, Paper, Button, Typography, CircularProgress, Alert, Divider, Stack, Snackbar,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton
} from '@mui/material';
import { FileUpload, Save, FileDownload, CloudUpload, PlayArrow, List, Add } from '@mui/icons-material';
import './DmnModeler.css';
import dmnService from '../../services/dmnService';

const emptyDmn = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/" xmlns:dmndi="https://www.omg.org/spec/DMN/20191111/DMNDI/" xmlns:dc="http://www.omg.org/spec/DMN/20180521/DC/" xmlns:camunda="http://camunda.org/schema/1.0/dmn" id="Definitions_1" name="Decision" namespace="http://camunda.org/schema/1.0/dmn">
  <decision id="Decision_1" name="Decision 1">
    <decisionTable id="decisionTable_1" hitPolicy="FIRST">
      <input id="input_1">
        <inputExpression id="inputExpression_1" typeRef="string">
          <text>input1</text>
        </inputExpression>
      </input>
      <output id="output_1" typeRef="string" />
      <rule id="rule_1">
        <inputEntry id="inputEntry_1">
          <text>"value"</text>
        </inputEntry>
        <outputEntry id="outputEntry_1">
          <text>"result"</text>
        </outputEntry>
      </rule>
    </decisionTable>
  </decision>
  <dmndi:DMNDI>
    <dmndi:DMNDiagram id="DMNDiagram_1">
      <dmndi:DMNShape id="DMNShape_1" dmnElementRef="Decision_1">
        <dc:Bounds height="80" width="180" x="150" y="150" />
      </dmndi:DMNShape>
    </dmndi:DMNDiagram>
  </dmndi:DMNDI>
</definitions>`;

const DmnModeler = () => {
  const containerRef = useRef(null);
  const [dmnJS, setDmnJS] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveMessage, setSaveMessage] = useState('');
  const fileInputRef = useRef(null);
  const [dmnName, setDmnName] = useState('Nouvelle décision');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deploymentId, setDeploymentId] = useState('');
  const [decisionKey, setDecisionKey] = useState('');
  const [execDialogOpen, setExecDialogOpen] = useState(false);
  const [variables, setVariables] = useState('{}');
  const [result, setResult] = useState(null);
  const [currentDmnId, setCurrentDmnId] = useState(null);
  const [success, setSuccess] = useState('');

  // Initialize DMN modeler
  useEffect(() => {
    if (!containerRef.current) return;

    const modeler = new DmnJS({
      container: containerRef.current,
      keyboard: {
        bindTo: window
      }
    });

    // Subscribe to events
    modeler.on('import.done', (event) => {
      const { error } = event;

      if (error) {
        setError('Failed to render DMN: ' + error.message);
      } else {
        setError(null);

        // Access active viewer
        const activeViewer = modeler.getActiveViewer();

        // Set default zoom
        if (activeViewer && activeViewer.get) {
          const canvas = activeViewer.get('canvas');
          if (canvas && canvas.zoom) {
            canvas.zoom('fit-viewport');
          }
        }
      }

      setLoading(false);
    });

    // Import empty DMN
    modeler.importXML(emptyDmn);
    setDmnJS(modeler);

    return () => {
      modeler.destroy();
    };
  }, []);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file || !dmnJS) return;

    setLoading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      const xml = e.target?.result;
      if (typeof xml === 'string') {
        dmnJS.importXML(xml);
      }
    };

    reader.onerror = () => {
      setError('Failed to read file');
      setLoading(false);
    };

    reader.readAsText(file);
  };

  const handleSave = async () => {
    if (!dmnJS) return;

    try {
      const { xml } = await dmnJS.saveXML({ format: true });
      const blob = new Blob([xml], { type: 'text/xml' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'decision.dmn';
      a.click();
      window.URL.revokeObjectURL(url);

      setSaveMessage('DMN file downloaded successfully');
    } catch (err) {
      console.error('Error saving DMN:', err);
      setError('Failed to save DMN file: ' + err.message);
    }
  };

  const handleApiError = async (error) => {
    if (error.response?.status === 401) {
      // Si nécessaire, ajoutez ici une logique de déconnexion
      return 'Session expirée, veuillez vous reconnecter';
    }

    try {
      const errorData = await error.json();
      return errorData.message || errorData.error || 'Erreur lors de la requête';
    } catch (e) {
      return error.message || 'Erreur inconnue';
    }
  };

  const handleOpenCreateDialog = () => {
    setCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
  };

  const handleCreateDmn = async () => {
    if (!dmnName) {
      setError('Veuillez saisir un nom pour la décision');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await dmnService.createEmptyDmn({
        name: dmnName,
        description: '',
        category: ''
      });

      const newDmnId = response.data.id;
      setCurrentDmnId(newDmnId);
      setDecisionKey(response.data.decisionKey);
      setSuccess(`Nouvelle décision créée: ${response.data.name}`);
      setCreateDialogOpen(false);

      // Charger un diagramme vide
      await dmnJS.importXML(emptyDmn);

    } catch (err) {
      console.error("Erreur lors de la création de la décision", err);
      setError("Erreur lors de la création de la décision: " +
        (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeploy = async () => {
    if (!dmnJS) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Exporter le XML DMN
      const { xml } = await dmnJS.saveXML({ format: true });

      // Créer un fichier à partir du XML
      const blob = new Blob([xml], { type: 'application/xml' });
      const file = new File([blob], 'decision.dmn');

      // Appeler le service de déploiement
      const response = await dmnService.deployDmn(file);

      setDeploymentId(response.data.deploymentId);
      setDecisionKey(response.data.decisionKey);
      setSuccess('Décision DMN déployée avec succès');
    } catch (err) {
      const errorMessage = await handleApiError(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDmn = async () => {
    if (!dmnJS || !currentDmnId) {
      setError('Aucune décision active à sauvegarder');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { xml } = await dmnJS.saveXML({ format: true });

      // Appel à l'API pour sauvegarder le XML de la décision
      await dmnService.updateDmnXml(currentDmnId, { xml });

      setSuccess('Décision sauvegardée avec succès');
    } catch (err) {
      console.error("Erreur lors de la sauvegarde", err);
      setError("Erreur lors de la sauvegarde: " +
        (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenExecDialog = () => {
    if (!decisionKey) {
      setError('Veuillez d\'abord déployer une décision');
      return;
    }
    setExecDialogOpen(true);
  };

  const handleCloseExecDialog = () => {
    setExecDialogOpen(false);
  };

  const handleExecuteDecision = async () => {
    if (!decisionKey) {
      setError('Aucune décision déployée à exécuter');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let parsedVariables = {};
      try {
        parsedVariables = JSON.parse(variables);
      } catch (e) {
        throw new Error('Format des variables invalide. Utilisez un objet JSON valide.');
      }

      const response = await dmnService.evaluateDecision(decisionKey, parsedVariables);
      setResult(response.data);
      setSuccess('Décision exécutée avec succès');
    } catch (err) {
      const errorMessage = await handleApiError(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 2 }}>
      <Snackbar
        open={!!saveMessage}
        autoHideDuration={3000}
        onClose={() => setSaveMessage('')}
        message={saveMessage}
      />

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h4" gutterBottom>DMN Decision Table Modeler</Typography>
        <Divider sx={{ mb: 2 }} />

        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            accept=".dmn"
            style={{ display: 'none' }}
          />
          <Button
            variant="outlined"
            startIcon={<FileUpload />}
            onClick={handleFileSelect}
            disabled={loading}
          >
            Importer DMN
          </Button>
          <Button
            variant="outlined"
            startIcon={<FileDownload />}
            onClick={handleSave}
            disabled={loading}
          >
            Télécharger DMN
          </Button>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={handleOpenCreateDialog}
            disabled={loading}
          >
            Nouvelle décision
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Save />}
            onClick={handleSaveDmn}
            disabled={loading || !currentDmnId}
          >
            Sauvegarder
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<CloudUpload />}
            onClick={handleDeploy}
            disabled={loading}
          >
            Déployer DMN
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<PlayArrow />}
            onClick={handleOpenExecDialog}
            disabled={loading || !decisionKey}
          >
            Exécuter décision
          </Button>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {decisionKey && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Decision Key: {decisionKey} {deploymentId && ` | Deployment ID: ${deploymentId}`}
          </Alert>
        )}
      </Paper>

      <Paper
        sx={{
          flex: 1,
          position: 'relative',
          minHeight: '600px'
        }}
      >
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              zIndex: 10
            }}
          >
            <CircularProgress />
          </Box>
        )}

        <div
          ref={containerRef}
          className="dmn-modeler-container"
        ></div>
      </Paper>

      {/* Dialog pour créer une nouvelle décision */}
      <Dialog open={createDialogOpen} onClose={handleCloseCreateDialog}>
        <DialogTitle>Créer une nouvelle décision DMN</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nom de la décision"
            type="text"
            fullWidth
            variant="outlined"
            value={dmnName}
            onChange={(e) => setDmnName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog}>Annuler</Button>
          <Button onClick={handleCreateDmn} variant="contained" color="primary">
            Créer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog pour exécuter une décision */}
      <Dialog
        open={execDialogOpen}
        onClose={handleCloseExecDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Exécuter la décision DMN</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom>
            Decision Key: {decisionKey}
          </Typography>
          <TextField
            margin="dense"
            label="Variables d'entrée (format JSON)"
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            value={variables}
            onChange={(e) => setVariables(e.target.value)}
            placeholder='{"input1": "valeur"}'
          />

          {result && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6">Résultat:</Typography>
              <Paper sx={{ p: 2, bgcolor: '#f5f5f5', maxHeight: '200px', overflow: 'auto' }}>
                <pre>{JSON.stringify(result, null, 2)}</pre>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseExecDialog}>Fermer</Button>
          <Button onClick={handleExecuteDecision} variant="contained" color="primary">
            Exécuter
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DmnModeler;
