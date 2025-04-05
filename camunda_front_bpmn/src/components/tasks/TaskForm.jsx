import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { taskService } from '../../services/taskService';
import {
  Container, Paper, Typography, Box, Button, TextField, FormControl,
  InputLabel, Select, MenuItem, FormHelperText, Grid, CircularProgress,
  Alert, Divider, Chip, Breadcrumbs, Link, Checkbox, FormControlLabel,
  Radio, RadioGroup, Switch
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Send as SendIcon,
  Save as SaveIcon,
  Check as CheckIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';

const TaskForm = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [task, setTask] = useState(null);
  const [formData, setFormData] = useState(null);
  const [formValues, setFormValues] = useState({});
  
  // Chargement initial des données
  useEffect(() => {
    if (!taskId) return;
    
    const fetchTaskData = async () => {
      try {
        setLoading(true);
        
        // Récupérer les détails de la tâche
        const taskResponse = await taskService.getTaskById(taskId);
        setTask(taskResponse.data);
        
        // Récupérer le formulaire de la tâche
        const formResponse = await taskService.getTaskForm(taskId);
        setFormData(formResponse.data);
        
        // Initialiser les valeurs du formulaire
        if (formResponse.data && formResponse.data.fields) {
          const initialValues = {};
          formResponse.data.fields.forEach(field => {
            initialValues[field.id] = field.value !== undefined ? field.value : '';
          });
          setFormValues(initialValues);
        }
        
        setError('');
      } catch (err) {
        console.error('Erreur lors du chargement des données de la tâche:', err);
        setError('Impossible de charger les données de la tâche. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTaskData();
  }, [taskId]);
  
  // Gestion des changements dans les champs du formulaire
  const handleFieldChange = (fieldId, value) => {
    setFormValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };
  
  // Soumission du formulaire pour compléter la tâche
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!task || !formValues) return;
    
    try {
      setSubmitting(true);
      setError('');
      
      await taskService.completeTask(taskId, formValues);
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/tasks');
      }, 2000);
    } catch (err) {
      console.error('Erreur lors de la complétion de la tâche:', err);
      setError(err.response?.data?.error || 'Erreur lors de la complétion de la tâche. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Revenir à la liste des tâches
  const handleBack = () => {
    navigate('/tasks');
  };
  
  // Rendu des champs du formulaire en fonction de leur type
  const renderFormField = (field) => {
    const { id, label, type, required, value, properties } = field;
    const currentValue = formValues[id] !== undefined ? formValues[id] : value || '';
    
    switch (type.toLowerCase()) {
      case 'string':
      case 'text':
        return (
          <TextField
            fullWidth
            id={id}
            name={id}
            label={label}
            value={currentValue}
            onChange={(e) => handleFieldChange(id, e.target.value)}
            required={required}
            margin="normal"
            variant="outlined"
            helperText={properties?.description}
          />
        );
        
      case 'textarea':
      case 'multiline':
        return (
          <TextField
            fullWidth
            id={id}
            name={id}
            label={label}
            value={currentValue}
            onChange={(e) => handleFieldChange(id, e.target.value)}
            required={required}
            margin="normal"
            variant="outlined"
            multiline
            rows={4}
            helperText={properties?.description}
          />
        );
        
      case 'number':
      case 'integer':
      case 'long':
      case 'double':
        return (
          <TextField
            fullWidth
            id={id}
            name={id}
            label={label}
            type="number"
            value={currentValue}
            onChange={(e) => handleFieldChange(id, e.target.value)}
            required={required}
            margin="normal"
            variant="outlined"
            helperText={properties?.description}
          />
        );
        
      case 'boolean':
        return (
          <FormControlLabel
            control={
              <Checkbox
                checked={!!currentValue}
                onChange={(e) => handleFieldChange(id, e.target.checked)}
                name={id}
              />
            }
            label={label}
            sx={{ my: 1 }}
          />
        );
        
      case 'date':
        return (
          <DatePicker
            label={label}
            value={currentValue ? new Date(currentValue) : null}
            onChange={(date) => handleFieldChange(id, date?.toISOString() || null)}
            renderInput={(params) => (
              <TextField 
                {...params} 
                fullWidth 
                required={required} 
                margin="normal"
                helperText={properties?.description}
              />
            )}
          />
        );
        
      case 'time':
        return (
          <TimePicker
            label={label}
            value={currentValue ? new Date(currentValue) : null}
            onChange={(time) => handleFieldChange(id, time?.toISOString() || null)}
            renderInput={(params) => (
              <TextField 
                {...params} 
                fullWidth 
                required={required} 
                margin="normal"
                helperText={properties?.description}
              />
            )}
          />
        );
        
      case 'select':
      case 'enum':
        const options = properties?.options ? JSON.parse(properties.options) : [];
        return (
          <FormControl fullWidth margin="normal" required={required}>
            <InputLabel id={`${id}-label`}>{label}</InputLabel>
            <Select
              labelId={`${id}-label`}
              id={id}
              name={id}
              value={currentValue}
              onChange={(e) => handleFieldChange(id, e.target.value)}
              label={label}
            >
              {options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label || option.value}
                </MenuItem>
              ))}
            </Select>
            {properties?.description && (
              <FormHelperText>{properties.description}</FormHelperText>
            )}
          </FormControl>
        );
        
      case 'radio':
        const radioOptions = properties?.options ? JSON.parse(properties.options) : [];
        return (
          <FormControl component="fieldset" margin="normal" required={required}>
            <Typography variant="body1" gutterBottom>{label}</Typography>
            <RadioGroup
              name={id}
              value={currentValue}
              onChange={(e) => handleFieldChange(id, e.target.value)}
            >
              {radioOptions.map((option) => (
                <FormControlLabel 
                  key={option.value} 
                  value={option.value} 
                  control={<Radio />} 
                  label={option.label || option.value} 
                />
              ))}
            </RadioGroup>
            {properties?.description && (
              <FormHelperText>{properties.description}</FormHelperText>
            )}
          </FormControl>
        );
        
      default:
        return (
          <TextField
            fullWidth
            id={id}
            name={id}
            label={label}
            value={currentValue}
            onChange={(e) => handleFieldChange(id, e.target.value)}
            required={required}
            margin="normal"
            variant="outlined"
            helperText={properties?.description || `Type non géré: ${type}`}
          />
        );
    }
  };
  
  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  if (!task || !formData) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          Impossible de charger les informations de la tâche ou le formulaire n'est pas disponible.
        </Alert>
        <Box sx={{ mt: 2 }}>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={handleBack}>
            Retour à la liste des tâches
          </Button>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link 
          color="inherit" 
          href="#" 
          onClick={(e) => { e.preventDefault(); navigate('/tasks'); }}
        >
          Tâches
        </Link>
        <Typography color="text.primary">Compléter la tâche</Typography>
      </Breadcrumbs>
      
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" component="h1" gutterBottom>
            {task.name}
          </Typography>
          
          {task.description && (
            <Typography variant="body1" color="text.secondary" paragraph>
              {task.description}
            </Typography>
          )}
          
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Chip 
              size="small" 
              color="primary" 
              label={`Instance: ${task.processInstanceId?.substring(0, 8)}...`} 
              variant="outlined"
            />
            <Chip 
              size="small" 
              color="secondary" 
              label={`Tâche: ${task.id}`} 
              variant="outlined"
            />
            {task.assignee && (
              <Chip 
                size="small" 
                color="success" 
                label={`Assigné à: ${task.assignee}`}
                icon={<CheckIcon />}
              />
            )}
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Tâche complétée avec succès! Redirection vers la liste des tâches...
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <Typography variant="h6" gutterBottom>
            Formulaire de la tâche
          </Typography>
          
          {formData.fields && formData.fields.length > 0 ? (
            <Grid container spacing={2}>
              {formData.fields.map((field) => (
                <Grid item xs={12} key={field.id}>
                  {renderFormField(field)}
                </Grid>
              ))}
            </Grid>
          ) : (
            <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 3 }}>
              Ce formulaire ne contient pas de champs définis. Vous pouvez tout de même compléter la tâche.
            </Alert>
          )}
          
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
            <Button 
              variant="outlined" 
              onClick={handleBack}
              startIcon={<ArrowBackIcon />}
            >
              Annuler
            </Button>
            
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={submitting || success}
              startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
            >
              {submitting ? 'Traitement en cours...' : 'Compléter la tâche'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default TaskForm;
