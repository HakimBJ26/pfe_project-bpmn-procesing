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
  Box,
  CircularProgress,
  Divider,
  Chip,
  Alert,
  Snackbar
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import bpmnService from '../../../services/bpmnService';
import DynamicFormBuilder from './DynamicFormBuilder';
import fr from 'date-fns/locale/fr';

const UserTaskConfig = ({ open, onClose, task, processId, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    assignee: '',
    candidateGroups: '',
    candidateUsers: '',
    formKey: '',
    dueDate: null,
    followUpDate: null,
    priority: 50,
    formDefinition: '[]'
  });
  
  // Options pour les utilisateurs et groupes (à remplacer par des données réelles)
  const userOptions = ['user1', 'user2', 'user3', 'user4'];
  const groupOptions = ['admin', 'managers', 'users', 'finance', 'hr'];
  
  useEffect(() => {
    if (task) {
      // Charger les configurations existantes si disponibles
      const loadTaskConfig = async () => {
        try {
          setLoading(true);
          const response = await bpmnService.getUserTasks(processId);
          const taskConfig = response.data.find(t => t.taskId === task.id);
          
          if (taskConfig) {
            setFormData({
              assignee: taskConfig.assignee || '',
              candidateGroups: taskConfig.candidateGroups || '',
              candidateUsers: taskConfig.candidateUsers || '',
              formKey: taskConfig.formKey || '',
              dueDate: taskConfig.dueDate ? new Date(Date.now() + taskConfig.dueDate * 3600000) : null,
              followUpDate: taskConfig.followUpDate ? new Date(Date.now() + taskConfig.followUpDate * 3600000) : null,
              priority: taskConfig.priority || 50,
              formDefinition: taskConfig.formDefinition || '[]'
            });
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
  
  const handleDateChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleFormDefinitionChange = (formDefinition) => {
    setFormData({
      ...formData,
      formDefinition: JSON.stringify(formDefinition)
    });
  };
  
  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Convertir les dates en heures à partir de maintenant
      const dueDateHours = formData.dueDate 
        ? Math.round((formData.dueDate.getTime() - Date.now()) / 3600000)
        : null;
      
      const followUpDateHours = formData.followUpDate
        ? Math.round((formData.followUpDate.getTime() - Date.now()) / 3600000)
        : null;
      
      const configData = {
        ...formData,
        dueDate: dueDateHours,
        followUpDate: followUpDateHours
      };
      
      const response = await bpmnService.configureUserTask(processId, task.id, configData);
      
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
        borderColor: 'divider'
      }}>
        Configuration de la tâche utilisateur: {task.name || task.id}
      </DialogTitle>
      
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Assignation
          </Typography>
          
          <FormControl fullWidth>
            <InputLabel id="assignee-label">Assigné à</InputLabel>
            <Select
              labelId="assignee-label"
              name="assignee"
              value={formData.assignee}
              onChange={handleInputChange}
              label="Assigné à"
            >
              <MenuItem value="">
                <em>Non assigné</em>
              </MenuItem>
              {userOptions.map(user => (
                <MenuItem key={user} value={user}>{user}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Stack direction="row" spacing={2}>
            <TextField
              label="Groupes candidats"
              name="candidateGroups"
              value={formData.candidateGroups}
              onChange={handleInputChange}
              fullWidth
              helperText="Séparez les groupes par des virgules"
            />
            
            <TextField
              label="Utilisateurs candidats"
              name="candidateUsers"
              value={formData.candidateUsers}
              onChange={handleInputChange}
              fullWidth
              helperText="Séparez les utilisateurs par des virgules"
            />
          </Stack>
          
          {formData.candidateGroups && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {formData.candidateGroups.split(',').map((group, index) => (
                group.trim() && (
                  <Chip 
                    key={index} 
                    label={group.trim()} 
                    color="primary" 
                    variant="outlined" 
                    size="small"
                  />
                )
              ))}
            </Box>
          )}
          
          <Divider />
          
          <Typography variant="h6" gutterBottom>
            Échéances
          </Typography>
          
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
            <Stack direction="row" spacing={2}>
              <DatePicker
                label="Date d'échéance"
                value={formData.dueDate}
                onChange={(value) => handleDateChange('dueDate', value)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
              
              <DatePicker
                label="Date de suivi"
                value={formData.followUpDate}
                onChange={(value) => handleDateChange('followUpDate', value)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Stack>
          </LocalizationProvider>
          
          <TextField
            label="Priorité"
            name="priority"
            type="number"
            value={formData.priority}
            onChange={handleInputChange}
            inputProps={{ min: 0, max: 100 }}
            helperText="Priorité entre 0 (faible) et 100 (élevée)"
          />
          
          <Divider />
          
          <Typography variant="h6" gutterBottom>
            Formulaire
          </Typography>
          
          <TextField
            label="Clé du formulaire"
            name="formKey"
            value={formData.formKey}
            onChange={handleInputChange}
            fullWidth
            helperText="Clé unique pour identifier ce formulaire"
          />
          
          <Typography variant="subtitle1" gutterBottom>
            Constructeur de formulaire
          </Typography>
          
          <DynamicFormBuilder
            value={JSON.parse(formData.formDefinition || '[]')}
            onChange={handleFormDefinitionChange}
          />
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

export default UserTaskConfig;
