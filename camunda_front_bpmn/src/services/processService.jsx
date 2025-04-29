import axios from 'axios';
import authHeader from './authHeader';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8998';

const listAllProcesses = async () => {
  try {
    const response = await axios.get(`${API_URL}/list-processes`, { headers: authHeader() });
    return response.data;
  } catch (error) {
    console.error('Error fetching processes:', error);
    throw error;
  }
};

const startProcess = async (processKey) => {
  try {
    const response = await axios.get(`${API_URL}/start-process?processKey=${processKey}`, { 
      headers: authHeader() 
    });
    return response.data;
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
    } else {
      // Si ce n'est pas une instance de FormData (cas où un simple fichier est passé)
      dataToSend = new FormData();
      dataToSend.append('file', formData);
      dataToSend.append('deployment-name', 'Déploiement depuis éditeur BPMN');
      dataToSend.append('deployment-source', 'Editeur BPMN');
    }
    
    console.log('Déploiement du processus avec les données: ', 
      Array.from(dataToSend.entries()).reduce((obj, [key, value]) => {
        obj[key] = value instanceof File ? value.name : value;
        return obj;
      }, {})
    );
    
    const response = await axios.post(`${API_URL}/deploy-process`, dataToSend, {
      headers: {
        ...authHeader(),
        'Content-Type': 'multipart/form-data'
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