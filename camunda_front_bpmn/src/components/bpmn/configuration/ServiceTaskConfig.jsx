import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Box,
  Divider,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Paper,
  Snackbar,
  Alert
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Code as CodeIcon
} from '@mui/icons-material';
import { CodeEditor } from './CodeEditor';
import bpmnService from '../../../services/bpmnService';

const ServiceTaskConfig = ({ open, onClose, task, processId, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    implementation: '',
    implementationType: 'class',
    inputParameters: '[]',
    outputParameters: '[]',
    retries: 3,
    retryTimeout: 'PT5M',
    asyncBefore: false,
    asyncAfter: false,
    exclusive: true
  });

  const [inputParams, setInputParams] = useState([]);
  const [outputParams, setOutputParams] = useState([]);
  
  // Options pour les types d'implémentation
  const implementationTypes = [
    { value: 'class', label: 'Classe Java' },
    { value: 'delegateExpression', label: 'Expression de délégué (${...})' },
    { value: 'expression', label: 'Expression' },
    { value: 'external', label: 'Tâche externe' },
    { value: 'connector', label: 'Connecteur' }
  ];
  
  useEffect(() => {
    if (task) {
      // Charger les configurations existantes si disponibles
      const loadTaskConfig = async () => {
        try {
          setLoading(true);
          const response = await bpmnService.getServiceTasks(processId);
          const taskConfig = response.data.find(t => t.taskId === task.id);
          
          if (taskConfig) {
            setFormData({
              implementation: taskConfig.implementation || '',
              implementationType: taskConfig.implementationType || 'class',
              inputParameters: taskConfig.inputParameters || '[]',
              outputParameters: taskConfig.outputParameters || '[]',
              retries: taskConfig.retries || 3,
              retryTimeout: taskConfig.retryTimeout || 'PT5M',
              asyncBefore: taskConfig.asyncBefore || false,
              asyncAfter: taskConfig.asyncAfter || false,
              exclusive: taskConfig.exclusive !== false
            });
            
            try {
              setInputParams(JSON.parse(taskConfig.inputParameters || '[]'));
              setOutputParams(JSON.parse(taskConfig.outputParameters || '[]'));
            } catch (e) {
              console.error("Erreur lors de l'analyse des paramètres", e);
              setInputParams([]);
              setOutputParams([]);
            }
          }
        } catch (err) {
          console.error("Erreur lors du chargement de la configuration", err);
          setError("Erreur lors du chargement de la configuration");
        } finally {
          setLoading(false);
        }
      };
      
      loadTaskConfig();
    }
  }, [task, processId]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };
  
  // Gestion des paramètres d'entrée
  const handleAddInputParam = () => {
    const newParam = {
      name: '',
      value: '',
      type: 'String'
    };
    setInputParams([...inputParams, newParam]);
  };
  
  const handleInputParamChange = (index, field, value) => {
    const updated = [...inputParams];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setInputParams(updated);
    setFormData({
      ...formData,
      inputParameters: JSON.stringify(updated)
    });
  };
  
  const handleRemoveInputParam = (index) => {
    const updated = inputParams.filter((_, i) => i !== index);
    setInputParams(updated);
    setFormData({
      ...formData,
      inputParameters: JSON.stringify(updated)
    });
  };
  
  // Gestion des paramètres de sortie
  const handleAddOutputParam = () => {
    const newParam = {
      name: '',
      value: '',
      type: 'String'
    };
    setOutputParams([...outputParams, newParam]);
  };
  
  const handleOutputParamChange = (index, field, value) => {
    const updated = [...outputParams];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setOutputParams(updated);
    setFormData({
      ...formData,
      outputParameters: JSON.stringify(updated)
    });
  };
  
  const handleRemoveOutputParam = (index) => {
    const updated = outputParams.filter((_, i) => i !== index);
    setOutputParams(updated);
    setFormData({
      ...formData,
      outputParameters: JSON.stringify(updated)
    });
  };
  
  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Mettre à jour les paramètres dans formData
      const configData = {
        ...formData,
        inputParameters: JSON.stringify(inputParams),
        outputParameters: JSON.stringify(outputParams)
      };
      
      const response = await bpmnService.configureServiceTask(processId, task.id, configData);
      
      setSuccess("Configuration enregistrée avec succès");
      
      if (onSave) {
        onSave(response.data);
      }
      
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (err) {
      console.error("Erreur lors de la sauvegarde", err);
      setError("Erreur lors de la sauvegarde: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };
  
  if (!task) return null;
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: 8
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: 'primary.main', 
        color: 'white',
        borderBottom: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <CodeIcon />
        Configuration de la tâche de service: {task.name || task.id}
      </DialogTitle>
      
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Implémentation
          </Typography>
          
          <FormControl fullWidth>
            <InputLabel id="implementationType-label">Type d'implémentation</InputLabel>
            <Select
              labelId="implementationType-label"
              name="implementationType"
              value={formData.implementationType}
              onChange={handleInputChange}
              label="Type d'implémentation"
            >
              {implementationTypes.map(type => (
                <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            label="Implémentation"
            name="implementation"
            value={formData.implementation}
            onChange={handleInputChange}
            fullWidth
            helperText={
              formData.implementationType === 'class' 
                ? "Nom complet de la classe (ex: com.example.MyDelegate)" 
                : formData.implementationType === 'delegateExpression' 
                  ? "Expression Spring (ex: ${myDelegate})" 
                  : "Expression ou identifiant"
            }
          />
          
          <Divider />
          
          <Typography variant="h6" gutterBottom>
            Paramètres d'entrée
          </Typography>
          
          <Paper variant="outlined" sx={{ p: 2 }}>
            {inputParams.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography color="text.secondary">
                  Aucun paramètre d'entrée défini
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2}>
                {inputParams.map((param, index) => (
                  <Box 
                    key={index}
                    sx={{ 
                      p: 2, 
                      border: 1, 
                      borderColor: 'divider', 
                      borderRadius: 1,
                      position: 'relative'
                    }}
                  >
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleRemoveInputParam(index)}
                      sx={{ position: 'absolute', top: 8, right: 8 }}
                    >
                      <DeleteIcon />
                    </IconButton>
                    
                    <Stack spacing={2}>
                      <TextField
                        label="Nom du paramètre"
                        value={param.name}
                        onChange={(e) => handleInputParamChange(index, 'name', e.target.value)}
                        fullWidth
                      />
                      
                      <Stack direction="row" spacing={2}>
                        <FormControl fullWidth>
                          <InputLabel>Type</InputLabel>
                          <Select
                            value={param.type}
                            label="Type"
                            onChange={(e) => handleInputParamChange(index, 'type', e.target.value)}
                          >
                            <MenuItem value="String">Texte</MenuItem>
                            <MenuItem value="Integer">Nombre entier</MenuItem>
                            <MenuItem value="Double">Nombre décimal</MenuItem>
                            <MenuItem value="Boolean">Booléen</MenuItem>
                            <MenuItem value="Date">Date</MenuItem>
                            <MenuItem value="Object">Objet</MenuItem>
                            <MenuItem value="Expression">Expression</MenuItem>
                          </Select>
                        </FormControl>
                        
                        <TextField
                          label="Valeur"
                          value={param.value}
                          onChange={(e) => handleInputParamChange(index, 'value', e.target.value)}
                          fullWidth
                          multiline={param.type === 'Object' || param.type === 'Expression'}
                          rows={param.type === 'Object' || param.type === 'Expression' ? 3 : 1}
                        />
                      </Stack>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button
                startIcon={<AddIcon />}
                variant="outlined"
                onClick={handleAddInputParam}
              >
                Ajouter un paramètre d'entrée
              </Button>
            </Box>
          </Paper>
          
          <Divider />
          
          <Typography variant="h6" gutterBottom>
            Paramètres de sortie
          </Typography>
          
          <Paper variant="outlined" sx={{ p: 2 }}>
            {outputParams.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography color="text.secondary">
                  Aucun paramètre de sortie défini
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2}>
                {outputParams.map((param, index) => (
                  <Box 
                    key={index}
                    sx={{ 
                      p: 2, 
                      border: 1, 
                      borderColor: 'divider', 
                      borderRadius: 1,
                      position: 'relative'
                    }}
                  >
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleRemoveOutputParam(index)}
                      sx={{ position: 'absolute', top: 8, right: 8 }}
                    >
                      <DeleteIcon />
                    </IconButton>
                    
                    <Stack spacing={2}>
                      <TextField
                        label="Nom du paramètre"
                        value={param.name}
                        onChange={(e) => handleOutputParamChange(index, 'name', e.target.value)}
                        fullWidth
                      />
                      
                      <Stack direction="row" spacing={2}>
                        <FormControl fullWidth>
                          <InputLabel>Type</InputLabel>
                          <Select
                            value={param.type}
                            label="Type"
                            onChange={(e) => handleOutputParamChange(index, 'type', e.target.value)}
                          >
                            <MenuItem value="String">Texte</MenuItem>
                            <MenuItem value="Integer">Nombre entier</MenuItem>
                            <MenuItem value="Double">Nombre décimal</MenuItem>
                            <MenuItem value="Boolean">Booléen</MenuItem>
                            <MenuItem value="Date">Date</MenuItem>
                            <MenuItem value="Object">Objet</MenuItem>
                            <MenuItem value="Expression">Expression</MenuItem>
                          </Select>
                        </FormControl>
                        
                        <TextField
                          label="Expression"
                          value={param.value}
                          onChange={(e) => handleOutputParamChange(index, 'value', e.target.value)}
                          fullWidth
                          multiline={param.type === 'Object' || param.type === 'Expression'}
                          rows={param.type === 'Object' || param.type === 'Expression' ? 3 : 1}
                          helperText="Expression pour extraire la valeur (ex: ${result})"
                        />
                      </Stack>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button
                startIcon={<AddIcon />}
                variant="outlined"
                onClick={handleAddOutputParam}
              >
                Ajouter un paramètre de sortie
              </Button>
            </Box>
          </Paper>
          
          <Divider />
          
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">Options avancées</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={3}>
                <TextField
                  label="Nombre de tentatives"
                  name="retries"
                  type="number"
                  value={formData.retries}
                  onChange={handleInputChange}
                  inputProps={{ min: 0 }}
                  fullWidth
                  helperText="Nombre de fois que la tâche sera réessayée en cas d'échec"
                />
                
                <TextField
                  label="Intervalle entre les tentatives"
                  name="retryTimeout"
                  value={formData.retryTimeout}
                  onChange={handleInputChange}
                  fullWidth
                  helperText="Format ISO 8601 durée (ex: PT5M pour 5 minutes, PT1H pour 1 heure)"
                />
                
                <Box sx={{ mt: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.asyncBefore}
                        onChange={handleSwitchChange}
                        name="asyncBefore"
                      />
                    }
                    label="Exécution asynchrone avant la tâche"
                  />
                </Box>
                
                <Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.asyncAfter}
                        onChange={handleSwitchChange}
                        name="asyncAfter"
                      />
                    }
                    label="Exécution asynchrone après la tâche"
                  />
                </Box>
                
                <Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.exclusive}
                        onChange={handleSwitchChange}
                        name="exclusive"
                      />
                    }
                    label="Exécution exclusive (recommandé)"
                  />
                </Box>
              </Stack>
            </AccordionDetails>
          </Accordion>
        </Stack>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, bgcolor: 'grey.50' }}>
        <Button 
          onClick={onClose} 
          color="inherit"
          variant="outlined"
          disabled={loading}
        >
          Annuler
        </Button>
        <Button 
          onClick={handleSave} 
          color="primary" 
          variant="contained"
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} color="inherit" />}
        >
          Enregistrer
        </Button>
      </DialogActions>
      
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
    </Dialog>
  );
};

export default ServiceTaskConfig;
