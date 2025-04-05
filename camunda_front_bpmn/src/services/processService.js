import axios from 'axios';

const API_URL = 'http://localhost:8997/api/process';

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

export const processService = {
  /**
   * Récupère toutes les définitions de processus disponibles
   */
  getProcessDefinitions: async () => {
    return axios.get(`${API_URL}/definitions`, getAuthHeader());
  },
  
  /**
   * Démarre une instance de processus
   * @param {string} processKey - La clé du processus à démarrer
   * @param {Object} variables - Les variables initiales du processus
   * @param {string} businessKey - (Optionnel) Une clé métier pour identifier l'instance
   */
  startProcess: async (processKey, variables = {}, businessKey = null) => {
    const payload = {
      processKey: processKey,
      variables: variables
    };
    
    if (businessKey) {
      payload.businessKey = businessKey;
    }
    
    return axios.post(`${API_URL}/start`, payload, getAuthHeader());
  },

  /**
   * Récupère les détails d'une définition de processus spécifique
   * @param {string} processDefinitionId - L'ID de la définition de processus
   */
  getProcessDefinition: async (processDefinitionId) => {
    return axios.get(`${API_URL}/definitions/${processDefinitionId}`, getAuthHeader());
  },

  /**
   * Récupère les formulaires associés à une définition de processus
   * @param {string} processDefinitionId - L'ID de la définition de processus
   */
  getProcessForms: async (processDefinitionId) => {
    return axios.get(`${API_URL}/definitions/${processDefinitionId}/forms`, getAuthHeader());
  }
};

export default processService;
