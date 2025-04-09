import axios from 'axios';

const API_URL = 'http://localhost:8997/api';

// Helper pour récupérer le token d'authentification
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

// Helper pour les appels avec FormData
const getFormDataAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
    }
  };
};

export const dmnService = {
  // DMN Definitions
  createEmptyDmn: async (dmnData) => {
    return axios.post(`${API_URL}/dmn/create`, dmnData, getAuthHeader());
  },

  getAllDmns: async () => {
    return axios.get(`${API_URL}/dmn/definitions`, getAuthHeader());
  },

  getDmnById: async (id) => {
    return axios.get(`${API_URL}/dmn/definitions/${id}`, getAuthHeader());
  },

  getDmnByKey: async (dmnKey) => {
    return axios.get(`${API_URL}/dmn/definitions/key/${dmnKey}`, getAuthHeader());
  },

  updateDmnXml: async (dmnId, xmlData) => {
    return axios.put(`${API_URL}/dmn/definitions/${dmnId}/xml`, xmlData, getAuthHeader());
  },

  deleteDmn: async (dmnId) => {
    return axios.delete(`${API_URL}/dmn/definitions/${dmnId}`, getAuthHeader());
  },

  // Déploiement DMN
  deployDmn: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    return axios.post(`${API_URL}/dmn/deploy`, formData, getFormDataAuthHeader());
  },

  // Exécution de décisions
  evaluateDecision: async (decisionKey, variables) => {
    return axios.post(`${API_URL}/dmn/evaluate/${decisionKey}`, variables, getAuthHeader());
  },

  // Historique des décisions
  getDecisionHistory: async (decisionKey) => {
    return axios.get(`${API_URL}/dmn/history/${decisionKey}`, getAuthHeader());
  },

  // Obtenir les variables d'entrée requises pour une décision
  getDecisionInputs: async (decisionKey) => {
    return axios.get(`${API_URL}/dmn/inputs/${decisionKey}`, getAuthHeader());
  },

  // Validation du DMN
  validateDmn: async (xmlData) => {
    return axios.post(`${API_URL}/dmn/validate`, xmlData, getAuthHeader());
  },
};

export default dmnService;
