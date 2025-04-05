import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { taskService } from '../../services/taskService';
import {
  Container, Paper, Typography, Box, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, IconButton,
  Chip, Tooltip, CircularProgress, Alert, TablePagination,
  Dialog, DialogActions, DialogContent, DialogContentText,
  DialogTitle, TextField
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AssignmentInd as AssignmentIndIcon,
  AssignmentReturn as AssignmentReturnIcon,
  Visibility as VisibilityIcon,
  CheckBox as CheckBoxIcon
} from '@mui/icons-material';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openClaimDialog, setOpenClaimDialog] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [claimUserId, setClaimUserId] = useState('');
  
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await taskService.getAllTasks();
      setTasks(response.data);
      setError('');
    } catch (err) {
      console.error('Erreur lors de la récupération des tâches:', err);
      setError('Impossible de charger les tâches. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewTask = (taskId) => {
    navigate(`/tasks/${taskId}`);
  };

  const handleCompleteTask = (taskId) => {
    navigate(`/tasks/${taskId}/complete`);
  };

  const handleOpenClaimDialog = (taskId) => {
    setSelectedTaskId(taskId);
    setClaimUserId(user?.id || '');
    setOpenClaimDialog(true);
  };

  const handleCloseClaimDialog = () => {
    setOpenClaimDialog(false);
    setSelectedTaskId(null);
  };

  const handleClaimTask = async () => {
    if (!selectedTaskId || !claimUserId) return;
    
    try {
      await taskService.claimTask(selectedTaskId, claimUserId);
      fetchTasks(); // Rafraîchir la liste après réclamation
      handleCloseClaimDialog();
    } catch (err) {
      console.error('Erreur lors de la réclamation de la tâche:', err);
      setError('Impossible de réclamer la tâche. Veuillez réessayer.');
    }
  };

  const handleUnclaimTask = async (taskId) => {
    try {
      await taskService.unclaimTask(taskId);
      fetchTasks(); // Rafraîchir la liste après libération
    } catch (err) {
      console.error('Erreur lors de la libération de la tâche:', err);
      setError('Impossible de libérer la tâche. Veuillez réessayer.');
    }
  };

  // Formater la date pour l'affichage
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1">
            Tâches à compléter
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchTasks}
            disabled={loading}
          >
            Actualiser
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : tasks.length === 0 ? (
          <Alert severity="info" sx={{ my: 2 }}>
            Aucune tâche disponible. Les tâches apparaîtront ici lorsque des processus seront en cours d'exécution.
          </Alert>
        ) : (
          <>
            <TableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Nom</TableCell>
                    <TableCell>Date de création</TableCell>
                    <TableCell>Processus</TableCell>
                    <TableCell>Assigné à</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tasks
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((task) => (
                      <TableRow key={task.id} hover>
                        <TableCell component="th" scope="row">
                          <Typography variant="body1" fontWeight={500}>
                            {task.name}
                          </Typography>
                          {task.description && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              {task.description}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(task.createTime)}</TableCell>
                        <TableCell>
                          <Tooltip title={`ID: ${task.processInstanceId}`}>
                            <Chip 
                              size="small" 
                              label={task.processInstanceId ? task.processInstanceId.substring(0, 8) + '...' : 'N/A'} 
                              color="primary" 
                              variant="outlined"
                            />
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          {task.assignee ? (
                            <Chip 
                              size="small"
                              label={task.assignee}
                              color="success"
                              icon={<CheckCircleIcon />}
                            />
                          ) : (
                            <Chip 
                              size="small" 
                              label="Non assigné" 
                              color="default"
                              icon={<CancelIcon />}
                            />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Tooltip title="Voir les détails">
                              <IconButton 
                                color="primary" 
                                onClick={() => handleViewTask(task.id)}
                                size="small"
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                            
                            {!task.assignee ? (
                              <Tooltip title="Réclamer cette tâche">
                                <IconButton 
                                  color="success" 
                                  onClick={() => handleOpenClaimDialog(task.id)}
                                  size="small"
                                >
                                  <AssignmentIndIcon />
                                </IconButton>
                              </Tooltip>
                            ) : task.assignee === user?.id ? (
                              <>
                                <Tooltip title="Libérer cette tâche">
                                  <IconButton 
                                    color="warning" 
                                    onClick={() => handleUnclaimTask(task.id)}
                                    size="small"
                                  >
                                    <AssignmentReturnIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Compléter cette tâche">
                                  <IconButton 
                                    color="success" 
                                    onClick={() => handleCompleteTask(task.id)}
                                    size="small"
                                  >
                                    <CheckBoxIcon />
                                  </IconButton>
                                </Tooltip>
                              </>
                            ) : null}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={tasks.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Lignes par page"
              labelDisplayedRows={({ from, to, count }) => `${from}–${to} sur ${count}`}
            />
          </>
        )}
      </Paper>

      {/* Boîte de dialogue pour réclamer une tâche */}
      <Dialog open={openClaimDialog} onClose={handleCloseClaimDialog}>
        <DialogTitle>Réclamer cette tâche</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Pour réclamer cette tâche, veuillez confirmer votre identifiant utilisateur :
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="userId"
            label="Identifiant utilisateur"
            type="text"
            fullWidth
            variant="outlined"
            value={claimUserId}
            onChange={(e) => setClaimUserId(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseClaimDialog}>Annuler</Button>
          <Button 
            onClick={handleClaimTask} 
            color="primary" 
            disabled={!claimUserId}
            variant="contained"
          >
            Réclamer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TaskList;
