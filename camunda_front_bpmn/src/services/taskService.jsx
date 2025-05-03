import axios from 'axios';
import authHeader from './authHeader';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8998';

/**
 * Récupère toutes les tâches utilisateur en attente
 * @param {Object} filters - Filtres optionnels (assignee, candidateUser, candidateGroup...)
 * @returns {Promise<Array>} Liste des tâches
 */
const getUserTasks = async (filters = {}) => {
  try {
    console.log('Récupération des tâches avec les filtres:', filters);
    const queryParams = new URLSearchParams();
    
    // Ajout des filtres à la requête s'ils sont définis
    if (filters.assignee) queryParams.append('userId', filters.assignee);
    if (filters.candidateGroup) queryParams.append('candidateGroup', filters.candidateGroup);
    
    console.log(`Appel API: GET ${API_URL}/tasks?${queryParams.toString()}`);
    const response = await axios.get(`${API_URL}/tasks?${queryParams.toString()}`, { 
      headers: authHeader() 
    });
    console.log('Réponse API tâches:', response.data);
    return response.data || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des tâches:', error);
    if (error.response) {
      console.error('Détails erreur API:', error.response.status, error.response.data);
    }
    return []; // Retourner un tableau vide en cas d'erreur
  }
};

/**
 * Récupère les détails d'une tâche spécifique
 * @param {string} taskId - ID de la tâche
 * @returns {Promise<Object>} Détails de la tâche
 */
const getTaskById = async (taskId) => {
  try {
    const response = await axios.get(`${API_URL}/tasks/${taskId}`, { 
      headers: authHeader() 
    });
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération de la tâche ${taskId}:`, error);
    throw error;
  }
};

/**
 * Récupère le formulaire associé à une tâche
 * @param {string} taskId - ID de la tâche
 * @returns {Promise<Object>} Définition du formulaire
 */
const getTaskForm = async (taskId) => {
  try {
    const response = await axios.get(`${API_URL}/tasks/${taskId}/form`, { 
      headers: authHeader() 
    });
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération du formulaire pour la tâche ${taskId}:`, error);
    throw error;
  }
};

/**
 * Récupère les variables d'une tâche
 * @param {string} taskId - ID de la tâche
 * @returns {Promise<Object>} Variables de la tâche
 */
const getTaskVariables = async (taskId) => {
  try {
    const response = await axios.get(`${API_URL}/tasks/${taskId}/variables`, { 
      headers: authHeader() 
    });
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération des variables pour la tâche ${taskId}:`, error);
    throw error;
  }
};

/**
 * Revendique une tâche pour l'utilisateur courant
 * @param {string} taskId - ID de la tâche
 * @returns {Promise<Object>} Résultat de l'opération
 */
const claimTask = async (taskId) => {
  try {
    // Utiliser l'endpoint corriger avec l'ID utilisateur "demo" (à remplacer par l'utilisateur réel)
    const response = await axios.post(`${API_URL}/tasks/${taskId}/user/claim?userId=demo`, {}, { 
      headers: authHeader() 
    });
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la revendication de la tâche ${taskId}:`, error);
    throw error;
  }
};

/**
 * Libère une tâche revendiquée
 * @param {string} taskId - ID de la tâche
 * @returns {Promise<Object>} Résultat de l'opération
 */
const unclaimTask = async (taskId) => {
  try {
    const response = await axios.post(`${API_URL}/tasks/${taskId}/unclaim`, {}, { 
      headers: authHeader() 
    });
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la libération de la tâche ${taskId}:`, error);
    throw error;
  }
};

/**
 * Complète une tâche avec les variables spécifiées
 * @param {string} taskId - ID de la tâche
 * @param {Object} variables - Variables à soumettre avec la tâche
 * @returns {Promise<Object>} Résultat de l'opération
 */
const completeTask = async (taskId, variables = {}) => {
  try {
    console.log(`Complétion de la tâche ${taskId} avec les variables:`, variables);
    
    // Utiliser l'endpoint submit-form comme défini dans le backend
    const response = await axios.post(
      `${API_URL}/tasks/${taskId}/submit-form`, 
      variables, 
      { headers: authHeader() }
    );
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la complétion de la tâche ${taskId}:`, error);
    throw error;
  }
};

const taskService = {
  getUserTasks,
  getTaskById,
  getTaskForm,
  getTaskVariables,
  claimTask,
  unclaimTask,
  completeTask
};

export default taskService; 