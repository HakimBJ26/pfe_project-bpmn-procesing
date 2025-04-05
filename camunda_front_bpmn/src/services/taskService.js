import axios from 'axios';

const API_URL = 'http://localhost:8997/api/tasks';

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

export const taskService = {
  /**
   * Récupère toutes les tâches actives
   */
  getAllTasks: async () => {
    return axios.get(API_URL, getAuthHeader());
  },
  
  /**
   * Récupère les détails d'une tâche spécifique
   * @param {string} taskId - L'identifiant de la tâche
   */
  getTaskById: async (taskId) => {
    return axios.get(`${API_URL}/${taskId}`, getAuthHeader());
  },
  
  /**
   * Récupère le formulaire associé à une tâche
   * @param {string} taskId - L'identifiant de la tâche
   */
  getTaskForm: async (taskId) => {
    return axios.get(`${API_URL}/${taskId}/form`, getAuthHeader());
  },
  
  /**
   * Réclame (claim) une tâche pour l'utilisateur courant
   * @param {string} taskId - L'identifiant de la tâche
   * @param {string} userId - L'identifiant de l'utilisateur qui réclame la tâche
   */
  claimTask: async (taskId, userId) => {
    return axios.post(`${API_URL}/${taskId}/claim`, { userId }, getAuthHeader());
  },
  
  /**
   * Libère (unclaim) une tâche précédemment réclamée
   * @param {string} taskId - L'identifiant de la tâche
   */
  unclaimTask: async (taskId) => {
    return axios.post(`${API_URL}/${taskId}/unclaim`, {}, getAuthHeader());
  },
  
  /**
   * Complète une tâche avec des variables
   * @param {string} taskId - L'identifiant de la tâche
   * @param {Object} variables - Les variables à soumettre avec la tâche
   */
  completeTask: async (taskId, variables) => {
    return axios.post(`${API_URL}/${taskId}/complete`, { variables }, getAuthHeader());
  }
};

export default taskService;
