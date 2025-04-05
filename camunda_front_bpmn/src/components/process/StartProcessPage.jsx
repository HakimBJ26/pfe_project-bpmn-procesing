import React, { useState, useEffect } from 'react';
import { 
  Container, Paper, Typography, TextField, Button, Grid, MenuItem, 
  Select, InputLabel, FormControl, Divider, Box, Alert, Snackbar,
  Card, CardContent, CircularProgress, Chip, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, FormHelperText
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { processService } from '../../services/processService';
import { useNavigate } from 'react-router-dom';

const StartProcessPage = () => {
  // États
  const [processes, setProcesses] = useState([]);
  const [selectedProcess, setSelectedProcess] = useState('');
  const [businessKey, setBusinessKey] = useState('');
  const [variables, setVariables] = useState([{ name: '', type: 'string', value: '' }]);
  const [loading, setLoading] = useState(false);
  const [processesLoading, setProcessesLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [processStarted, setProcessStarted] = useState(false);
  const [startedProcessId, setStartedProcessId] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  
  const navigate = useNavigate();

  // Types de variables supportés
  const variableTypes = [
    { value: 'string', label: 'Texte' },
    { value: 'integer', label: 'Nombre entier' },
    { value: 'double', label: 'Nombre décimal' },
    { value: 'boolean', label: 'Booléen' },
    { value: 'date', label: 'Date' },
    { value: 'json', label: 'JSON' }
  ];

  // Charger les définitions de processus
  useEffect(() => {
    fetchProcesses();
  }, []);

  const fetchProcesses = async () => {
    setProcessesLoading(true);
    try {
      // Utiliser le service bpmnService existant car processService.getProcessDefinitions n'est peut-être pas encore implémenté
      const response = await processService.getProcessDefinitions();
      if (response.data) {
        setProcesses(response.data);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des processus", err);
      setError("Impossible de charger les définitions de processus. Veuillez réessayer.");
    } finally {
      setProcessesLoading(false);
    }
  };

  // Gérer les changements dans les variables
  const handleVariableChange = (index, field, value) => {
    const newVariables = [...variables];
    newVariables[index][field] = value;
    setVariables(newVariables);
  };

  // Ajouter une nouvelle variable
  const addVariable = () => {
    setVariables([...variables, { name: '', type: 'string', value: '' }]);
  };

  // Supprimer une variable
  const confirmDeleteVariable = (index) => {
    setDeleteIndex(index);
    setOpenDeleteDialog(true);
  };

  const deleteVariable = () => {
    if (deleteIndex !== null) {
      const newVariables = variables.filter((_, i) => i !== deleteIndex);
      setVariables(newVariables);
      setOpenDeleteDialog(false);
      setDeleteIndex(null);
    }
  };

  // Valider le formulaire avant soumission
  const validateForm = () => {
    if (!selectedProcess) {
      setError("Veuillez sélectionner un processus à démarrer.");
      return false;
    }

    // Vérifier que toutes les variables ont un nom
    const invalidVariables = variables.filter(v => v.name.trim() === '');
    if (invalidVariables.length > 0 && variables.length > 1) {
      setError("Toutes les variables doivent avoir un nom.");
      return false;
    }

    return true;
  };

  // Convertir les variables en format attendu par l'API
  const prepareVariables = () => {
    const variablesObj = {};
    
    variables.forEach(variable => {
      if (variable.name.trim() === '') return;
      
      let value = variable.value;
      
      // Convertir la valeur selon le type
      switch (variable.type) {
        case 'integer':
          value = parseInt(value, 10);
          break;
        case 'double':
          value = parseFloat(value);
          break;
        case 'boolean':
          value = value.toLowerCase() === 'true';
          break;
        case 'date':
          value = new Date(value).toISOString();
          break;
        case 'json':
          try {
            value = JSON.parse(value);
          } catch (e) {
            console.error("Invalid JSON:", e);
            // Garder la valeur comme chaîne si JSON invalide
          }
          break;
        default:
          // Garder la valeur comme chaîne
          break;
      }
      
      variablesObj[variable.name] = value;
    });
    
    return variablesObj;
  };

  // Démarrer le processus
  const handleStartProcess = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const variablesObj = prepareVariables();
      const response = await processService.startProcess(
        selectedProcess,
        variablesObj,
        businessKey.trim() !== '' ? businessKey : null
      );
      
      setSuccess(true);
      setProcessStarted(true);
      setStartedProcessId(response.data.processInstanceId);
      console.log("Processus démarré:", response.data);
    } catch (err) {
      console.error("Erreur lors du démarrage du processus", err);
      setError(err.response?.data?.error || "Erreur lors du démarrage du processus. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  // Naviguer vers les tâches après démarrage du processus
  const goToTasks = () => {
    navigate('/monitoring/tasks');
  };

  // Naviguer vers l'instance de processus
  const viewProcessInstance = () => {
    if (startedProcessId) {
      navigate(`/monitoring/instances/${startedProcessId}`);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="h1" gutterBottom>
            Démarrer un processus
          </Typography>
          <Tooltip title="Rafraîchir la liste des processus">
            <IconButton onClick={fetchProcesses} disabled={processesLoading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        {processStarted ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <CheckIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Processus démarré avec succès!
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              L'instance {startedProcessId} a été créée.
            </Typography>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={viewProcessInstance}
                startIcon={<InfoIcon />}
              >
                Voir les détails
              </Button>
              <Button 
                variant="outlined" 
                onClick={goToTasks}
              >
                Aller aux tâches
              </Button>
              <Button 
                variant="outlined" 
                color="secondary" 
                onClick={() => {
                  setProcessStarted(false);
                  setSelectedProcess('');
                  setBusinessKey('');
                  setVariables([{ name: '', type: 'string', value: '' }]);
                }}
              >
                Démarrer un autre processus
              </Button>
            </Box>
          </Box>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); handleStartProcess(); }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Sélection du processus
                    </Typography>
                    <FormControl fullWidth required>
                      <InputLabel id="process-select-label">Processus</InputLabel>
                      <Select
                        labelId="process-select-label"
                        id="process-select"
                        value={selectedProcess}
                        label="Processus"
                        onChange={(e) => setSelectedProcess(e.target.value)}
                        disabled={processesLoading}
                        sx={{ mb: 2 }}
                      >
                        {processesLoading ? (
                          <MenuItem disabled>Chargement des processus...</MenuItem>
                        ) : processes.length > 0 ? (
                          processes.map((process) => (
                            <MenuItem key={process.key} value={process.key}>
                              {process.name || process.key} {process.version && `(v${process.version})`}
                            </MenuItem>
                          ))
                        ) : (
                          <MenuItem disabled>Aucun processus disponible</MenuItem>
                        )}
                      </Select>
                      {processesLoading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                          <CircularProgress size={24} />
                        </Box>
                      )}
                      {!processesLoading && processes.length === 0 && (
                        <Alert severity="info" sx={{ mt: 1 }}>
                          Aucun processus disponible. Veuillez d'abord créer et déployer un processus BPMN.
                        </Alert>
                      )}
                    </FormControl>
                    
                    <TextField
                      fullWidth
                      label="Clé métier (optionnelle)"
                      variant="outlined"
                      value={businessKey}
                      onChange={(e) => setBusinessKey(e.target.value)}
                      helperText="Identifiant métier pour cette instance (facilitera son suivi)"
                      sx={{ mt: 2 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">
                        Variables du processus
                      </Typography>
                      <Button 
                        startIcon={<AddIcon />} 
                        onClick={addVariable}
                        variant="outlined"
                        size="small"
                      >
                        Ajouter variable
                      </Button>
                    </Box>
                    
                    {variables.map((variable, index) => (
                      <Box 
                        key={index} 
                        sx={{ 
                          mb: 2, 
                          p: 2, 
                          border: '1px solid #e0e0e0', 
                          borderRadius: 1,
                          backgroundColor: '#f9f9f9'
                        }}
                      >
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} sm={4}>
                            <TextField
                              fullWidth
                              label="Nom"
                              placeholder="nomVariable"
                              value={variable.name}
                              onChange={(e) => handleVariableChange(index, 'name', e.target.value)}
                              required={index === 0 || variable.value !== ''}
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            <FormControl fullWidth size="small">
                              <InputLabel id={`type-label-${index}`}>Type</InputLabel>
                              <Select
                                labelId={`type-label-${index}`}
                                value={variable.type}
                                label="Type"
                                onChange={(e) => handleVariableChange(index, 'type', e.target.value)}
                              >
                                {variableTypes.map((type) => (
                                  <MenuItem key={type.value} value={type.value}>
                                    {type.label}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <TextField
                              fullWidth
                              label="Valeur"
                              value={variable.value}
                              onChange={(e) => handleVariableChange(index, 'value', e.target.value)}
                              required={index === 0 || variable.name !== ''}
                              multiline={variable.type === 'json'}
                              rows={variable.type === 'json' ? 3 : 1}
                              type={variable.type === 'date' ? 'date' : 'text'}
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={12} sm={1} sx={{ textAlign: 'center' }}>
                            {variables.length > 1 && (
                              <Tooltip title="Supprimer cette variable">
                                <IconButton 
                                  color="error" 
                                  onClick={() => confirmDeleteVariable(index)}
                                  size="small"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Grid>
                        </Grid>
                      </Box>
                    ))}
                    
                    {variables.length === 0 && (
                      <Typography variant="body2" color="text.secondary" sx={{ my: 2, textAlign: 'center' }}>
                        Aucune variable définie. Cliquez sur "Ajouter variable" pour en créer.
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sx={{ mt: 2, textAlign: 'center' }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<PlayArrowIcon />}
                  onClick={handleStartProcess}
                  disabled={loading || !selectedProcess}
                  sx={{ minWidth: 200 }}
                >
                  {loading ? (
                    <>
                      <CircularProgress size={24} sx={{ mr: 1 }} color="inherit" />
                      Démarrage...
                    </>
                  ) : (
                    "Démarrer le processus"
                  )}
                </Button>
              </Grid>
            </Grid>
          </form>
        )}
      </Paper>
      
      {/* Boîte de dialogue de confirmation pour la suppression de variable */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Supprimer la variable ?</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer cette variable ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Annuler</Button>
          <Button onClick={deleteVariable} color="error">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Notification de succès */}
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" onClose={() => setSuccess(false)}>
          Processus démarré avec succès !
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default StartProcessPage;
