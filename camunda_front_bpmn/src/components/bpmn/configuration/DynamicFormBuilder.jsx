import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  Switch,
  FormControlLabel,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  DragHandle as DragHandleIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const FIELD_TYPES = [
  { label: 'Texte court', value: 'text' },
  { label: 'Texte long', value: 'textarea' },
  { label: 'Nombre', value: 'number' },
  { label: 'Date', value: 'date' },
  { label: 'Heure', value: 'time' },
  { label: 'Sélection', value: 'select' },
  { label: 'Cases à cocher', value: 'checkbox' },
  { label: 'Boutons radio', value: 'radio' },
  { label: 'Email', value: 'email' },
  { label: 'Téléphone', value: 'tel' },
  { label: 'Fichier', value: 'file' }
];

const DynamicFormBuilder = ({ value = [], onChange }) => {
  const [formFields, setFormFields] = useState(value);
  
  // Ajouter un nouveau champ
  const handleAddField = () => {
    const newField = {
      id: `field_${Date.now()}`,
      type: 'text',
      label: 'Nouveau champ',
      name: `field_${formFields.length + 1}`,
      required: false,
      placeholder: '',
      defaultValue: '',
      options: [],
      validations: {}
    };
    
    const updatedFields = [...formFields, newField];
    setFormFields(updatedFields);
    onChange(updatedFields);
  };
  
  // Supprimer un champ
  const handleDeleteField = (index) => {
    const updatedFields = formFields.filter((_, i) => i !== index);
    setFormFields(updatedFields);
    onChange(updatedFields);
  };
  
  // Mettre à jour un champ
  const handleUpdateField = (index, field, value) => {
    const updatedFields = [...formFields];
    updatedFields[index] = {
      ...updatedFields[index],
      [field]: value
    };
    
    // Si le label change, suggérer un nom basé sur le label
    if (field === 'label') {
      updatedFields[index].name = value
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_');
    }
    
    setFormFields(updatedFields);
    onChange(updatedFields);
  };
  
  // Ajouter une option pour les champs select, checkbox ou radio
  const handleAddOption = (index) => {
    const updatedFields = [...formFields];
    const options = updatedFields[index].options || [];
    options.push({
      label: `Option ${options.length + 1}`,
      value: `option_${options.length + 1}`
    });
    
    updatedFields[index].options = options;
    setFormFields(updatedFields);
    onChange(updatedFields);
  };
  
  // Mettre à jour une option
  const handleUpdateOption = (fieldIndex, optionIndex, field, value) => {
    const updatedFields = [...formFields];
    updatedFields[fieldIndex].options[optionIndex] = {
      ...updatedFields[fieldIndex].options[optionIndex],
      [field]: value
    };
    
    setFormFields(updatedFields);
    onChange(updatedFields);
  };
  
  // Supprimer une option
  const handleDeleteOption = (fieldIndex, optionIndex) => {
    const updatedFields = [...formFields];
    updatedFields[fieldIndex].options = updatedFields[fieldIndex].options.filter(
      (_, i) => i !== optionIndex
    );
    
    setFormFields(updatedFields);
    onChange(updatedFields);
  };
  
  // Gérer le drag and drop des champs
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(formFields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setFormFields(items);
    onChange(items);
  };
  
  // Déplacer un champ vers le haut
  const handleMoveUp = (index) => {
    if (index === 0) return;
    
    const updatedFields = [...formFields];
    const temp = updatedFields[index];
    updatedFields[index] = updatedFields[index - 1];
    updatedFields[index - 1] = temp;
    
    setFormFields(updatedFields);
    onChange(updatedFields);
  };
  
  // Déplacer un champ vers le bas
  const handleMoveDown = (index) => {
    if (index === formFields.length - 1) return;
    
    const updatedFields = [...formFields];
    const temp = updatedFields[index];
    updatedFields[index] = updatedFields[index + 1];
    updatedFields[index + 1] = temp;
    
    setFormFields(updatedFields);
    onChange(updatedFields);
  };
  
  return (
    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.paper' }}>
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Champs du formulaire</Typography>
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            color="primary"
            onClick={handleAddField}
          >
            Ajouter un champ
          </Button>
        </Box>
        
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="formFields">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {formFields.length === 0 ? (
                  <Paper sx={{ p: 3, bgcolor: 'grey.100', textAlign: 'center' }}>
                    <Typography color="textSecondary">
                      Aucun champ ajouté. Cliquez sur "Ajouter un champ" pour commencer.
                    </Typography>
                  </Paper>
                ) : (
                  <Stack spacing={2}>
                    {formFields.map((field, index) => (
                      <Draggable
                        key={field.id}
                        draggableId={field.id}
                        index={index}
                      >
                        {(provided) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            variant="outlined"
                            sx={{ position: 'relative' }}
                          >
                            <CardHeader
                              title={
                                <Box 
                                  sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center' 
                                  }}
                                  {...provided.dragHandleProps}
                                >
                                  <DragHandleIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                  <Typography variant="subtitle1">
                                    {field.label || `Champ ${index + 1}`}
                                  </Typography>
                                </Box>
                              }
                              action={
                                <Box>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleMoveUp(index)}
                                    disabled={index === 0}
                                  >
                                    <ArrowUpIcon />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleMoveDown(index)}
                                    disabled={index === formFields.length - 1}
                                  >
                                    <ArrowDownIcon />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleDeleteField(index)}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Box>
                              }
                              sx={{ bgcolor: 'grey.50', borderBottom: 1, borderColor: 'divider' }}
                            />
                            <CardContent>
                              <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                  <TextField
                                    fullWidth
                                    label="Libellé"
                                    value={field.label}
                                    onChange={(e) =>
                                      handleUpdateField(index, 'label', e.target.value)
                                    }
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <TextField
                                    fullWidth
                                    label="Nom du champ"
                                    value={field.name}
                                    onChange={(e) =>
                                      handleUpdateField(index, 'name', e.target.value)
                                    }
                                    helperText="Identifiant technique du champ"
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <FormControl fullWidth>
                                    <InputLabel>Type de champ</InputLabel>
                                    <Select
                                      value={field.type}
                                      label="Type de champ"
                                      onChange={(e) =>
                                        handleUpdateField(index, 'type', e.target.value)
                                      }
                                    >
                                      {FIELD_TYPES.map((type) => (
                                        <MenuItem key={type.value} value={type.value}>
                                          {type.label}
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <TextField
                                    fullWidth
                                    label="Placeholder"
                                    value={field.placeholder || ''}
                                    onChange={(e) =>
                                      handleUpdateField(index, 'placeholder', e.target.value)
                                    }
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <TextField
                                    fullWidth
                                    label="Valeur par défaut"
                                    value={field.defaultValue || ''}
                                    onChange={(e) =>
                                      handleUpdateField(index, 'defaultValue', e.target.value)
                                    }
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <FormControlLabel
                                    control={
                                      <Switch
                                        checked={field.required || false}
                                        onChange={(e) =>
                                          handleUpdateField(index, 'required', e.target.checked)
                                        }
                                      />
                                    }
                                    label="Champ obligatoire"
                                  />
                                </Grid>
                                
                                {/* Options pour select, checkbox, radio */}
                                {['select', 'checkbox', 'radio'].includes(field.type) && (
                                  <Grid item xs={12}>
                                    <Divider sx={{ my: 1 }} />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                      <Typography variant="subtitle2">Options</Typography>
                                      <Button
                                        startIcon={<AddIcon />}
                                        size="small"
                                        onClick={() => handleAddOption(index)}
                                      >
                                        Ajouter une option
                                      </Button>
                                    </Box>
                                    
                                    <Stack spacing={1}>
                                      {(field.options || []).map((option, optionIndex) => (
                                        <Box
                                          key={optionIndex}
                                          sx={{
                                            display: 'flex',
                                            gap: 1,
                                            alignItems: 'center',
                                            p: 1,
                                            border: 1,
                                            borderColor: 'divider',
                                            borderRadius: 1
                                          }}
                                        >
                                          <TextField
                                            size="small"
                                            label="Libellé"
                                            value={option.label}
                                            onChange={(e) =>
                                              handleUpdateOption(
                                                index,
                                                optionIndex,
                                                'label',
                                                e.target.value
                                              )
                                            }
                                            sx={{ flex: 1 }}
                                          />
                                          <TextField
                                            size="small"
                                            label="Valeur"
                                            value={option.value}
                                            onChange={(e) =>
                                              handleUpdateOption(
                                                index,
                                                optionIndex,
                                                'value',
                                                e.target.value
                                              )
                                            }
                                            sx={{ flex: 1 }}
                                          />
                                          <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => handleDeleteOption(index, optionIndex)}
                                          >
                                            <DeleteIcon />
                                          </IconButton>
                                        </Box>
                                      ))}
                                    </Stack>
                                  </Grid>
                                )}
                              </Grid>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                  </Stack>
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        
        {formFields.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button
              startIcon={<AddIcon />}
              variant="outlined"
              color="primary"
              onClick={handleAddField}
            >
              Ajouter un autre champ
            </Button>
          </Box>
        )}
      </Stack>
    </Paper>
  );
};

export default DynamicFormBuilder;
