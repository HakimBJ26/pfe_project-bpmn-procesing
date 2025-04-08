import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Typography,
  Grid,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Alert,
  IconButton
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Code as CodeIcon,
  Add as AddIcon,
  AddCircleOutline as AddCircleOutlineIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import bpmnService from '../../../services/bpmnService';
import { CodeEditor } from './CodeEditor';
import authService from '../../../services/authService';

const implementationTypeOptions = [
  { value: 'class', label: 'Classe Java' },
  { value: 'delegateExpression', label: 'Expression' },
  { value: 'expression', label: 'Expression ValueMap' }
];

const ServiceTaskConfig = ({ open, onClose, onSave, task, processId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [implementationType, setImplementationType] = useState('class');
  const [implementation, setImplementation] = useState('');
  const [name, setName] = useState('');
  const [async, setAsync] = useState(false);
  const [configMode, setConfigMode] = useState('select'); // 'select' ou 'create'
  const [availableJavaDelegates, setAvailableJavaDelegates] = useState([]);
  const [javaTemplates, setJavaTemplates] = useState({});
  const [selectedTemplate, setSelectedTemplate] = useState('basic');
  const [newDelegateData, setNewDelegateData] = useState({
    name: '',
    sourceCode: '',
    description: ''
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [inputParams, setInputParams] = useState([]);
  const [outputParams, setOutputParams] = useState([]);
  const [newInput, setNewInput] = useState({ name: '', value: '' });
  const [newOutput, setNewOutput] = useState({ name: '', value: '' });
  const [accordionExpanded, setAccordionExpanded] = useState({
    delegate: true,
    params: false,
    properties: false
  });

  // Vérification de l'authentification
  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await authService.isAuthenticated();
      setIsAuthenticated(isAuth);
    };
    checkAuth();
  }, []);

  // Chargement des JavaDelegates disponibles
  useEffect(() => {
    if (open && isAuthenticated) {
      loadJavaDelegates();
      loadJavaTemplates();
    }
  }, [open, isAuthenticated]);

  // Initialisation de la configuration à partir de la tâche
  useEffect(() => {
    if (task) {
      // Initialiser les valeurs à partir de la tâche sélectionnée
      setName(task.name || '');
      
      // Déterminer le type d'implémentation et la valeur
      if (task.implementation) {
        if (task.implementationType) {
          setImplementationType(task.implementationType);
        } else {
          // Déterminer le type d'implémentation automatiquement
          if (task.implementation.startsWith('${')) {
            setImplementationType('delegateExpression');
          } else if (task.implementation.includes('.')) {
            setImplementationType('class');
          } else {
            setImplementationType('expression');
          }
        }
        setImplementation(task.implementation);
      }
      
      // Initialiser les paramètres d'entrée et de sortie s'ils existent
      if (task.inputParameters) {
        setInputParams(task.inputParameters.map(param => ({
          name: param.name || '',
          value: param.value || ''
        })));
      }
      
      if (task.outputParameters) {
        setOutputParams(task.outputParameters.map(param => ({
          name: param.name || '',
          value: param.value || ''
        })));
      }
      
      // Initialiser async
      setAsync(task.async || false);
    }
  }, [task]);

  // Fonctions pour charger les JavaDelegates et les modèles
  const loadJavaDelegates = async () => {
    try {
      setLoading(true);
      const response = await bpmnService.getAvailableJavaDelegates();
      if (response && response.data && response.data.data) {
        setAvailableJavaDelegates(response.data.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des JavaDelegates:', error);
      setError('Impossible de charger les JavaDelegates. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const loadJavaTemplates = async () => {
    try {
      setLoading(true);
      const response = await bpmnService.getJavaDelegateTemplates();
      if (response && response.data && response.data.data) {
        setJavaTemplates(response.data.data);
        
        // Initialiser le champ de source code avec le modèle basic par défaut
        if (response.data.data.basic) {
          setNewDelegateData(prev => ({
            ...prev,
            sourceCode: response.data.data.basic
          }));
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des templates:', error);
    } finally {
      setLoading(false);
    }
  };

  // Changement de modèle
  const handleTemplateChange = (template) => {
    setSelectedTemplate(template);
    if (javaTemplates[template]) {
      setNewDelegateData(prev => ({
        ...prev,
        sourceCode: javaTemplates[template]
      }));
    }
  };

  // Sélection d'un JavaDelegate existant
  const handleSelectJavaDelegate = (className) => {
    setImplementation(className);
    setImplementationType('class');
  };

  // Création d'un nouveau JavaDelegate
  const handleCreateJavaDelegate = async () => {
    try {
      if (!newDelegateData.name || !newDelegateData.sourceCode) {
        setError('Le nom et le code source sont requis');
        return;
      }
      
      setLoading(true);
      const response = await bpmnService.createJavaDelegate(newDelegateData);
      
      if (response && response.data && response.data.success) {
        // Ajouter le nouveau delegate à la liste
        if (response.data.data) {
          setAvailableJavaDelegates(prev => [...prev, response.data.data]);
          
          // Sélectionner automatiquement le nouveau delegate
          setImplementation(response.data.data.className);
          setImplementationType('class');
          setConfigMode('select');
          
          // Réinitialiser le formulaire
          setNewDelegateData({
            name: '',
            sourceCode: '',
            description: ''
          });
          
          setError(null);
        }
      } else {
        setError(response?.data?.message || 'Erreur lors de la création du JavaDelegate');
      }
    } catch (error) {
      console.error('Erreur lors de la création du JavaDelegate', error);
      setError('Erreur lors de la création du JavaDelegate: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Gestion des paramètres d'entrée et de sortie
  const handleAddInputParam = () => {
    if (newInput.name.trim() !== '') {
      setInputParams([...inputParams, { ...newInput }]);
      setNewInput({ name: '', value: '' });
    }
  };

  const handleAddOutputParam = () => {
    if (newOutput.name.trim() !== '') {
      setOutputParams([...outputParams, { ...newOutput }]);
      setNewOutput({ name: '', value: '' });
    }
  };

  const handleRemoveInputParam = (index) => {
    const updatedParams = [...inputParams];
    updatedParams.splice(index, 1);
    setInputParams(updatedParams);
  };

  const handleRemoveOutputParam = (index) => {
    const updatedParams = [...outputParams];
    updatedParams.splice(index, 1);
    setOutputParams(updatedParams);
  };

  // Soumission du formulaire
  const handleSubmit = () => {
    // Validation des champs requis
    if (!implementation && implementationType !== 'expression') {
      setError('L\'implémentation est requise');
      return;
    }

    // Création de l'objet de configuration
    const config = {
      implementationType,
      implementation,
      name,
      async,
      inputParameters: inputParams,
      outputParameters: outputParams
    };

    // Appel de la fonction onSave
    onSave(config);
    onClose();
  };

  // Gestion de l'ouverture/fermeture des accordéons
  const handleAccordionChange = (section) => (event, isExpanded) => {
    setAccordionExpanded({
      ...accordionExpanded,
      [section]: isExpanded
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Configuration de la tâche de service</DialogTitle>
      
      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        {loading && (
          <Box display="flex" justifyContent="center" my={2}>
            <CircularProgress />
          </Box>
        )}
        
        <Box mb={3}>
          <TextField
            label="Nom de la tâche"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            margin="normal"
            helperText="Nom affiché dans le diagramme"
          />
        </Box>
        
        {/* Accordéon pour la configuration du JavaDelegate */}
        <Accordion 
          expanded={accordionExpanded.delegate} 
          onChange={handleAccordionChange('delegate')}
          sx={{ mb: 2 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">Configuration du JavaDelegate</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormControl fullWidth margin="normal">
              <InputLabel>Type d'implémentation</InputLabel>
              <Select
                value={implementationType}
                onChange={(e) => setImplementationType(e.target.value)}
                label="Type d'implémentation"
              >
                {implementationTypeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                Comment la tâche de service doit être exécutée
              </FormHelperText>
            </FormControl>
            
            {implementationType === 'class' && (
              <Box mt={2}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                  <Typography variant="subtitle2">
                    Mode de configuration
                  </Typography>
                  <Box>
                    <Button
                      variant={configMode === 'select' ? "contained" : "outlined"}
                      onClick={() => setConfigMode('select')}
                      size="small"
                      sx={{ mr: 1 }}
                    >
                      Sélectionner
                    </Button>
                    <Button
                      variant={configMode === 'create' ? "contained" : "outlined"}
                      onClick={() => setConfigMode('create')}
                      size="small"
                    >
                      Créer
                    </Button>
                  </Box>
                </Box>
                
                <Divider sx={{ mb: 2 }} />
                
                {configMode === 'select' ? (
                  <Box>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                      <Typography variant="subtitle2">
                        JavaDelegates disponibles
                      </Typography>
                      <IconButton 
                        size="small" 
                        onClick={loadJavaDelegates}
                        title="Rafraîchir la liste"
                      >
                        <RefreshIcon />
                      </IconButton>
                    </Box>
                    
                    {availableJavaDelegates.length > 0 ? (
                      <List sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid #e0e0e0', borderRadius: 1 }}>
                        {availableJavaDelegates.map((delegate, index) => (
                          <ListItem 
                            key={index} 
                            button 
                            selected={implementation === delegate.className}
                            onClick={() => handleSelectJavaDelegate(delegate.className)}
                          >
                            <ListItemIcon>
                              <CodeIcon />
                            </ListItemIcon>
                            <ListItemText 
                              primary={delegate.className} 
                              secondary={delegate.description || 'Aucune description disponible'}
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" color="textSecondary" sx={{ py: 2, textAlign: 'center' }}>
                        Aucun JavaDelegate disponible
                      </Typography>
                    )}
                    
                    <TextField
                      label="Classe sélectionnée"
                      value={implementation}
                      onChange={(e) => setImplementation(e.target.value)}
                      fullWidth
                      margin="normal"
                      helperText="Nom complet de la classe (incluant le package)"
                    />
                  </Box>
                ) : (
                  <Box>
                    <Box mb={2}>
                      <Typography variant="subtitle2" gutterBottom>
                        Créer un nouveau JavaDelegate
                      </Typography>
                      
                      <TextField
                        label="Nom complet de la classe"
                        value={newDelegateData.name}
                        onChange={(e) => setNewDelegateData({...newDelegateData, name: e.target.value})}
                        fullWidth
                        margin="normal"
                        helperText="ex: com.example.MyCustomDelegate"
                      />
                      
                      <TextField
                        label="Description"
                        value={newDelegateData.description}
                        onChange={(e) => setNewDelegateData({...newDelegateData, description: e.target.value})}
                        fullWidth
                        margin="normal"
                        helperText="Description optionnelle de la fonctionnalité"
                      />
                      
                      <Box mt={2} mb={1}>
                        <Typography variant="body2" gutterBottom>
                          Modèle de code:
                        </Typography>
                        
                        <Box display="flex" gap={1} mb={2}>
                          <Button
                            variant={selectedTemplate === 'basic' ? "contained" : "outlined"}
                            onClick={() => handleTemplateChange('basic')}
                            size="small"
                          >
                            Basique
                          </Button>
                          <Button
                            variant={selectedTemplate === 'logger' ? "contained" : "outlined"}
                            onClick={() => handleTemplateChange('logger')}
                            size="small"
                          >
                            Logger
                          </Button>
                          <Button
                            variant={selectedTemplate === 'emailSender' ? "contained" : "outlined"}
                            onClick={() => handleTemplateChange('emailSender')}
                            size="small"
                          >
                            Email
                          </Button>
                        </Box>
                      </Box>
                      
                      <Typography variant="body2" gutterBottom>
                        Code source:
                      </Typography>
                      
                      <CodeEditor
                        value={newDelegateData.sourceCode}
                        onChange={(value) => setNewDelegateData({...newDelegateData, sourceCode: value})}
                        mode="java"
                        height="300px"
                      />
                      
                      <Box mt={2} display="flex" justifyContent="flex-end">
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleCreateJavaDelegate}
                          startIcon={<AddIcon />}
                          disabled={loading}
                        >
                          Créer JavaDelegate
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                )}
              </Box>
            )}
            
            {implementationType !== 'class' && (
              <TextField
                label={implementationType === 'delegateExpression' ? 'Expression de délégation' : 'Expression'}
                value={implementation}
                onChange={(e) => setImplementation(e.target.value)}
                fullWidth
                margin="normal"
                helperText={implementationType === 'delegateExpression' ? 
                  'Expression qui évalue vers un bean JavaDelegate (ex: ${myDelegate})' : 
                  'Expression à évaluer (ex: ${customer.getName()})'}
              />
            )}
          </AccordionDetails>
        </Accordion>
        
        {/* Accordéon pour les paramètres d'entrée et de sortie */}
        <Accordion 
          expanded={accordionExpanded.params} 
          onChange={handleAccordionChange('params')}
          sx={{ mb: 2 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">Paramètres d'entrée et de sortie</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box mb={3}>
              <Typography variant="subtitle2" gutterBottom>
                Paramètres d'entrée
              </Typography>
              
              <Box>
                {inputParams.map((param, index) => (
                  <Box 
                    key={index} 
                    display="flex" 
                    alignItems="center" 
                    mb={1}
                    p={1}
                    border="1px solid #e0e0e0"
                    borderRadius={1}
                  >
                    <Box flex={1}>
                      <Typography variant="body2" fontWeight="bold">{param.name}</Typography>
                      <Typography variant="body2" color="textSecondary">{param.value}</Typography>
                    </Box>
                    <IconButton 
                      size="small" 
                      color="error" 
                      onClick={() => handleRemoveInputParam(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
              </Box>
              
              <Grid container spacing={2} alignItems="flex-end">
                <Grid item xs={5}>
                  <TextField
                    label="Nom"
                    value={newInput.name}
                    onChange={(e) => setNewInput({...newInput, name: e.target.value})}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={5}>
                  <TextField
                    label="Valeur"
                    value={newInput.value}
                    onChange={(e) => setNewInput({...newInput, value: e.target.value})}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={2}>
                  <Button
                    fullWidth
                    color="primary"
                    onClick={handleAddInputParam}
                    startIcon={<AddCircleOutlineIcon />}
                    disabled={!newInput.name.trim()}
                  >
                    Ajouter
                  </Button>
                </Grid>
              </Grid>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Paramètres de sortie
              </Typography>
              
              <Box>
                {outputParams.map((param, index) => (
                  <Box 
                    key={index} 
                    display="flex" 
                    alignItems="center" 
                    mb={1}
                    p={1}
                    border="1px solid #e0e0e0"
                    borderRadius={1}
                  >
                    <Box flex={1}>
                      <Typography variant="body2" fontWeight="bold">{param.name}</Typography>
                      <Typography variant="body2" color="textSecondary">{param.value}</Typography>
                    </Box>
                    <IconButton 
                      size="small" 
                      color="error" 
                      onClick={() => handleRemoveOutputParam(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
              </Box>
              
              <Grid container spacing={2} alignItems="flex-end">
                <Grid item xs={5}>
                  <TextField
                    label="Nom"
                    value={newOutput.name}
                    onChange={(e) => setNewOutput({...newOutput, name: e.target.value})}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={5}>
                  <TextField
                    label="Valeur"
                    value={newOutput.value}
                    onChange={(e) => setNewOutput({...newOutput, value: e.target.value})}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={2}>
                  <Button
                    fullWidth
                    color="primary"
                    onClick={handleAddOutputParam}
                    startIcon={<AddCircleOutlineIcon />}
                    disabled={!newOutput.name.trim()}
                  >
                    Ajouter
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </AccordionDetails>
        </Accordion>
        
        {/* Accordéon pour les propriétés avancées */}
        <Accordion 
          expanded={accordionExpanded.properties} 
          onChange={handleAccordionChange('properties')}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">Propriétés avancées</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormControl component="fieldset" fullWidth margin="normal">
              <Grid container alignItems="center" spacing={2}>
                <Grid item>
                  <Typography variant="body2">Exécution asynchrone:</Typography>
                </Grid>
                <Grid item>
                  <Button
                    variant={async ? "contained" : "outlined"}
                    color={async ? "primary" : "inherit"}
                    onClick={() => setAsync(!async)}
                    size="small"
                  >
                    {async ? "Activé" : "Désactivé"}
                  </Button>
                </Grid>
              </Grid>
              <FormHelperText>
                Si activé, cette tâche sera exécutée de manière asynchrone
              </FormHelperText>
            </FormControl>
          </AccordionDetails>
        </Accordion>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Annuler
        </Button>
        <Button onClick={handleSubmit} color="primary" variant="contained">
          Enregistrer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ServiceTaskConfig;
