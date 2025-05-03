import axios from 'axios';
import authHeader from './authHeader';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8998';

const getAllWorkflows = async () => {
  try {
    const response = await axios.get(`${API_URL}/workflows`, { headers: authHeader() });
    return response.data;
  } catch (error) {
    console.error('Error fetching workflows:', error);
    throw error;
  }
};

const getWorkflowById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/workflows/${id}`, { headers: authHeader() });
    return response.data;
  } catch (error) {
    console.error(`Error fetching workflow with id ${id}:`, error);
    throw error;
  }
};

const createWorkflow = async (workflowData) => {
  try {
    // Validation des données requises
    if (!workflowData.title) {
      throw new Error('Le titre du workflow est requis');
    }
    
    if (!workflowData.workflowContent) {
      throw new Error('Le contenu du workflow est requis');
    }
    
    // S'assurer que les champs obligatoires sont présents
    const dataToSend = {
      title: workflowData.title,
      content: workflowData.workflowContent,
      processId: workflowData.processId || 'Process_1',
      version: workflowData.version || 1,
      description: workflowData.description || `Workflow: ${workflowData.title}`,
      createdBy: workflowData.createdBy || 'user'
    };
    
    console.log('Création du workflow avec les données:', dataToSend);
    
    const response = await axios.post(`${API_URL}/workflows`, dataToSend, { 
      headers: {
        ...authHeader(),
        'Content-Type': 'application/json'
      } 
    });
    return response.data;
  } catch (error) {
    console.error('Error creating workflow:', error);
    throw error;
  }
};

const updateWorkflow = async (id, workflowData) => {
  try {
    // Validation des données requises
    if (!workflowData.title) {
      throw new Error('Le titre du workflow est requis');
    }
    
    if (!workflowData.workflowContent) {
      throw new Error('Le contenu du workflow est requis');
    }
    
    // S'assurer que les champs obligatoires sont présents
    const dataToSend = {
      title: workflowData.title,
      content: workflowData.workflowContent,
      processId: workflowData.processId || 'Process_1',
      version: workflowData.version || 1,
      description: workflowData.description || `Workflow: ${workflowData.title}`,
      updatedBy: workflowData.updatedBy || 'user'
    };
    
    console.log(`Mise à jour du workflow ${id} avec les données:`, dataToSend);
    
    const response = await axios.put(`${API_URL}/workflows/${id}`, dataToSend, { 
      headers: {
        ...authHeader(),
        'Content-Type': 'application/json'
      } 
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating workflow with id ${id}:`, error);
    throw error;
  }
};

const deleteWorkflow = async (id) => {
  try {
    await axios.delete(`${API_URL}/workflows/${id}`, { headers: authHeader() });
    return true;
  } catch (error) {
    console.error(`Error deleting workflow with id ${id}:`, error);
    throw error;
  }
};

const autoFixGatewayIncomingFlow = async (id) => {
  try {
    const response = await axios.put(`${API_URL}/workflows/${id}/auto-fix-gateway-incoming-flow`, {}, { headers: authHeader() });
    return response.data;
  } catch (error) {
    console.error(`Error fixing gateway flows for workflow with id ${id}:`, error);
    throw error;
  }
};

const workflowService = {
  getAllWorkflows,
  getWorkflowById,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  autoFixGatewayIncomingFlow
};

export default workflowService; 