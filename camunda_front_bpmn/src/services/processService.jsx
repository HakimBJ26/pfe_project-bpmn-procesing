import axios from 'axios';
import authHeader from './authHeader';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8998';

const listAllProcesses = async () => {
  try {
    console.log(`Appel API: GET ${API_URL}/list-processes`);
    // Utiliser le proxy backend pour récupérer les processus déployés
    const response = await axios.get(`${API_URL}/list-processes`, { headers: authHeader() });
    console.log('Réponse brute API:', response);
    return response.data;
  } catch (error) {
    console.error('Error fetching processes:', error);
    if (error.response) {
      console.error('API response error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    }
    throw error;
  }
};

const startProcess = async (processKey, variables = {}) => {
  try {
    console.log(`Démarrage du processus ${processKey} avec payload:`, variables);
    
    // Utiliser la méthode GET comme configuré dans le backend
    let url = `${API_URL}/start-process?processKey=${processKey}`;
    
    // Si on a des variables, les ajouter comme paramètre de requête JSON
    if (variables && variables.variables) {
      try {
        const varsObj = JSON.parse(variables.variables);
        url += `&variables=${encodeURIComponent(JSON.stringify(varsObj))}`;
      } catch (e) {
        console.warn('Impossible de parser les variables JSON:', e);
      }
    }
    
    console.log(`Appel API: GET ${url}`);
    const response = await axios.get(url, { headers: authHeader() });
    
    console.log('Réponse du démarrage de processus:', response.data);
    return { id: processKey, status: 'started' }; // Simuler une réponse similaire
  } catch (error) {
    console.error(`Error starting process with key ${processKey}:`, error);
    throw error;
  }
};

const getProcessById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/processes/${id}`, { headers: authHeader() });
    return response.data;
  } catch (error) {
    console.error(`Error fetching process with id ${id}:`, error);
    throw error;
  }
};

const changeProcessState = async (id, suspend) => {
  try {
    const response = await axios.put(`${API_URL}/processes/${id}/state?suspend=${suspend}`, {}, { 
      headers: authHeader() 
    });
    return response.data;
  } catch (error) {
    console.error(`Error changing state for process with id ${id}:`, error);
    throw error;
  }
};

const deployProcess = async (formData) => {
  try {
    // Vérifier si formData est déjà une instance de FormData
    let dataToSend;
    if (formData instanceof FormData) {
      dataToSend = formData;
      
      // Vérifier et ajouter l'option enableDuplicateFiltering s'il n'existe pas
      if (!Array.from(dataToSend.keys()).includes('enable-duplicate-filtering')) {
        dataToSend.append('enable-duplicate-filtering', 'true');
      }
      
      // Vérifier et ajouter deployChangedOnly s'il n'existe pas
      if (!Array.from(dataToSend.keys()).includes('deploy-changed-only')) {
        dataToSend.append('deploy-changed-only', 'true');
      }
    } else {
      // Si ce n'est pas une instance de FormData (cas où un simple fichier est passé)
      dataToSend = new FormData();
      dataToSend.append('file', formData);
      dataToSend.append('deployment-name', 'Déploiement depuis éditeur BPMN');
      dataToSend.append('deployment-source', 'Editeur BPMN');
      dataToSend.append('enable-duplicate-filtering', 'true');
      dataToSend.append('deploy-changed-only', 'true');
    }
    
    console.log('Déploiement du processus avec les données: ', 
      Array.from(dataToSend.entries()).reduce((obj, [key, value]) => {
        obj[key] = value instanceof File ? value.name : value;
        return obj;
      }, {})
    );
    
    // Ajouter un paramètre pour éviter la mise en cache
    const cacheBuster = new Date().getTime();
    
    const response = await axios.post(`${API_URL}/deploy-process?cacheBuster=${cacheBuster}`, dataToSend, {
      headers: {
        ...authHeader(),
        'Content-Type': 'multipart/form-data',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error deploying process:', error);
    throw error;
  }
};

const uploadForm = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(`${API_URL}/add-form`, formData, {
      headers: {
        ...authHeader(),
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading form:', error);
    throw error;
  }
};

const processService = {
  listAllProcesses,
  startProcess,
  getProcessById,
  changeProcessState,
  deployProcess,
  uploadForm
};

export default processService; 