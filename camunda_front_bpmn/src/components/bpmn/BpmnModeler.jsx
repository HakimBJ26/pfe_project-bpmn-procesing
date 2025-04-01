import React, { useEffect, useRef, useState } from 'react';
import BpmnJS from 'bpmn-js/lib/Modeler';
import {
    Container,
    AppBar,
    Toolbar,
    Button,
    Paper,
    Divider,
    Alert,
    Snackbar,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Box,
    Typography,
    Tooltip,
    Chip
} from '@mui/material';
import {
    CloudUpload,
    PlayArrow,
    Download,
    Upload,
    Save
} from '@mui/icons-material';
import authService from '../../services/authService';
import bpmnService from '../../services/bpmnService';
import ElementConfigManager from './configuration/ElementConfigManager';

const BpmnModeler = () => {
    const [bpmnModeler, setBpmnModeler] = useState(null);
    const [xml, setXml] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [processKey, setProcessKey] = useState('');
    const [deploymentId, setDeploymentId] = useState('');
    const [success, setSuccess] = useState('');
    const [startDialogOpen, setStartDialogOpen] = useState(false);
    const [processInstanceId, setProcessInstanceId] = useState('');
    const [variables, setVariables] = useState('{}');
    const [selectedElement, setSelectedElement] = useState(null);
    const [currentProcessId, setCurrentProcessId] = useState(null);
    const [processName, setProcessName] = useState('');
    const [createProcessDialogOpen, setCreateProcessDialogOpen] = useState(false);
    const containerRef = useRef(null);
    const fileInputRef = useRef(null);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    };

    const handleApiError = async (error) => {
        if (error.response?.status === 401) {
            authService.logout();
            return 'Session expirée, veuillez vous reconnecter';
        }

        try {
            const errorData = await error.json();
            return errorData.message || errorData.error || 'Erreur lors de la requête';
        } catch (e) {
            return error.message || 'Erreur inconnue';
        }
    };

    useEffect(() => {
        const modeler = new BpmnJS({
            container: containerRef.current,
            keyboard: { bindTo: window }
        });

        const initializeModeler = async () => {
            try {
                await modeler.createDiagram();
                setBpmnModeler(modeler);
                
                // Ajouter des écouteurs d'événements pour la sélection d'éléments
                const eventBus = modeler.get('eventBus');
                const selection = modeler.get('selection');
                
                eventBus.on('selection.changed', (e) => {
                    const selectedElements = selection.get();
                    console.log('Selected elements:', selectedElements);
                    if (selectedElements.length === 1) {
                        // Un seul élément sélectionné
                        const element = selectedElements[0];
                        console.log('Setting selected element:', element);
                        setSelectedElement(element);
                    } else {
                        // Plusieurs éléments ou aucun élément sélectionné
                        console.log('Clearing selected element');
                        setSelectedElement(null);
                    }
                });
                
                // Écouteur pour les modifications d'éléments
                eventBus.on('element.changed', (e) => {
                    // Si l'élément modifié est celui actuellement sélectionné, mettre à jour
                    if (selectedElement && e.element.id === selectedElement.id) {
                        console.log('Updating selected element due to change');
                        setSelectedElement(e.element);
                    }
                });
            } catch (err) {
                handleError('Erreur lors de la création du diagramme', err);
            }
        };

        initializeModeler();

        return () => modeler.destroy();
    }, []);

    const handleError = (message, error) => {
        console.error(message, error);
        setError(message);
        setLoading(false);
    };

    const handleImport = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setLoading(true);
        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    await bpmnModeler.importXML(e.target.result);
                    setLoading(false);
                } catch (err) {
                    handleError('Fichier BPMN invalide', err);
                }
            };
            reader.readAsText(file);
        } catch (err) {
            handleError('Erreur de lecture du fichier', err);
        }
    };

    const handleExport = async () => {
        if (!bpmnModeler) return;

        setLoading(true);
        try {
            const { xml } = await bpmnModeler.saveXML({ format: true });
            const blob = new Blob([xml], { type: 'application/xml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `process-${Date.now()}.bpmn`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            handleError('Erreur lors de l\'export', err);
        }
        setLoading(false);
    };

    const handleOpenCreateProcessDialog = () => {
        setCreateProcessDialogOpen(true);
    };

    const handleCloseCreateProcessDialog = () => {
        setCreateProcessDialogOpen(false);
    };

    const handleCreateProcess = async () => {
        if (!processName) {
            setError('Veuillez saisir un nom pour le processus');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');
        
        try {
            const response = await bpmnService.createEmptyProcess({
                name: processName,
                description: '',
                category: ''
            });
            
            const newProcessId = response.data.id;
            setCurrentProcessId(newProcessId);
            setProcessKey(response.data.processKey);
            setSuccess(`Nouveau processus créé: ${response.data.name}`);
            setCreateProcessDialogOpen(false);
            
            // Facultatif: charger un diagramme vide ou un template par défaut
            await bpmnModeler.createDiagram();
            
        } catch (err) {
            console.error("Erreur lors de la création du processus", err);
            setError("Erreur lors de la création du processus: " + 
                (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProcess = async () => {
        if (!bpmnModeler || !currentProcessId) {
            setError('Aucun processus actif à sauvegarder');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');
        
        try {
            const { xml } = await bpmnModeler.saveXML({ format: true });
            setXml(xml);
            
            // Appel à l'API pour sauvegarder le XML du processus
            await bpmnService.updateProcessXml(currentProcessId, { xml });
            
            setSuccess('Processus sauvegardé avec succès');
        } catch (err) {
            console.error("Erreur lors de la sauvegarde", err);
            setError("Erreur lors de la sauvegarde: " + 
                (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleDeploy = async () => {
        if (!bpmnModeler) return;

        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const { xml } = await bpmnModeler.saveXML({ format: true });
            setXml(xml);

            const blob = new Blob([xml], { type: 'application/xml' });
            const file = new File([blob], 'process.bpmn');

            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('http://localhost:8997/api/process/deploy', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erreur lors du déploiement');
            }

            const data = await response.json();
            setProcessKey(data.processKey);
            setDeploymentId(data.deploymentId);
            setSuccess('Processus déployé avec succès');
        } catch (err) {
            const errorMessage = await handleApiError(err);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenStartDialog = () => {
        if (!processKey) {
            setError('Veuillez d\'abord déployer un processus');
            return;
        }
        setStartDialogOpen(true);
    };

    const handleCloseStartDialog = () => {
        setStartDialogOpen(false);
    };

    const handleStartProcess = async () => {
        if (!processKey) {
            setError('Aucun processus déployé à démarrer');
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

            const response = await fetch('http://localhost:8997/api/process/start', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    processKey: processKey,
                    variables: parsedVariables
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erreur lors du démarrage du processus');
            }

            const data = await response.json();
            setProcessInstanceId(data.processInstanceId);
            setSuccess(`Processus démarré avec succès. ID d'instance: ${data.processInstanceId}`);
            setStartDialogOpen(false);
        } catch (err) {
            const errorMessage = await handleApiError(err);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleElementConfigSaved = (configData) => {
        setSuccess(`Configuration enregistrée pour l'élément ${configData.taskId || configData.gatewayId}`);
        // Actualiser les données du processus si nécessaire
    };

    return (
        <Container disableGutters maxWidth={false} sx={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#f5f5f5'
        }}>
            <AppBar position="static" color="inherit" sx={{
                boxShadow: 1,
                backgroundColor: 'white',
                color: 'text.primary'
            }}>
                <Toolbar sx={{ gap: 2 }}>
                    <input
                        type="file"
                        hidden
                        ref={fileInputRef}
                        onChange={handleImport}
                        accept=".bpmn, .xml"
                    />

                    <Button
                        variant="contained"
                        color="inherit"
                        startIcon={<Upload />}
                        onClick={() => fileInputRef.current.click()}
                        sx={{
                            backgroundColor: '#e3f2fd',
                            '&:hover': { backgroundColor: '#bbdefb' }
                        }}
                    >
                        Import
                    </Button>

                    <Button
                        variant="contained"
                        color="inherit"
                        startIcon={<Download />}
                        onClick={handleExport}
                        sx={{
                            backgroundColor: '#f0f4c3',
                            '&:hover': { backgroundColor: '#e6ee9c' }
                        }}
                    >
                        Export
                    </Button>

                    <Divider orientation="vertical" flexItem />

                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={handleOpenCreateProcessDialog}
                        sx={{ ml: 2 }}
                    >
                        Nouveau Processus
                    </Button>

                    <Button
                        variant="contained" 
                        color="primary"
                        startIcon={<Save />}
                        onClick={handleSaveProcess}
                        disabled={loading || !currentProcessId}
                        sx={{ boxShadow: 2 }}
                    >
                        Sauvegarder
                    </Button>

                    <Divider orientation="vertical" flexItem />

                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<CloudUpload />}
                        onClick={handleDeploy}
                        disabled={loading}
                        sx={{
                            ml: 2,
                            boxShadow: 2,
                            '&:hover': { boxShadow: 3 }
                        }}
                    >
                        Deploy Process
                    </Button>

                    <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<PlayArrow />}
                        onClick={handleOpenStartDialog}
                        disabled={loading || !processKey}
                        sx={{
                            boxShadow: 2,
                            '&:hover': { boxShadow: 3 }
                        }}
                    >
                        Start Process
                    </Button>

                    {currentProcessId && (
                        <Chip 
                            label={`ID: ${currentProcessId}`} 
                            variant="outlined" 
                            color="primary"
                            sx={{ ml: 'auto' }}
                        />
                    )}
                </Toolbar>
            </AppBar>

            <Paper elevation={0} sx={{
                flex: 1,
                m: 2,
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: 3,
                position: 'relative',
                display: 'flex'
            }}>
                <div
                    ref={containerRef}
                    style={{
                        height: '100%',
                        width: selectedElement ? '70%' : '100%',
                        transition: 'width 0.3s ease'
                    }}
                />
                
                {/* Panneau de propriétés - Affichage direct */}
                {selectedElement && (
                    <Box sx={{ 
                        width: '30%', 
                        borderLeft: '1px solid #e0e0e0',
                        padding: 2,
                        overflowY: 'auto',
                        backgroundColor: '#f5f5f5'
                    }}>
                        <Typography variant="h6" gutterBottom color="primary">
                            {selectedElement.type.replace('bpmn:', '')} : {selectedElement.businessObject?.name || selectedElement.id}
                        </Typography>
                        
                        {currentProcessId ? (
                            <ElementConfigManager
                                modeler={bpmnModeler}
                                selectedElement={selectedElement}
                                processId={currentProcessId}
                                onConfigSaved={handleElementConfigSaved}
                                directDisplay={true}
                            />
                        ) : (
                            <Alert severity="warning" sx={{ mt: 2 }}>
                                Veuillez d'abord créer et sauvegarder un processus
                            </Alert>
                        )}
                    </Box>
                )}
            </Paper>

            {/* Dialog pour créer un nouveau processus */}
            <Dialog 
                open={createProcessDialogOpen} 
                onClose={handleCloseCreateProcessDialog}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Créer un nouveau processus</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            label="Nom du processus"
                            fullWidth
                            margin="normal"
                            variant="outlined"
                            value={processName}
                            onChange={(e) => setProcessName(e.target.value)}
                            required
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseCreateProcessDialog} color="inherit">
                        Annuler
                    </Button>
                    <Button 
                        onClick={handleCreateProcess} 
                        color="primary" 
                        variant="contained"
                        disabled={!processName}
                    >
                        Créer
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog for process variables */}
            <Dialog 
                open={startDialogOpen} 
                onClose={handleCloseStartDialog}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Démarrer un processus</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Clé du processus: {processKey}
                        </Typography>
                        
                        <TextField
                            label="Variables du processus (JSON)"
                            multiline
                            rows={4}
                            fullWidth
                            margin="normal"
                            variant="outlined"
                            value={variables}
                            onChange={(e) => setVariables(e.target.value)}
                            placeholder='{"exampleKey": "exampleValue"}'
                            helperText="Format JSON, ex: {'nom': 'valeur'}"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseStartDialog} color="inherit">
                        Annuler
                    </Button>
                    <Button 
                        onClick={handleStartProcess} 
                        color="primary" 
                        variant="contained"
                    >
                        Démarrer
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={() => setError('')}
            >
                <Alert severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>

            <Snackbar
                open={!!success}
                autoHideDuration={6000}
                onClose={() => setSuccess('')}
            >
                <Alert severity="success" sx={{ width: '100%' }}>
                    {success}
                </Alert>
            </Snackbar>

            {loading && (
                <CircularProgress
                    size={60}
                    sx={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)'
                    }}
                />
            )}
        </Container>
    );
};

export default BpmnModeler;