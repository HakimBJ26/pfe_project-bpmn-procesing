import axios from 'axios';
import authHeader from './authHeader';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8998';

const getAllDmns = async () => {
  try {
    const response = await axios.get(`${API_URL}/dmn`, { headers: authHeader() });
    return response.data;
  } catch (error) {
    console.error('Error fetching DMNs:', error);
    throw error;
  }
};

const getDmnById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/dmn/${id}`, { headers: authHeader() });
    return response.data;
  } catch (error) {
    console.error(`Error fetching DMN with id ${id}:`, error);
    throw error;
  }
};

const createDmn = async (dmnData) => {
  try {
    const response = await axios.post(`${API_URL}/dmn`, dmnData, { 
      headers: { 
        ...authHeader(),
        'Content-Type': 'application/json'
      } 
    });
    return response.data;
  } catch (error) {
    console.error('Error creating DMN:', error);
    throw error;
  }
};

const uploadDmnFile = async (file, name) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    if (name) {
      formData.append('name', name);
    }
    
    const response = await axios.post(`${API_URL}/dmn`, formData, {
      headers: {
        ...authHeader(),
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading DMN file:', error);
    throw error;
  }
};

const updateDmn = async (id, dmnData) => {
  try {
    const response = await axios.put(`${API_URL}/dmn/${id}`, dmnData, { 
      headers: { 
        ...authHeader(),
        'Content-Type': 'application/json'
      } 
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating DMN with id ${id}:`, error);
    throw error;
  }
};

const deleteDmn = async (id) => {
  try {
    await axios.delete(`${API_URL}/dmn/${id}`, { headers: authHeader() });
    return true;
  } catch (error) {
    console.error(`Error deleting DMN with id ${id}:`, error);
    throw error;
  }
};

const dmnService = {
  getAllDmns,
  getDmnById,
  createDmn,
  uploadDmnFile,
  updateDmn,
  deleteDmn
};

export default dmnService; 