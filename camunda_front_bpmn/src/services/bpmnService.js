import axios from 'axios';

const API_URL = 'http://localhost:8997/api/bpmn';

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

export const bpmnService = {
  // Processus
  createEmptyProcess: async (processData) => {
    return axios.post(`${API_URL}/create`, processData, getAuthHeader());
  },
  
  getAllActiveProcesses: async () => {
    return axios.get(`${API_URL}/processes`, getAuthHeader());
  },
  
  getProcessById: async (id) => {
    return axios.get(`${API_URL}/processes/${id}`, getAuthHeader());
  },
  
  getProcessVersions: async (processKey) => {
    return axios.get(`${API_URL}/processes/${processKey}/versions`, getAuthHeader());
  },
  
  updateProcessXml: async (processId, xmlData) => {
    return axios.put(`${API_URL}/processes/${processId}/xml`, xmlData, getAuthHeader());
  },
  
  // Éléments BPMN
  addElement: async (processId, elementData) => {
    return axios.post(`${API_URL}/processes/${processId}/elements`, elementData, getAuthHeader());
  },
  
  removeElement: async (processId, elementId) => {
    return axios.delete(`${API_URL}/processes/${processId}/elements/${elementId}`, getAuthHeader());
  },
  
  // Configurations des tâches
  configureUserTask: async (processId, taskId, configData) => {
    return axios.put(`${API_URL}/processes/${processId}/user-tasks/${taskId}`, configData, getAuthHeader());
  },
  
  configureServiceTask: async (processId, taskId, configData) => {
    return axios.put(`${API_URL}/processes/${processId}/service-tasks/${taskId}`, configData, getAuthHeader());
  },
  
  configureGateway: async (processId, gatewayId, configData) => {
    return axios.put(`${API_URL}/processes/${processId}/gateways/${gatewayId}`, configData, getAuthHeader());
  },
  
  // Récupération des configurations
  getUserTasks: async (processId) => {
    return axios.get(`${API_URL}/processes/${processId}/user-tasks`, getAuthHeader());
  },
  
  getServiceTasks: async (processId) => {
    return axios.get(`${API_URL}/processes/${processId}/service-tasks`, getAuthHeader());
  },
  
  getGateways: async (processId) => {
    return axios.get(`${API_URL}/processes/${processId}/gateways`, getAuthHeader());
  },
  
  // Détails des éléments spécifiques
  getUserTask: async (processId, taskId) => {
    return axios.get(`${API_URL}/processes/${processId}/user-tasks/${taskId}`, getAuthHeader());
  },
  
  getServiceTask: async (processId, taskId) => {
    return axios.get(`${API_URL}/processes/${processId}/service-tasks/${taskId}`, getAuthHeader());
  },
  
  getGateway: async (processId, gatewayId) => {
    return axios.get(`${API_URL}/processes/${processId}/gateways/${gatewayId}`, getAuthHeader());
  },
  
  // Formulaires pour les tâches utilisateur
  createTaskForm: async (processId, taskId, formData) => {
    return axios.post(`${API_URL}/processes/${processId}/user-tasks/${taskId}/forms`, formData, getAuthHeader());
  },
  
  updateTaskForm: async (processId, taskId, formId, formData) => {
    return axios.put(`${API_URL}/processes/${processId}/user-tasks/${taskId}/forms/${formId}`, formData, getAuthHeader());
  },
  
  getTaskForms: async (processId, taskId) => {
    return axios.get(`${API_URL}/processes/${processId}/user-tasks/${taskId}/forms`, getAuthHeader());
  },
  
  // Démarrage d'un processus
  startProcess: async (processKey, variables) => {
    return axios.post(`${API_URL}/processes/${processKey}/start`, variables, getAuthHeader());
  },
  
  // Gestion des connexions entre éléments
  setElementConnection: async (processId, sourceId, targetId, configData) => {
    return axios.post(`${API_URL}/processes/${processId}/connections`, {
      sourceId,
      targetId,
      ...configData
    }, getAuthHeader());
  },
  
  updateElementConnection: async (processId, connectionId, configData) => {
    return axios.put(`${API_URL}/processes/${processId}/connections/${connectionId}`, configData, getAuthHeader());
  },
  
  // Validation du processus
  validateProcess: async (processId) => {
    return axios.get(`${API_URL}/processes/${processId}/validate`, getAuthHeader());
  }
};

export default bpmnService;
