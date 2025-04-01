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
  Divider,
  CircularProgress,
  Paper,
  IconButton,
  Snackbar,
  Alert,
  Tooltip,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  CallSplit as CallSplitIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { CodeEditor } from './CodeEditor';
import bpmnService from '../../../services/bpmnService';

const GatewayConfig = ({ open, onClose, gateway, processId, onSave, outgoingFlows = [] }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    gatewayType: 'exclusive',
    defaultFlow: '',
    conditions: '[]'
  });

  const [flowConditions, setFlowConditions] = useState([]);
  
  // Options pour les types de gateway
  const gatewayTypes = [
    { value: 'exclusive', label: 'Exclusive (XOR)' },
    { value: 'inclusive', label: 'Inclusive (OR)' },
    { value: 'parallel', label: 'Parallel (AND)' },
    { value: 'event', label: 'Event-based' },
    { value: 'complex', label: 'Complex' }
  ];
  
  useEffect(() => {
    if (gateway) {
      // Charger les configurations existantes si disponibles
      const loadGatewayConfig = async () => {
        try {
          setLoading(true);
          const response = await bpmnService.getGateways(processId);
          const gatewayConfig = response.data.find(g => g.gatewayId === gateway.id);
          
          if (gatewayConfig) {
            setFormData({
              gatewayType: gatewayConfig.gatewayType || 'exclusive',
              defaultFlow: gatewayConfig.defaultFlow || '',
              conditions: gatewayConfig.conditions || '[]'
            });
            
            try {
              const parsedConditions = JSON.parse(gatewayConfig.conditions || '[]');
              setFlowConditions(parsedConditions);
            } catch (e) {
              console.error("Erreur lors de l'analyse des conditions", e);
              setFlowConditions([]);
            }
          } else {
            // Initialiser avec les flux sortants disponibles
            initializeFlowConditions();
          }
        } catch (err) {
          console.error("Erreur lors du chargement de la configuration", err);
          setError("Erreur lors du chargement de la configuration");
          // Initialiser avec les flux sortants disponibles en cas d'erreur
          initializeFlowConditions();
        } finally {
          setLoading(false);
        }
      };
      
      loadGatewayConfig();
    }
  }, [gateway, processId, outgoingFlows]);
  
  // Initialiser les conditions avec les flux sortants disponibles
  const initializeFlowConditions = () => {
    if (outgoingFlows && outgoingFlows.length > 0) {
      const initialConditions = outgoingFlows.map(flow => ({
        flowId: flow.id,
        targetId: flow.targetId,
        targetName: flow.targetName || flow.targetId,
        condition: '',
        description: ''
      }));
      setFlowConditions(initialConditions);
      setFormData(prev => ({
        ...prev,
        conditions: JSON.stringify(initialConditions)
      }));
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleConditionChange = (index, field, value) => {
    const updated = [...flowConditions];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setFlowConditions(updated);
    setFormData({
      ...formData,
      conditions: JSON.stringify(updated)
    });
  };
  
  const handleDefaultFlowChange = (flowId) => {
    setFormData({
      ...formData,
      defaultFlow: flowId
    });
  };
  
  const getConditionExamples = (gatewayType) => {
    switch (gatewayType) {
      case 'exclusive':
        return [
          { label: 'Montant > 1000', value: '${amount > 1000}' },
          { label: 'Client approuvé', value: '${approved == true}' },
          { label: 'Statut = "rejeté"', value: '${status == "rejected"}' }
        ];
      case 'inclusive':
        return [
          { label: 'Commande urgente', value: '${urgent == true}' },
          { label: 'Montant élevé', value: '${amount > 5000}' },
          { label: 'Client prioritaire', value: '${customer.type == "premium"}' }
        ];
      default:
        return [];
    }
  };
  
  const handleApplyExample = (index, exampleValue) => {
    handleConditionChange(index, 'condition', exampleValue);
  };
  
  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Valider les conditions selon le type de gateway
      if (formData.gatewayType === 'exclusive' || formData.gatewayType === 'inclusive') {
        // Vérifier que les conditions sont définies pour les passerelles qui en ont besoin
        const hasEmptyConditions = flowConditions.some(flow => 
          !flow.condition && flow.flowId !== formData.defaultFlow
        );
        
        if (hasEmptyConditions && formData.gatewayType === 'exclusive' && !formData.defaultFlow) {
          setError("Une passerelle exclusive doit avoir soit toutes les conditions définies, soit un flux par défaut");
          setLoading(false);
          return;
        }
      }
      
      const configData = {
        ...formData,
        gatewayId: gateway.id,
        gatewayName: gateway.name || gateway.id,
        processId: processId
      };
      
      const response = await bpmnService.configureGateway(processId, gateway.id, configData);
      
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
  
  if (!gateway) return null;
  
  // Déterminer si des conditions sont nécessaires en fonction du type de gateway
  const needsConditions = formData.gatewayType === 'exclusive' || formData.gatewayType === 'inclusive';
  
  // Obtenir des exemples de conditions pour le type de gateway actuel
  const conditionExamples = getConditionExamples(formData.gatewayType);
  
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
        <CallSplitIcon />
        Configuration de la passerelle: {gateway.name || gateway.id}
      </DialogTitle>
      
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <FormControl fullWidth>
            <InputLabel id="gatewayType-label">Type de passerelle</InputLabel>
            <Select
              labelId="gatewayType-label"
              name="gatewayType"
              value={formData.gatewayType}
              onChange={handleInputChange}
              label="Type de passerelle"
            >
              {gatewayTypes.map(type => (
                <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Box sx={{ 
            p: 2, 
            bgcolor: 'info.light', 
            color: 'info.contrastText', 
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <InfoIcon color="inherit" />
            <Typography variant="body2">
              {formData.gatewayType === 'exclusive' && "Une passerelle exclusive (XOR) active exactement un chemin sortant en fonction des conditions."}
              {formData.gatewayType === 'inclusive' && "Une passerelle inclusive (OR) active un ou plusieurs chemins sortants en fonction des conditions."}
              {formData.gatewayType === 'parallel' && "Une passerelle parallèle (AND) active tous les chemins sortants simultanément."}
              {formData.gatewayType === 'event' && "Une passerelle basée sur les événements attend qu'un événement spécifique se produise."}
              {formData.gatewayType === 'complex' && "Une passerelle complexe permet des comportements de branchement avancés."}
            </Typography>
          </Box>
          
          {needsConditions && (
            <>
              <Divider />
              
              <Typography variant="h6" gutterBottom>
                Flux sortants et conditions
              </Typography>
              
              {flowConditions.length === 0 ? (
                <Paper sx={{ p: 3, bgcolor: 'grey.100', textAlign: 'center' }}>
                  <Typography color="textSecondary">
                    Aucun flux sortant détecté pour cette passerelle. Ajoutez des flux sortants dans le modèle BPMN.
                  </Typography>
                </Paper>
              ) : (
                <Stack spacing={2}>
                  {flowConditions.map((flow, index) => (
                    <Paper
                      key={flow.flowId}
                      variant="outlined"
                      sx={{
                        p: 2,
                        borderWidth: formData.defaultFlow === flow.flowId ? 2 : 1,
                        borderColor: formData.defaultFlow === flow.flowId ? 'secondary.main' : 'divider',
                        position: 'relative',
                        '&:hover': {
                          borderColor: formData.defaultFlow === flow.flowId ? 'secondary.dark' : 'primary.light',
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle1">
                          Flux vers: {flow.targetName}
                          {formData.defaultFlow === flow.flowId && (
                            <Chip 
                              label="Flux par défaut" 
                              color="secondary" 
                              size="small" 
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Typography>
                        
                        <Button
                          size="small"
                          variant={formData.defaultFlow === flow.flowId ? "contained" : "outlined"}
                          color="secondary"
                          onClick={() => handleDefaultFlowChange(flow.flowId)}
                        >
                          {formData.defaultFlow === flow.flowId ? "Flux par défaut" : "Définir comme défaut"}
                        </Button>
                      </Box>
                      
                      <TextField
                        label="Description de la condition"
                        value={flow.description || ''}
                        onChange={(e) => handleConditionChange(index, 'description', e.target.value)}
                        fullWidth
                        margin="normal"
                        helperText="Description en langage naturel de cette condition (pour la documentation)"
                      />
                      
                      <TextField
                        label="Expression de la condition"
                        value={flow.condition || ''}
                        onChange={(e) => handleConditionChange(index, 'condition', e.target.value)}
                        fullWidth
                        margin="normal"
                        helperText="Expression JUEL (ex: ${amount > 1000})"
                        disabled={formData.defaultFlow === flow.flowId}
                      />
                      
                      {conditionExamples.length > 0 && !formData.defaultFlow === flow.flowId && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                            Exemples de conditions:
                          </Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {conditionExamples.map((example, idx) => (
                              <Chip
                                key={idx}
                                label={example.label}
                                size="small"
                                variant="outlined"
                                onClick={() => handleApplyExample(index, example.value)}
                                sx={{ marginBottom: 1 }}
                              />
                            ))}
                          </Stack>
                        </Box>
                      )}
                    </Paper>
                  ))}
                </Stack>
              )}
            </>
          )}
          
          {formData.gatewayType === 'parallel' && (
            <Paper sx={{ p: 3, bgcolor: 'info.light', color: 'info.contrastText', borderRadius: 1 }}>
              <Typography>
                Les passerelles parallèles n'ont pas besoin de conditions car tous les chemins sortants sont activés simultanément.
              </Typography>
            </Paper>
          )}
          
          {formData.gatewayType === 'event' && (
            <Paper sx={{ p: 3, bgcolor: 'info.light', color: 'info.contrastText', borderRadius: 1 }}>
              <Typography>
                Les passerelles basées sur les événements n'ont pas besoin de conditions. Configurez les événements sur les flux sortants dans le modèle BPMN.
              </Typography>
            </Paper>
          )}
          
          {formData.gatewayType === 'complex' && (
            <Paper sx={{ p: 3, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Expression de condition complexe
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Définissez une expression JUEL qui déterminera quels chemins sortants seront activés.
              </Typography>
              <TextField
                label="Expression complexe"
                name="complexCondition"
                value={formData.complexCondition || ''}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={4}
                helperText="Expression JUEL avancée qui définit le comportement de branchement"
              />
            </Paper>
          )}
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

export default GatewayConfig;
