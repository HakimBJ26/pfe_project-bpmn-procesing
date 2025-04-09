import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Divider, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, TextField,
  CircularProgress, Alert, Grid, Chip, Card, CardContent
} from '@mui/material';
import { History, Search, Check, Error } from '@mui/icons-material';
import dmnService from '../../services/dmnService';

const DmnHistory = () => {
  const [loading, setLoading] = useState(false);
  const [dmns, setDmns] = useState([]);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchDmns();
  }, []);

  const fetchDmns = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await dmnService.getAllDmns();
      setDmns(response.data);
    } catch (err) {
      console.error('Erreur lors de la récupération des DMNs:', err);
      setError("Erreur lors de la récupération des DMNs: " +
        (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const filteredDmns = dmns.filter(dmn =>
    dmn.name.toLowerCase().includes(filter.toLowerCase()) ||
    dmn.decisionKey.toLowerCase().includes(filter.toLowerCase()) ||
    dmn.category?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        <History sx={{ mr: 1, verticalAlign: 'middle' }} />
        Historique des Tables de Décision DMN
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            variant="outlined"
            label="Rechercher des tables de décision"
            value={filter}
            onChange={handleFilterChange}
            InputProps={{
              startAdornment: <Search color="action" sx={{ mr: 1 }} />,
            }}
          />
        </Grid>
        <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={fetchDmns}
            disabled={loading}
          >
            Rafraîchir
          </Button>
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredDmns.length > 0 ? (
        <TableContainer component={Paper} sx={{ mb: 4 }}>
          <Table sx={{ minWidth: 650 }} aria-label="dmn history table">
            <TableHead>
              <TableRow>
                <TableCell>Nom</TableCell>
                <TableCell>Clé de Décision</TableCell>
                <TableCell>Version</TableCell>
                <TableCell>Catégorie</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Date de création</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDmns.map((dmn) => (
                <TableRow key={dmn.id} hover>
                  <TableCell>{dmn.name}</TableCell>
                  <TableCell>{dmn.decisionKey}</TableCell>
                  <TableCell>{dmn.version}</TableCell>
                  <TableCell>{dmn.category || '-'}</TableCell>
                  <TableCell>
                    {dmn.deployed ? (
                      <Chip
                        icon={<Check />}
                        label="Déployé"
                        color="success"
                        size="small"
                      />
                    ) : (
                      <Chip
                        icon={<Error />}
                        label="Non déployé"
                        color="warning"
                        size="small"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(dmn.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      href={`/dmn-modeler?id=${dmn.id}`}
                    >
                      Modifier
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography align="center" color="textSecondary">
              Aucune table de décision trouvée
            </Typography>
          </CardContent>
        </Card>
      )}

      <Box sx={{ mt: 3 }}>
        <Typography variant="h5" gutterBottom>
          Informations sur les Tables de Décision DMN
        </Typography>
        <Typography paragraph>
          Les tables de décision DMN (Decision Model and Notation) permettent de modéliser des règles métier complexes de manière visuelle et structurée.
        </Typography>
        <Typography paragraph>
          Vous pouvez créer et éditer des tables de décision, puis les déployer sur le moteur Camunda pour les utiliser dans vos processus BPMN.
        </Typography>
      </Box>
    </Box>
  );
};

export default DmnHistory;
